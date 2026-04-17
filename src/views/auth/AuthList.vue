<template>
  <div class="auth-list">
    <!-- Search Bar -->
    <SearchForm
      :fields="searchFields"
      storage-key="auth-list-search"
      :search-loading="tableLoading"
      :reset-loading="tableLoading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Data Table -->
    <DataTable
      :columns="columns"
      :data="tableData"
      :loading="tableLoading"
      :total="pagination.total"
      :current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      title="授权管理"
      storage-key="auth-list-table"
      :show-column-settings="true"
      :show-selection="true"
      :actions="tableActions"
      row-key="id"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
      @action="handleTableAction"
    >
      <template #extra-actions>
        <el-button type="danger" size="small" @click="handleBatchImport" :icon="Upload">
          批量导入许可
        </el-button>
        <el-button type="primary" size="small" @click="handleBatchFreeze" :disabled="selectedAuths.length === 0">
          授权冻结
        </el-button>
        <el-button type="warning" size="small" @click="handleBatchExtend" :disabled="selectedAuths.length === 0">
          授权延期
        </el-button>
        <el-button type="info" size="small" @click="handleBatchVoid" :disabled="selectedAuths.length === 0">
          授权作废
        </el-button>
      </template>
      <template #cell-status="{ row }">
        <el-tag
          :type="getStatusType(row.status)"
          size="small"
        >
          {{ row.status }}
        </el-tag>
      </template>
    </DataTable>

    <!-- ==================== Modals ==================== -->

    <!-- 1. 批量导入许可 Modal -->
    <el-dialog
      v-model="importModalVisible"
      title="批量导入许可"
      width="520px"
      :close-on-click-modal="false"
      @close="resetImportModal"
    >
      <div class="import-modal">
        <div class="import-steps">
          <p class="step-item">
            <span class="step-num">1.</span>
            <el-link type="primary" :underline="false" @click="handleDownloadTemplate">
              下载 许可导入模版
            </el-link>
          </p>
          <p class="step-item">
            <span class="step-num">2.</span>
            按要求填写数据后导入
          </p>
        </div>
        <div class="upload-area">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".xls,.xlsx"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            drag
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              点击上传 <em>.xls / .xlsx</em> 文件
            </div>
          </el-upload>
        </div>
        <div v-if="uploadedFile" class="file-display">
          <el-icon class="file-check" :size="18"><CircleCheckFilled /></el-icon>
          <span class="file-name">{{ uploadedFile }}</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="importModalVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImportSubmit" :disabled="!uploadedFile">
            导入
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 2. 授权冻结 Modal -->
    <el-dialog
      v-model="freezeModalVisible"
      title="授权冻结"
      width="520px"
      :close-on-click-modal="false"
    >
      <div class="freeze-modal">
        <el-alert
          title="冻结后该授权暂时无法使用，可解冻"
          type="warning"
          :closable="false"
          show-icon
        />
        <el-form label-width="90px" label-position="right" class="modal-form">
          <el-form-item label="冻结原因">
            <el-input
              v-model="freezeForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请输入冻结原因"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="freezeModalVisible = false">取消</el-button>
          <el-button type="primary" @click="handleFreezeSubmit" :loading="freezeLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 3. 授权解冻 Modal -->
    <el-dialog
      v-model="unfreezeModalVisible"
      title="授权解冻"
      width="520px"
      :close-on-click-modal="false"
    >
      <div class="unfreeze-modal">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="冻结时间">
            {{ currentAuth?.freezeTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="冻结原因">
            {{ currentAuth?.freezeReason || '-' }}
          </el-descriptions-item>
        </el-descriptions>
        <el-form label-width="90px" label-position="right" class="modal-form">
          <el-form-item label="解冻原因">
            <el-input
              v-model="unfreezeForm.reason"
              type="textarea"
              :rows="4"
              placeholder="请输入解冻原因"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="unfreezeModalVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUnfreezeSubmit" :loading="unfreezeLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 4. 授权延期 Modal -->
    <el-dialog
      v-model="extendModalVisible"
      title="授权延期"
      width="520px"
      :close-on-click-modal="false"
    >
      <div class="extend-modal">
        <el-form label-width="120px" label-position="right">
          <el-form-item label="授权延长至:">
            <el-date-picker
              v-model="extendForm.extendTo"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="extendModalVisible = false">取消</el-button>
          <el-button type="primary" @click="handleExtendSubmit" :loading="extendLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 5. 授权作废 Modal -->
    <el-dialog
      v-model="voidModalVisible"
      title="授权作废"
      width="520px"
      :close-on-click-modal="false"
    >
      <div class="void-modal">
        <el-alert
          title="作废后该授权无法使用，无法恢复该操作"
          type="error"
          :closable="false"
          show-icon
        />
        <el-form label-width="90px" label-position="right" class="modal-form">
          <el-form-item label="作废原因">
            <el-input
              v-model="voidForm.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入作废原因"
            />
          </el-form-item>
          <el-form-item label="审批人员">
            <el-select v-model="voidForm.approver" placeholder="请选择审批人员" style="width: 100%">
              <el-option label="张经理" value="张经理" />
              <el-option label="李主管" value="李主管" />
              <el-option label="王总监" value="王总监" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="voidModalVisible = false">取消</el-button>
          <el-button type="primary" @click="handleVoidSubmit" :loading="voidLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 6. 产品授权信息 Modal (查看) -->
    <el-dialog
      v-model="viewModalVisible"
      title="产品授权信息"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="view-modal" v-if="currentAuth">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户名称">
            {{ currentAuth.customerName }}
          </el-descriptions-item>
          <el-descriptions-item label="授权编号">
            {{ currentAuth.authNo }}
          </el-descriptions-item>
          <el-descriptions-item label="绑定日期">
            {{ currentAuth.bindDate }}
          </el-descriptions-item>
          <el-descriptions-item label="授权起始日期">
            {{ currentAuth.authStartDate }}
          </el-descriptions-item>
          <el-descriptions-item label="授权结束日期">
            {{ currentAuth.authEndDate }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentAuth.status)" size="small">
              {{ currentAuth.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="产品" :span="2">
            {{ currentAuth.product || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="版本号" :span="2">
            {{ currentAuth.version || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="许可类型" :span="2">
            {{ currentAuth.licenseType || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ currentAuth.remarks || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewModalVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 7. 授权激活 Modal -->
    <el-dialog
      v-model="activateModalVisible"
      title="授权激活"
      width="520px"
      :close-on-click-modal="false"
    >
      <div class="activate-modal">
        <el-form label-width="100px" label-position="right">
          <el-form-item label="授权编号">
            <el-input
              v-model="activateForm.authNo"
              placeholder="请输入密钥"
              clearable
            />
          </el-form-item>
          <el-form-item label="离线激活码">
            <el-input
              v-model="activateForm.deviceFingerprint"
              placeholder="请输入设备指纹"
              clearable
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="activateModalVisible = false">取消</el-button>
          <el-button type="success" @click="handleGenerateActivationCode" :loading="activateLoading">
            生成激活码
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import {
  Upload,
  UploadFilled,
  CircleCheckFilled
} from '@element-plus/icons-vue'
import type { Authorization } from '@/types/index'
import { ElMessage } from 'element-plus'
import type { UploadFile, UploadInstance } from 'element-plus'
import request from '@/utils/request'
import SearchForm from '@/components/SearchForm.vue'
import { DataTable } from '@/components/DataTable'
import type { ColumnConfig, ActionButton } from '@/components/DataTable/types'
import type { SearchField } from '@/components/SearchForm/types'

// ─── Search Form ──────────────────────────────────────────────────────

const searchFields = computed<SearchField[]>(() => [
  {
    prop: 'customerName',
    label: '客户名称',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '客户名称客户名称', value: '客户名称客户名称' },
      { label: '测试客户A', value: '测试客户A' },
      { label: '测试客户B', value: '测试客户B' }
    ]
  },
  { prop: 'orderNo', label: '订单编号', type: 'input', placeholder: '请输入' },
  { prop: 'authNo', label: '授权编号', type: 'input', placeholder: '请输入' },
  {
    prop: 'product',
    label: '产品',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '产品A', value: '产品A' },
      { label: '产品B', value: '产品B' },
      { label: '产品C', value: '产品C' }
    ]
  },
  {
    prop: 'version',
    label: '版本号',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: 'V1.0', value: 'V1.0' },
      { label: 'V2.0', value: 'V2.0' },
      { label: 'V3.0', value: 'V3.0' }
    ]
  },
  {
    prop: 'licenseType',
    label: '许可类型',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '永久许可', value: '永久许可' },
      { label: '订阅许可', value: '订阅许可' },
      { label: '试用许可', value: '试用许可' }
    ]
  },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '已激活', value: '已激活' },
      { label: '未激活', value: '未激活' },
      { label: '已冻结', value: '已冻结' },
      { label: '已作废', value: '已作废' }
    ]
  },
  { prop: 'dateRange', label: '授权起止时间', type: 'datetimerange' }
])

