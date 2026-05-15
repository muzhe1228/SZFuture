<template>
  <div class="auth-list">
    <!-- Base Table Page -->
    <BaseTablePage :search-fields="searchFields" :columns="columns" :actions="tableActions" :fetch-data="fetchAuthList"
      title="授权管理" storage-key="auth-list" :show-column-settings="true" :show-selection="true"
      @action="handleTableAction" @selection-change="handleSelectionChange">
      <template #cell-status="{ row }">
        <StatusTag :status="row.status" size="small" />
      </template>
      <template #extra-actions>
        <el-button type="danger" link @click="handleBatchImport" :icon="Upload"> 批量导入许可 </el-button>
        <el-button type="primary" link @click="handleBatchFreeze" :disabled="selectedAuths.length === 0">
          授权冻结
        </el-button>
        <el-button type="warning" link @click="handleBatchExtend" :disabled="selectedAuths.length === 0">
          授权延期
        </el-button>
        <el-button type="info" link @click="handleBatchVoid" :disabled="selectedAuths.length === 0">
          授权作废
        </el-button>
      </template>
    </BaseTablePage>

    <!-- ==================== Modals ==================== -->

    <!-- 1. 批量导入许可 Modal -->
    <ImportModal v-model="importModalVisible" @import="handleImportSubmit" />

    <!-- 2. 授权冻结 Modal -->
    <FreezeModal v-model="freezeModalVisible" @freeze="handleFreezeSubmit" />

    <!-- 3. 授权解冻 Modal -->
    <UnfreezeModal v-model="unfreezeModalVisible" :data="currentAuth" @unfreeze="handleUnfreezeSubmit" />

    <!-- 4. 授权延期 Modal -->
    <ExtendModal v-model="extendModalVisible" @extend="handleExtendSubmit" />

    <!-- 5. 授权作废 Modal -->
    <VoidModal v-model="voidModalVisible" :data="currentAuth || undefined" @void="handleVoidSubmit" />

    <!-- 6. 授权查看 Modal -->
    <ViewModal v-model="viewModalVisible" :data="currentAuth || undefined" :title="`产品授权信息`" :columns="columns" />

    <!-- 7. 授权激活 Modal -->
    <ActivateModal v-model="activateModalVisible" :auth-no="currentAuth?.authNo" @activate="handleActivateSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import type { Authorization } from '@/types/index'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { BaseTablePage } from '@/components/BaseTablePage'
import { StatusTag } from '@/components/StatusTag'
import ImportModal from '@/components/Dialog/AuthList/ImportModal.vue'
import ViewModal from '@/components/Dialog/common/ViewModal.vue'
import FreezeModal from '@/components/Dialog/common/FreezeModal.vue'
import UnfreezeModal from '@/components/Dialog/common/UnfreezeModal.vue'
import ExtendModal from '@/components/Dialog/AuthList/ExtendModal.vue'
import VoidModal from '@/components/Dialog/common/VoidModal.vue'
import ActivateModal from '@/components/Dialog/common/ActivateModal.vue'
import type { ActionButton } from '@/components/DataTable/types'
import { authColumns } from '@/config/auth/columns'
import { authSearchFields } from '@/config/auth/searchFields'

// ─── Search Form ──────────────────────────────────────────────────────

// 搜索字段配置已移至 @/config/auth/searchFields.ts
const searchFields = authSearchFields

// ─── Table Config ─────────────────────────────────────────────────────

// 表格列配置已移至 @/config/auth/columns.ts
const columns = ref(authColumns)

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary', icon: 'IconShow' },
  { key: 'activate', label: '激活', type: 'success', icon: 'IconActive', condition: (row: Authorization) => row.status !== '已激活' },
  { key: 'freeze', label: '冻结', type: 'primary', icon: 'IconFreeze', condition: (row: Authorization) => row.status === '已激活' },
  { key: 'unfreeze', label: '解冻', type: 'warning', icon: 'IconDel', condition: (row: Authorization) => row.status === '已冻结' },
  { key: 'extend', label: '延期', type: 'danger', icon: 'IconDelay', condition: (row: Authorization) => row.status !== '已作废' },
  { key: 'void', label: '作废', type: 'info', icon: 'IconVoid', condition: (row: Authorization) => row.status !== '已作废' },
]

