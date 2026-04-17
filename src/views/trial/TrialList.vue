<template>
  <div class="trial-list">
    <!-- Search Bar -->
    <SearchForm :fields="searchFields" storage-key="trial-list-search" @search="handleSearch" @reset="handleReset"
      :search-loading="tableLoading" :reset-loading="tableLoading" />

    <!-- Data Table -->
    <DataTable
      :columns="columns"
      :data="tableData"
      :loading="tableLoading"
      :total="pagination.total"
      :current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      title="试用列表"
      storage-key="trial-list-table"
      :show-column-settings="true"
      :show-selection="true"
      :actions="tableActions"
      row-key="id"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
      @action="handleTableAction"
    >
      <template #cell-status="{ row }">
        <el-tag :type="getStatusType(row.status)" size="small">
          {{ row.status }}
        </el-tag>
      </template>

      <template #extra-actions>
        <el-button type="primary" size="small" @click="handleBatchFreeze" :disabled="selectedTrials.length === 0">
          授权冻结
        </el-button>
        <el-button type="info" size="small" @click="handleBatchVoid" :disabled="selectedTrials.length === 0">
          授权作废
        </el-button>
        <el-button type="danger" size="small" @click="handleBatchDelete" :disabled="selectedTrials.length === 0">
          删除试用
        </el-button>
      </template>
    </DataTable>

    <!-- ==================== Modals ==================== -->

    <!-- 1. 产品试用信息 Modal (查看) -->
    <el-dialog v-model="viewModalVisible" title="产品试用信息" width="600px" :close-on-click-modal="false">
      <div class="view-modal" v-if="currentTrial">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="客户名称">
            {{ currentTrial.customerName }}
          </el-descriptions-item>
          <el-descriptions-item label="手机号">
            {{ currentTrial.phone }}
          </el-descriptions-item>
          <el-descriptions-item label="绑定日期">
            {{ currentTrial.bindDate }}
          </el-descriptions-item>
          <el-descriptions-item label="授权起始日期">
            {{ currentTrial.authStartDate }}
          </el-descriptions-item>
          <el-descriptions-item label="授权结束日期">
            {{ currentTrial.authEndDate }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentTrial.status)" size="small">
              {{ currentTrial.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="License Key" :span="2">
            {{ currentTrial.licenseKey || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="产品" :span="2">
            {{ currentTrial.product || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="版本号" :span="2">
            {{ currentTrial.version || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ currentTrial.remarks || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewModalVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 2. 授权冻结 Modal -->
    <el-dialog v-model="freezeModalVisible" title="授权冻结" width="520px" :close-on-click-modal="false">
      <div class="freeze-modal">
        <el-alert title="冻结后该试用授权暂时无法使用，可解冻恢复" type="warning" :closable="false" show-icon />
        <el-form label-width="90px" label-position="right" class="modal-form">
          <el-form-item label="冻结原因">
            <el-input v-model="freezeForm.reason" type="textarea" :rows="4" placeholder="请输入冻结原因" />
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

    <!-- 3. 授权解冻/更新 Modal -->
    <el-dialog v-model="unfreezeModalVisible" title="授权更新" width="520px" :close-on-click-modal="false">
      <div class="unfreeze-modal">
        <el-descriptions :column="1" border v-if="currentTrial">
          <el-descriptions-item label="冻结时间">
            {{ currentTrial.freezeTime || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="冻结原因">
            {{ currentTrial.freezeReason || '-' }}
          </el-descriptions-item>
        </el-descriptions>
        <el-form label-width="90px" label-position="right" class="modal-form">
          <el-form-item label="更新原因">
            <el-input v-model="unfreezeForm.reason" type="textarea" :rows="4" placeholder="请输入更新原因" />
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

    <!-- 4. 授权激活 Modal -->
    <el-dialog v-model="activateModalVisible" title="试用激活" width="520px" :close-on-click-modal="false">
      <div class="activate-modal">
        <el-form label-width="100px" label-position="right">
          <el-form-item label="License Key">
            <el-input v-model="activateForm.licenseKey" placeholder="请输入 License Key" clearable />
          </el-form-item>
          <el-form-item label="设备指纹">
            <el-input v-model="activateForm.deviceFingerprint" placeholder="请输入设备指纹" clearable />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="activateModalVisible = false">取消</el-button>
          <el-button type="success" @click="handleActivateSubmit" :loading="activateLoading">
            生成激活码
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 5. 授权作废 Modal -->
    <el-dialog v-model="voidModalVisible" title="授权作废" width="520px" :close-on-click-modal="false">
      <div class="void-modal">
        <el-alert title="作废后该试用授权无法使用，无法恢复该操作" type="error" :closable="false" show-icon />
        <el-form label-width="90px" label-position="right" class="modal-form">
          <el-form-item label="作废原因">
            <el-input v-model="voidForm.reason" type="textarea" :rows="3" placeholder="请输入作废原因" />
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

    <!-- 6. 删除试用确认 Modal -->
    <el-dialog v-model="deleteModalVisible" title="删除试用" width="480px" :close-on-click-modal="false">
      <div class="delete-modal">
        <el-alert :title="`确定要删除选中的 ${selectedTrials.length} 条试用记录吗？此操作不可恢复`" type="error" :closable="false"
          show-icon />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteModalVisible = false">取消</el-button>
          <el-button type="danger" @click="handleDeleteSubmit" :loading="deleteLoading">
            确定删除
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import type { Trial } from '@/types/index'
import { ElMessage } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { DataTable } from '@/components/DataTable'
import type { ColumnConfig, ActionButton } from '@/components/DataTable/types'
import type { SearchField } from '@/components/SearchForm/types'
import request from '@/utils/request'

// ─── Extended Types ──────────────────────────────────────────────────────

interface TrialExtended extends Trial {
  licenseKey?: string
  product?: string
  version?: string
  remarks?: string
  freezeTime?: string
  freezeReason?: string
}

// ─── Table Config ─────────────────────────────────────────────────────

const columns = ref<ColumnConfig[]>([
  { key: 'customerName', label: '客户名称', prop: 'customerName', minWidth: '140', visible: true },
  { key: 'phone', label: '手机号', prop: 'phone', minWidth: '130', visible: true },
  { key: 'bindDate', label: '绑定日期', prop: 'bindDate', minWidth: '170', visible: true },
  { key: 'authStartDate', label: '授权起始日期', prop: 'authStartDate', minWidth: '170', visible: true },
  { key: 'authEndDate', label: '授权结束日期', prop: 'authEndDate', minWidth: '170', visible: true },
  { key: 'status', label: '状态', prop: 'status', width: '100', align: 'center', visible: true, hasTemplate: true }
])

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary' },
  { key: 'activate', label: '激活', type: 'success', condition: (row: TrialExtended) => row.status !== '已激活' },
  { key: 'freeze', label: '冻结', type: 'primary', condition: (row: TrialExtended) => row.status === '已激活' },
  { key: 'unfreeze', label: '更新', type: 'warning', condition: (row: TrialExtended) => row.status === '已冻结' }
]

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
  { prop: 'phone', label: '手机号', type: 'input', placeholder: '请输入' },
  {
    prop: 'licenseKey',
    label: 'License Key',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: 'LK-20260125-001', value: 'LK-20260125-001' },
      { label: 'LK-20260201-002', value: 'LK-20260201-002' },
      { label: 'LK-20260210-003', value: 'LK-20260210-003' }
    ]
  },
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
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '已激活', value: '已激活' },
      { label: '未激活', value: '未激活' },
      { label: '已过期', value: '已过期' }
    ]
  },
  { prop: 'dateRange', label: '授权起止时间', type: 'datetimerange' }
])

const searchParams = ref<Record<string, any>>({})

const handleSearch = (formData: Record<string, any>) => {
  searchParams.value = { ...formData }
  pagination.currentPage = 1
  fetchData()
}

const handleReset = () => {
  searchParams.value = {}
  pagination.currentPage = 1
  fetchData()
  ElMessage.success('重置成功')
}

// ─── Status Tag Type ──────────────────────────────────────────────────

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    '已激活': 'warning',
    '未激活': 'info',
    '已过期': 'info',
    '已冻结': 'danger'
  }
  return (map[status] || 'info') as any
}