const handleSearch = async (formData: Record<string, any>) => {
  pagination.currentPage = 1
  await fetchAuthList(formData)
}

const handleReset = async () => {
  pagination.currentPage = 1
  await fetchAuthList()
  ElMessage.success('重置成功')
}

// ─── Table Config ─────────────────────────────────────────────────────

const columns = ref<ColumnConfig[]>([
  { key: 'customerName', label: '客户名称', prop: 'customerName', minWidth: '140', visible: true },
  { key: 'authNo', label: '授权编号', prop: 'authNo', minWidth: '140', visible: true },
  { key: 'bindDate', label: '绑定日期', prop: 'bindDate', minWidth: '170', visible: true },
  { key: 'authStartDate', label: '授权起始日期', prop: 'authStartDate', minWidth: '170', visible: true },
  { key: 'authEndDate', label: '授权结束日期', prop: 'authEndDate', minWidth: '170', visible: true },
  { key: 'status', label: '状态', prop: 'status', minWidth: '100', align: 'center', visible: true, hasTemplate: true }
])

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary' },
  { key: 'activate', label: '激活', type: 'success', condition: (row: Authorization) => row.status !== '已激活' },
  { key: 'freeze', label: '冻结', type: 'primary', condition: (row: Authorization) => row.status === '已激活' },
  { key: 'unfreeze', label: '解冻', type: 'warning', condition: (row: Authorization) => row.status === '已冻结' },
  { key: 'extend', label: '延期', type: 'danger', condition: (row: Authorization) => row.status !== '已作废' },
  { key: 'void', label: '作废', type: 'info', condition: (row: Authorization) => row.status !== '已作废' }
]