// ─── Table Data ───────────────────────────────────────────────────────

const selectedAuths = ref<Authorization[]>([])

const fetchAuthList = async (formData?: Record<string, any>, page: number = 1, pageSize: number = 20) => {
  try {
    const response: any = await request.get('/api/auth/list', {
      params: {
        page,
        pageSize,
        ...formData,
      },
    })
    if (response.code === 200) {
      const rawList = response.data.list || []
      // Map API fields to local field names
      const list = rawList.map((item: any) => ({
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
        remarks: item.remark || '',
      }))
      return { list, total: response.data.total || 0 }
    }
    return { list: [], total: 0 }
  } catch {
    ElMessage.error('获取授权列表失败')
    return { list: [], total: 0 }
  }
}

const handleSelectionChange = (selection: Authorization[]) => {
  selectedAuths.value = selection
}

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

// ─── Current Auth (for modals) ────────────────────────────────────────

const currentAuth = ref<(Authorization & { freezeTime?: string; freezeReason?: string }) | null>(null)

// ─── Modal Visibility ─────────────────────────────────────────────────

const importModalVisible = ref(false)
const freezeModalVisible = ref(false)
const unfreezeModalVisible = ref(false)
const extendModalVisible = ref(false)
const voidModalVisible = ref(false)
const viewModalVisible = ref(false)
const activateModalVisible = ref(false)

// ─── Batch Actions ───────────────────────────────────────────────────

const handleBatchImport = () => {
  importModalVisible.value = true
}

const handleBatchFreeze = () => {
  if (selectedAuths.value.length === 0) return
  currentAuth.value = null
  freezeModalVisible.value = true
}

const handleBatchExtend = () => {
  if (selectedAuths.value.length === 0) return
  currentAuth.value = null
  extendModalVisible.value = true
}

const handleBatchVoid = () => {
  if (selectedAuths.value.length === 0) return
  currentAuth.value = null
  voidModalVisible.value = true
}

// ─── Single Actions ──────────────────────────────────────────────────

const handleView = (row: Authorization) => {
  currentAuth.value = row as any
  viewModalVisible.value = true
}

const handleActivate = (row: Authorization) => {
  currentAuth.value = row
  activateModalVisible.value = true
}

const handleFreeze = (row: Authorization) => {
  currentAuth.value = row as any
  freezeModalVisible.value = true
}

const handleUnfreeze = (row: Authorization & { freezeTime?: string; freezeReason?: string }) => {
  currentAuth.value = row
  unfreezeModalVisible.value = true
}

const handleExtend = (row: Authorization) => {
  currentAuth.value = row
  extendModalVisible.value = true
}

const handleVoid = (row: Authorization) => {
  currentAuth.value = row
  voidModalVisible.value = true
}

// ─── Modal Event Handlers ────────────────────────────────────────────

const handleImportSubmit = (fileName: string) => {
  // 处理导入逻辑
  ElMessage.success(`导入文件 "${fileName}" 处理中...`)
}

const handleFreezeSubmit = (_reason: string) => {
  // 处理冻结逻辑
  ElMessage.success('授权冻结成功')
}

const handleUnfreezeSubmit = (_reason: string) => {
  // 处理解冻逻辑
  ElMessage.success('授权解冻成功')
}

const handleExtendSubmit = (_extendTo: string) => {
  // 处理延期逻辑
  ElMessage.success('授权延期成功')
}

const handleVoidSubmit = (_reason: string, _approver: string) => {
  // 处理作废逻辑
  ElMessage.success('授权作废成功')
}

const handleActivateSubmit = (_authNo: string, _deviceFingerprint: string) => {
  // 处理激活逻辑
  ElMessage.success('激活码生成成功，授权已激活')
}
</script>

<style lang="scss" scoped>
.auth-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}
</style>