// ─── Table Data ───────────────────────────────────────────────────────

const tableLoading = ref(false)
const selectedTrials = ref<TrialExtended[]>([])
const tableData = ref<TrialExtended[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const fetchData = async () => {
  tableLoading.value = true
  try {
    const result = await request.get('/api/trial/list', {
      params: {
        page: String(pagination.currentPage),
        pageSize: String(pagination.pageSize),
        ...searchParams.value
      }
    })
    if (result.code === 200) {
      tableData.value = result.data.list || []
      pagination.total = result.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    tableLoading.value = false
  }
}

const handlePageChange = (page: number, size: number) => {
  pagination.currentPage = page
  pagination.pageSize = size
  fetchData()
}

const handleSelectionChange = (selection: TrialExtended[]) => {
  selectedTrials.value = selection
}

const handleTableAction = (action: string, row: TrialExtended) => {
  if (action === 'view') {
    handleView(row)
  } else if (action === 'activate') {
    handleActivate(row)
  } else if (action === 'freeze') {
    handleFreeze(row)
  } else if (action === 'unfreeze') {
    handleUnfreeze(row)
  }
}

// ─── Current Trial (for modals) ───────────────────────────────────────

const currentTrial = ref<TrialExtended | null>(null)

// ─── 1. View Modal ───────────────────────────────────────────────────

const viewModalVisible = ref(false)

const handleView = (row: TrialExtended) => {
  currentTrial.value = row
  viewModalVisible.value = true
}

// ─── 2. Freeze Modal ─────────────────────────────────────────────────

const freezeModalVisible = ref(false)
const freezeForm = reactive({ reason: '' })
const freezeLoading = ref(false)

const handleBatchFreeze = () => {
  if (selectedTrials.value.length === 0) return
  currentTrial.value = null
  freezeForm.reason = ''
  freezeModalVisible.value = true
}

const handleFreeze = (row: TrialExtended) => {
  currentTrial.value = row
  freezeForm.reason = ''
  freezeModalVisible.value = true
}

const handleFreezeSubmit = async () => {
  if (!freezeForm.reason.trim()) {
    ElMessage.warning('请填写冻结原因')
    return
  }
  freezeLoading.value = true
  try {
    const response = await fetch('/api/trial/freeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ids: currentTrial.value ? [currentTrial.value.id] : selectedTrials.value.map(t => t.id),
        reason: freezeForm.reason
      })
    })
    const result = await response.json()
    if (result.code === 200) {
      if (currentTrial.value) {
        const idx = tableData.value.findIndex(t => t.id === currentTrial.value!.id)
        if (idx !== -1) {
          tableData.value[idx].status = '已冻结'
        }
      }
      selectedTrials.value.forEach(trial => {
        const idx = tableData.value.findIndex(t => t.id === trial.id)
        if (idx !== -1) {
          tableData.value[idx].status = '已冻结'
        }
      })
      ElMessage.success('试用授权冻结成功')
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    freezeModalVisible.value = false
    freezeLoading.value = false
  }
}