const handleTableAction = (action: string, row: Authorization) => {
  if (action === 'view') {
    handleView(row)
  } else if (action === 'activate') {
    handleActivate(row)
  } else if (action === 'freeze') {
    handleFreeze(row)
  } else if (action === 'unfreeze') {
    handleUnfreeze(row as any)
  } else if (action === 'extend') {
    handleExtend(row)
  } else if (action === 'void') {
    handleVoid(row)
  }
}

const handlePageChange = (page: number, size: number) => {
  pagination.currentPage = page
  pagination.pageSize = size
  fetchAuthList()
}

// ─── Status Tag Type ──────────────────────────────────────────────────

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    '已激活': 'warning',
    '未激活': 'info',
    '已冻结': 'danger',
    '已作废': 'info',
    '已授权': 'success',
    '已过期': 'danger',
    '未授权': 'info',
    '已取消': 'info'
  }
  return (map[status] || 'info') as any
}

// ─── Table Data ───────────────────────────────────────────────────────

const tableLoading = ref(false)
const selectedAuths = ref<Authorization[]>([])
const tableData = ref<Authorization[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const fetchAuthList = async (formData?: Record<string, any>) => {
  tableLoading.value = true
  try {
    const response: any = await request.get('/api/auth/list', {
      params: {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...formData
      }
    })
    if (response.code === 200) {
      const rawList = response.data.list || []
      // Map API fields to local field names
      tableData.value = rawList.map((item: any) => ({
        id: item.id,
        customerName: item.customerName,
        authNo: item.authNo,
        bindDate: item.bindDate,
        authStartDate: item.authStartDate,
        authEndDate: item.authEndDate,
        status: item.status,
        product: item.productName,
        version: item.licenseType,
        licenseType: item.licenseType,
        remarks: item.remark || ''
      }))
      pagination.total = response.data.total || 0
    }
  } catch (error) {
    ElMessage.error('获取授权列表失败')
  } finally {
    tableLoading.value = false
  }
}

const handleSelectionChange = (selection: Authorization[]) => {
  selectedAuths.value = selection
}



// ─── Current Auth (for modals) ────────────────────────────────────────

const currentAuth = ref<Authorization & { freezeTime?: string; freezeReason?: string } | null>(null)

// ─── 1. Batch Import Modal ────────────────────────────────────────────

const importModalVisible = ref(false)
const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadFile[]>([])
const uploadedFile = ref('')

const handleBatchImport = () => {
  importModalVisible.value = true
}

const handleDownloadTemplate = () => {
  ElMessage.info('下载许可导入模版...')
}

const handleFileChange = (file: UploadFile) => {
  uploadedFile.value = file.name
}

const handleFileRemove = () => {
  uploadedFile.value = ''
  fileList.value = []
}

const handleImportSubmit = () => {
  ElMessage.success(`导入文件 "${uploadedFile.value}" 处理中...`)
  importModalVisible.value = false
}

const resetImportModal = () => {
  uploadedFile.value = ''
  fileList.value = []
  uploadRef.value?.clearFiles()
}

// ─── 2. Freeze Modal ─────────────────────────────────────────────────

const freezeModalVisible = ref(false)
const freezeForm = reactive({ reason: '' })
const freezeLoading = ref(false)

const handleBatchFreeze = () => {
  if (selectedAuths.value.length === 0) return
  currentAuth.value = null
  freezeForm.reason = ''
  freezeModalVisible.value = true
}

const handleFreeze = (row: Authorization) => {
  currentAuth.value = row as any
  freezeForm.reason = ''
  freezeModalVisible.value = true
}

const handleFreezeSubmit = async () => {
  if (!freezeForm.reason.trim()) {
    ElMessage.warning('请填写冻结原因')
    return
  }
  freezeLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 600))
  if (currentAuth.value) {
    const idx = tableData.value.findIndex(a => a.id === currentAuth.value!.id)
    if (idx !== -1) {
      tableData.value[idx].status = '已冻结'
    }
  }
  selectedAuths.value.forEach(auth => {
    const idx = tableData.value.findIndex(a => a.id === auth.id)
    if (idx !== -1) {
      tableData.value[idx].status = '已冻结'
    }
  })
  ElMessage.success('授权冻结成功')
  freezeModalVisible.value = false
  freezeLoading.value = false
}

