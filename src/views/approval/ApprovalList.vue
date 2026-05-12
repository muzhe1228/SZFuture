<template>
  <div class="approval-list">
    <!-- Base Table Page -->
    <BaseTablePage
      :search-fields="searchFields"
      :columns="columns"
      :actions="tableActions"
      :fetch-data="fetchData"
      title="审批列表"
      storage-key="approval-list"
      :show-column-settings="true"
      :show-selection="true"
      @action="handleTableAction"
      @selection-change="handleSelectionChange"
    >
      <template #cell-status="{ row }">
        <StatusTag :status="row.status" :status-map="statusMap" size="small" />
      </template>
    </BaseTablePage>

    <!-- Approval Drawer -->
    <ApprovalDrawer
      v-model="drawerVisible"
      :approval="currentApproval"
      :title="drawerTitle"
      @pass="handleApprovalPass"
      @reject="handleApprovalReject"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { Approval } from '@/types/index'
  import { ElMessage } from 'element-plus'
  import { BaseTablePage } from '@/components/BaseTablePage'
  import { StatusTag } from '@/components/StatusTag'
  import ApprovalDrawer from '@/components/Dialog/ApprovalList/ApprovalDrawer.vue'
  import type { ActionButton } from '@/components/DataTable/types'
  import { approvalColumns } from '@/config/approval/columns'
  import { approvalSearchFields } from '@/config/approval/searchFields'
  import request from '@/utils/request'

  // ─── Extended Types ──────────────────────────────────────────────────────

  interface AuthInfo {
    customerName: string
    productModule: string
    subscribeFunction: string
    authType: string
    orderNo: string
    authNo: string
    hardwareBind: string
    bindDate: string
    authStartDate: string
    authEndDate: string
  }

  interface TimelineRecord {
    operator: string
    action: string
    time: string
    type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    color?: string
    result?: string
    resultType?: 'success' | 'danger' | 'warning' | 'info'
  }

  interface ExtendedApproval extends Approval {
    reason: string
    authInfo: AuthInfo
    records: TimelineRecord[]
  }

  // ─── Table Config ─────────────────────────────────────────────────────

  // 表格列配置已移至 @/config/approval/columns.ts
  const columns = ref(approvalColumns)

  const tableActions: ActionButton[] = [
    { key: 'view', label: '查看', type: 'primary', icon: 'IconShow' },
    { key: 'approve', label: '审批', type: 'danger', icon: 'IconApproval', condition: (row: ExtendedApproval) => row.status === '待审核' },
  ]

  // ─── Search Form ──────────────────────────────────────────────────────

  // 搜索字段配置已移至 @/config/approval/searchFields.ts
  const searchFields = approvalSearchFields

  // ─── Status Tag Type ──────────────────────────────────────────────────

  const statusMap = {
    待审核: 'success',
    已通过: 'primary',
    已拒绝: 'danger',
  }

  // ─── Table Data ───────────────────────────────────────────────────────

  const selectedApprovals = ref<Approval[]>([])

  const fetchData = async (formData?: Record<string, any>, page: number = 1, pageSize: number = 20) => {
    try {
      const result = await request.get('/api/approval/list', {
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
    } catch {
      ElMessage.error('加载数据失败')
      return { list: [], total: 0 }
    }
  }

  const handleSelectionChange = (selection: Approval[]) => {
    selectedApprovals.value = selection
  }

  const handleTableAction = (action: string, row: ExtendedApproval) => {
    if (action === 'view') {
      handleView(row)
    } else if (action === 'approve') {
      handleApprove(row)
    }
  }

  // ─── Drawer ───────────────────────────────────────────────────────────

  const drawerVisible = ref(false)
  const drawerTitle = ref('')
  const currentApproval = ref<ExtendedApproval | null>(null)

  const handleView = (row: ExtendedApproval) => {
    currentApproval.value = row
    drawerTitle.value = `审批详情 - ${row.authNo}`
    drawerVisible.value = true
  }

  const handleApprove = (row: ExtendedApproval) => {
    currentApproval.value = row
    drawerTitle.value = `审批 - ${row.authNo}`
    drawerVisible.value = true
  }

  // ─── Approval Event Handlers ──────────────────────────────────────────

  const handleApprovalPass = (_approval: ExtendedApproval) => {
    // 审批通过后的处理逻辑
    ElMessage.success('审批通过')
  }

  const handleApprovalReject = (_approval: ExtendedApproval) => {
    // 审批拒绝后的处理逻辑
    ElMessage.success('已拒绝该审批')
  }
</script>

<style lang="scss" scoped>
  .approval-list {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    border-radius: 8px;
  }
</style>