// ─── 3. Unfreeze/Update Modal ─────────────────────────────────────────

const unfreezeModalVisible = ref(false)
const unfreezeForm = reactive({ reason: '' })
const unfreezeLoading = ref(false)

const handleUnfreeze = (row: TrialExtended) => {
  currentTrial.value = row
  unfreezeForm.reason = ''
  unfreezeModalVisible.value = true
}

const handleUnfreezeSubmit = async () => {
  if (!unfreezeForm.reason.trim()) {
    ElMessage.warning('请填写更新原因')
    return
  }
  unfreezeLoading.value = true
  try {
    const response = await fetch('/api/trial/unfreeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: currentTrial.value?.id, reason: unfreezeForm.reason })
    })
    const result = await response.json()
    if (result.code === 200) {
      if (currentTrial.value) {
        const idx = tableData.value.findIndex(t => t.id === currentTrial.value!.id)
        if (idx !== -1) {
          tableData.value[idx].status = '已激活'
        }
      }
      ElMessage.success('试用授权更新成功')
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    unfreezeModalVisible.value = false
    unfreezeLoading.value = false
  }
}

// ─── 4. Activate Modal ───────────────────────────────────────────────

const activateModalVisible = ref(false)
const activateForm = reactive({ licenseKey: '', deviceFingerprint: '' })
const activateLoading = ref(false)