// ─── 3. Unfreeze Modal ────────────────────────────────────────────────

const unfreezeModalVisible = ref(false)
const unfreezeForm = reactive({ reason: '' })
const unfreezeLoading = ref(false)

const handleUnfreeze = (row: Authorization & { freezeTime?: string; freezeReason?: string }) => {
  currentAuth.value = row
  unfreezeForm.reason = ''
  unfreezeModalVisible.value = true
}

const handleUnfreezeSubmit = async () => {
  if (!unfreezeForm.reason.trim()) {
    ElMessage.warning('请填写解冻原因')
    return
  }
  unfreezeLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 600))
  if (currentAuth.value) {
    const idx = tableData.value.findIndex(a => a.id === currentAuth.value!.id)
    if (idx !== -1) {
      tableData.value[idx].status = '已激活'
    }
  }
  ElMessage.success('授权解冻成功')
  unfreezeModalVisible.value = false
  unfreezeLoading.value = false
}

// ─── 4. Extend Modal ─────────────────────────────────────────────────

const extendModalVisible = ref(false)
const extendForm = reactive({ extendTo: '' })
const extendLoading = ref(false)

const handleBatchExtend = () => {
  if (selectedAuths.value.length === 0) return
  currentAuth.value = null
  extendForm.extendTo = ''
  extendModalVisible.value = true
}

const handleExtend = (row: Authorization) => {
  currentAuth.value = row
  extendForm.extendTo = ''
  extendModalVisible.value = true
}

const handleExtendSubmit = async () => {
  if (!extendForm.extendTo) {
    ElMessage.warning('请选择延长至的日期时间')
    return
  }
  extendLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 600))
  if (currentAuth.value) {
    const idx = tableData.value.findIndex(a => a.id === currentAuth.value!.id)
    if (idx !== -1) {
      tableData.value[idx].authEndDate = extendForm.extendTo
    }
  }
  selectedAuths.value.forEach(auth => {
    const idx = tableData.value.findIndex(a => a.id === auth.id)
    if (idx !== -1) {
      tableData.value[idx].authEndDate = extendForm.extendTo
    }
  })
  ElMessage.success('授权延期成功')
  extendModalVisible.value = false
  extendLoading.value = false
}

