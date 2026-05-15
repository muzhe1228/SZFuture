<template>
  <div class="trial-list">
    <!-- Base Table Page -->
    <BaseTablePage
      :search-fields="searchFields"
      :columns="columns"
      :actions="tableActions"
      :fetch-data="fetchData"
      title="试用列表"
      storage-key="trial-list"
      :show-column-settings="true"
      :show-selection="true"
      @action="handleTableAction"
      @selection-change="handleSelectionChange"
    >
      <template #cell-status="{ row }">
        <StatusTag :status="row.status" size="small" />
      </template>

      <template #extra-actions>
        <el-button type="primary" link @click="handleBatchFreeze" :disabled="selectedTrials.length === 0">
          授权冻结
        </el-button>
        <el-button type="info" link @click="handleBatchVoid" :disabled="selectedTrials.length === 0">
          授权作废
        </el-button>
        <el-button type="danger" link @click="handleBatchDelete" :disabled="selectedTrials.length === 0">
          删除试用
        </el-button>
      </template>
    </BaseTablePage>

    <!-- ==================== Modals ==================== -->

    <!-- 1. 产品试用信息 Modal (查看) -->
    <ViewModal v-model="viewModalVisible" :data="currentTrial || undefined" :title="`产品试用信息`" :columns="columns" />

    <!-- 2. 授权冻结 Modal -->
    <FreezeModal
      v-model="freezeModalVisible"
      :trial-id="currentTrial?.id || null"
      :selected-count="selectedTrials.length"
      @freeze="handleFreezeEvent"
    />

    <!-- 3. 授权解冻/更新 Modal -->
    <UnfreezeModal
      v-model="unfreezeModalVisible"
      :data="currentTrial"
      :id="currentTrial?.id || null"
      title="授权更新"
      reason-label="更新原因"
      placeholder="请输入更新原因"
      api-url="/api/trial/unfreeze"
      @unfreeze="handleUnfreezeEvent"
    />

    <!-- 4. 授权激活 Modal -->
    <ActivateModal
      v-model="activateModalVisible"
      :trial-id="currentTrial?.id || null"
      :license-key="currentTrial?.licenseKey"
      @activate="handleActivateEvent"
    />

    <!-- 5. 授权作废 Modal -->
    <VoidModal v-model="voidModalVisible" :selected-ids="selectedTrials.map((t) => t.id)" @void="handleVoidEvent" />

    <!-- 6. 删除试用 Modal -->
    <DeleteModal 
      mode="batch"
      v-model="deleteModalVisible" 
      :title-text="selectedTrials.length"
      :delete-api="deleteTrialApi"
      :id="selectedTrials.length"
      @success="handleDeleteSuccess"
    />

  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { Trial } from '@/types/index'
  import { ElMessage } from 'element-plus'
  import { BaseTablePage } from '@/components/BaseTablePage'
  import { StatusTag } from '@/components/StatusTag'
  import ViewModal from '@/components/Dialog/common/ViewModal.vue'
  import FreezeModal from '@/components/Dialog/common/FreezeModal.vue'
  import UnfreezeModal from '@/components/Dialog/common/UnfreezeModal.vue'
  import ActivateModal from '@/components/Dialog/common/ActivateModal.vue'
  import VoidModal from '@/components/Dialog/common/VoidModal.vue'
  import DeleteModal from '@/components/Dialog/common/DeleteModal.vue'
  import type { ActionButton } from '@/components/DataTable/types'
  import { trialColumns } from '@/config/trial/columns'
  import { trialSearchFields } from '@/config/trial/searchFields'
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

  // 表格列配置已移至 @/config/trial/columns.ts
  const columns = ref(trialColumns)

  const tableActions: ActionButton[] = [
    { key: 'view', label: '查看', type: 'primary', icon: 'IconShow' },
    { key: 'activate', label: '激活', type: 'success', icon: 'IconActive', condition: (row: TrialExtended) => row.status !== '已激活' },
    { key: 'freeze', label: '冻结', type: 'primary', icon: 'IconFreeze', condition: (row: TrialExtended) => row.status === '已激活' },
    { key: 'unfreeze', label: '更新', type: 'warning', icon: 'IconRefresh', condition: (row: TrialExtended) => row.status === '已冻结' },
  ]

  // ─── Search Form ──────────────────────────────────────────────────────

  // 搜索字段配置已移至 @/config/trial/searchFields.ts
  const searchFields = trialSearchFields

  // ─── Table Data ───────────────────────────────────────────────────────

  const tableLoading = ref(false)
  const selectedTrials = ref<TrialExtended[]>([])

  const fetchData = async (formData?: Record<string, any>, page: number = 1, pageSize: number = 20) => {
    tableLoading.value = true
    try {
      const result = await request.get('/api/trial/list', {
        params: {
          page: String(page),
          pageSize: String(pageSize),
          ...formData,
        },
      })
      if (result.code === 200) {
        return { list: result.data.list || [], total: result.data.total || 0 }
      }
      return { list: [], total: 0 }
    } catch (error) {
      ElMessage.error('加载数据失败')
      return { list: [], total: 0 }
    } finally {
      tableLoading.value = false
    }
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
  const deleteModalVisible = ref(false)

  const handleView = (row: TrialExtended) => {
    currentTrial.value = row
    viewModalVisible.value = true
  }

  // ─── 2. Freeze Modal ─────────────────────────────────────────────────

  const freezeModalVisible = ref(false)

  const handleBatchFreeze = () => {
    if (selectedTrials.value.length === 0) return
    currentTrial.value = null
    freezeModalVisible.value = true
  }

  const handleFreeze = (row: TrialExtended) => {
    currentTrial.value = row
    freezeModalVisible.value = true
  }

  // ─── 3. Unfreeze/Update Modal ─────────────────────────────────────────

  const unfreezeModalVisible = ref(false)

  const handleUnfreeze = (row: TrialExtended) => {
    currentTrial.value = row
    unfreezeModalVisible.value = true
  }

  // ─── 4. Activate Modal ───────────────────────────────────────────────

  const activateModalVisible = ref(false)

  const handleActivate = (row: TrialExtended) => {
    currentTrial.value = row
    activateModalVisible.value = true
  }

  // ─── 5. Void Modal ───────────────────────────────────────────────────

  const voidModalVisible = ref(false)

  const handleBatchVoid = () => {
    if (selectedTrials.value.length === 0) return
    currentTrial.value = null
    voidModalVisible.value = true
  }

  // ─── 6. Delete ─────────────────────────────────────────────────

  const handleBatchDelete = () => {
    if (selectedTrials.value.length === 0) return
    deleteModalVisible.value = true
  }

  const deleteTrialApi = async () => {
    const result = await request.delete('/api/trial/delete', {
      data: { ids: selectedTrials.value.map((t) => t.id) },
    })
    if (result.code !== 200) {
      throw new Error(result.message || '删除失败')
    }
  }

  const handleDeleteSuccess = () => {
    selectedTrials.value = []
  }

  // ─── Event Handlers for Modals ───────────────────────────────────────

  const handleFreezeEvent = async (_reason: string, _ids: number[]) => {
    // 处理冻结事件
    ElMessage.success('试用授权冻结成功')
  }

  const handleUnfreezeEvent = async (_reason: string, _id?: number) => {
    // 处理解冻事件
    ElMessage.success('试用授权更新成功')
  }

  const handleActivateEvent = async (_licenseKey: string, _deviceFingerprint: string, _id: number) => {
    // 处理激活事件
    ElMessage.success('激活码生成成功，试用已激活')
  }

  const handleVoidEvent = async (_reason: string, _approver: string, _ids: number[]) => {
    // 处理作废事件
    ElMessage.success('试用授权作废成功')
  }

  
</script>

<script lang="ts">
  export default {
    name: 'TrialList',
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