const handleActivate = (row: TrialExtended) => {
  currentTrial.value = row
  activateForm.licenseKey = row.licenseKey || ''
  activateForm.deviceFingerprint = ''
  activateModalVisible.value = true
}

const handleActivateSubmit = async () => {
  if (!activateForm.licenseKey.trim()) {
    ElMessage.warning('请输入 License Key')
    return
  }
  if (!activateForm.deviceFingerprint.trim()) {
    ElMessage.warning('请输入设备指纹')
    return
  }
  activateLoading.value = true
  try {
    const response = await fetch('/api/trial/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: currentTrial.value?.id,
        ...activateForm
      })
    })
    const result = await response.json()
    if (result.code === 200) {
      if (currentTrial.value) {
        const idx = tableData.value.findIndex(t => t.id === currentTrial.value!.id)
        if (idx !== -1) {
          tableData.value[idx].status = '已激活'
        }
      }
      ElMessage.success('激活码生成成功，试用已激活')
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    activateModalVisible.value = false
    activateLoading.value = false
  }
}

// ─── 5. Void Modal ───────────────────────────────────────────────────

const voidModalVisible = ref(false)
const voidForm = reactive({ reason: '', approver: '' })
const voidLoading = ref(false)

const handleBatchVoid = () => {
  if (selectedTrials.value.length === 0) return
  currentTrial.value = null
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
  try {
    const response = await fetch('/api/trial/void', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ids: selectedTrials.value.map(t => t.id),
        reason: voidForm.reason,
        approver: voidForm.approver
      })
    })
    const result = await response.json()
    if (result.code === 200) {
      selectedTrials.value.forEach(trial => {
        const idx = tableData.value.findIndex(t => t.id === trial.id)
        if (idx !== -1) {
          tableData.value[idx].status = '已过期'
        }
      })
      ElMessage.success('试用授权作废成功')
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    voidModalVisible.value = false
    voidLoading.value = false
  }
}

// ─── 6. Delete Modal ─────────────────────────────────────────────────

const deleteModalVisible = ref(false)
const deleteLoading = ref(false)

const handleBatchDelete = async () => {
  if (selectedTrials.value.length === 0) return
  deleteModalVisible.value = true
}

const handleDeleteSubmit = async () => {
  deleteLoading.value = true
  try {
    const response = await fetch('/api/trial/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedTrials.value.map(t => t.id) })
    })
    const result = await response.json()
    if (result.code === 200) {
      ElMessage.success(`已成功删除 ${selectedTrials.value.length} 条试用记录`)
      selectedTrials.value = []
      fetchData()
    }
  } catch {
    ElMessage.error('删除失败')
  } finally {
    deleteModalVisible.value = false
    deleteLoading.value = false
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────

onMounted(() => {
  fetchData()
})
</script>

<script lang="ts">
export default {
  name: 'TrialList'
}
</script>

<style lang="scss" scoped>
.trial-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.freeze-modal {
  .el-alert {
    margin-bottom: 20px;
  }
}

.modal-form {
  margin-top: 16px;
}

.unfreeze-modal {
  .el-descriptions {
    margin-bottom: 20px;
  }
}

.void-modal {
  .el-alert {
    margin-bottom: 20px;
  }
}

.delete-modal {
  .el-alert {
    margin-bottom: 0;
  }
}

.view-modal {
  .el-descriptions {
    --el-descriptions-item-bordered-label-background: #fafafa;
  }
}
</style>