// ─── 5. Void Modal ───────────────────────────────────────────────────

const voidModalVisible = ref(false)
const voidForm = reactive({ reason: '', approver: '' })
const voidLoading = ref(false)

const handleBatchVoid = () => {
  if (selectedAuths.value.length === 0) return
  currentAuth.value = null
  voidForm.reason = ''
  voidForm.approver = ''
  voidModalVisible.value = true
}

const handleVoid = (row: Authorization) => {
  currentAuth.value = row
  voidForm.reason = ''
  voidForm.approver = ''
  voidModalVisible.value = true
}

const handleVoidSubmit = async () => {
  if (!voidForm.reason.trim()) {
    ElMessage.warning('请填写作废原因')
    return
  }
  if (!voidForm.approver) {
    ElMessage.warning('请选择审批人员')
    return
  }
  voidLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 600))
  if (currentAuth.value) {
    const idx = tableData.value.findIndex(a => a.id === currentAuth.value!.id)
    if (idx !== -1) {
      tableData.value[idx].status = '已作废'
    }
  }
  selectedAuths.value.forEach(auth => {
    const idx = tableData.value.findIndex(a => a.id === auth.id)
    if (idx !== -1) {
      tableData.value[idx].status = '已作废'
    }
  })
  ElMessage.success('授权作废成功')
  voidModalVisible.value = false
  voidLoading.value = false
}

// ─── 6. View Modal ───────────────────────────────────────────────────

const viewModalVisible = ref(false)

const handleView = (row: Authorization) => {
  currentAuth.value = row as any
  viewModalVisible.value = true
}

// ─── 7. Activate Modal ───────────────────────────────────────────────

const activateModalVisible = ref(false)
const activateForm = reactive({ authNo: '', deviceFingerprint: '' })
const activateLoading = ref(false)

const handleActivate = (row: Authorization) => {
  currentAuth.value = row
  activateForm.authNo = row.authNo
  activateForm.deviceFingerprint = ''
  activateModalVisible.value = true
}

const handleGenerateActivationCode = async () => {
  if (!activateForm.authNo.trim()) {
    ElMessage.warning('请输入密钥')
    return
  }
  if (!activateForm.deviceFingerprint.trim()) {
    ElMessage.warning('请输入设备指纹')
    return
  }
  activateLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  if (currentAuth.value) {
    const idx = tableData.value.findIndex(a => a.id === currentAuth.value!.id)
    if (idx !== -1) {
      tableData.value[idx].status = '已激活'
    }
  }
  ElMessage.success('激活码生成成功，授权已激活')
  activateModalVisible.value = false
  activateLoading.value = false
}

// ─── Lifecycle ────────────────────────────────────────────────────────

onMounted(() => {
  fetchAuthList()
})
</script>

<style lang="scss" scoped>
.auth-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}

// ─── Dialog Footer ──────────────────────────────────────────────────

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// ─── Import Modal ───────────────────────────────────────────────────

.import-modal {
  .import-steps {
    margin-bottom: 20px;

    .step-item {
      font-size: 14px;
      color: #303133;
      margin-bottom: 8px;
      line-height: 1.6;

      .step-num {
        font-weight: 600;
        margin-right: 4px;
      }
    }
  }

  .upload-area {
    margin-bottom: 16px;
  }

  .file-display {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: #f0f9eb;
    border-radius: 4px;

    .file-check {
      color: #67c23a;
      flex-shrink: 0;
    }

    .file-name {
      font-size: 14px;
      color: #303133;
    }
  }
}

// ─── Freeze / Void Modal ────────────────────────────────────────────

.freeze-modal,
.void-modal {
  .el-alert {
    margin-bottom: 20px;
  }
}

.modal-form {
  margin-top: 16px;
}

// ─── Unfreeze Modal ─────────────────────────────────────────────────

.unfreeze-modal {
  .el-descriptions {
    margin-bottom: 20px;
  }
}

// ─── View Modal ─────────────────────────────────────────────────────

.view-modal {
  .el-descriptions {
    --el-descriptions-item-bordered-label-background: #fafafa;
  }
}
</style>
