<template>
  <div class="operation-logs">
    <!-- Base Table Page -->
    <BaseTablePage
      :search-fields="searchFields"
      :columns="columns"
      :actions="tableActions"
      :fetch-data="fetchData"
      title="操作日志"
      storage-key="operation-logs"
      :show-column-settings="true"
      :show-selection="true"
      @action="handleTableAction"
      @selection-change="handleSelectionChange"
    >
      <template #cell-duration="{ row }">
        <span class="duration-badge">{{ row.duration }} ms</span>
      </template>
      <template #cell-method="{ row }">
        <el-tooltip :content="row.method" placement="top">
          <span class="text-ellipsis">{{ row.method }}</span>
        </el-tooltip>
      </template>
      <template #cell-params="{ row }">
        <el-tooltip :content="row.params" placement="top">
          <span class="text-ellipsis">{{ row.params }}</span>
        </el-tooltip>
      </template>
      <template #cell-location="{ row }">
        <el-tooltip :content="row.location" placement="top">
          <span class="text-ellipsis">{{ row.location }}</span>
        </el-tooltip>
      </template>
    </BaseTablePage>

    <!-- Delete Log Modal -->
    <DeleteModal 
      v-model="deleteModalVisible" 
      :title-text="deleteModalTitle"
      :delete-api="deleteLogApi"
      :id="currentLog?.id"
      @success="handleDeleteSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import { BaseTablePage } from '@/components/BaseTablePage'
  import DeleteModal from '@/components/Dialog/common/DeleteModal.vue'
  import type { ActionButton } from '@/components/DataTable/types'
  import { operationLogColumns } from '@/config/audit/columns'
  import { operationLogSearchFields } from '@/config/audit/searchFields'
  import type { OperationLog } from '@/types/index'
  import request from '@/utils/request'

  const selectedRows = ref<OperationLog[]>([])
  const deleteModalVisible = ref(false)
  const currentLog = ref<OperationLog | null>(null)

  const deleteModalTitle = computed(() => {
    if (currentLog.value) {
      return `确定要删除操作人 "${currentLog.value.operator}" 的日志记录吗？`
    }
    return `确定要删除选中的 ${selectedRows.value.length} 条日志记录吗？`
  })

  // ─── Table Config ─────────────────────────────────────────────────────

  // 表格列配置已移至 @/config/audit/columns.ts
  const columns = ref(operationLogColumns)

  const tableActions: ActionButton[] = [{ key: 'delete', label: '删除', type: 'danger', icon: 'IconDel' }]

  const handleTableAction = (action: string, row: OperationLog) => {
    if (action === 'delete') {
      handleDelete(row)
    }
  }

  // 搜索字段配置已移至 @/config/audit/searchFields.ts
  const searchFields = operationLogSearchFields

  const fetchData = async (formData?: Record<string, any>, page: number = 1, pageSize: number = 20) => {
    try {
      const result = await request.get('/api/log/operation/list', {
        params: {
          page: String(page),
          pageSize: String(pageSize),
          ...formData,
        },
      })
      if (result.code === 200) {
        // 映射mock数据中的字段到OperationLog类型
        const list = (result.data.list || []).map((item: any) => ({
          id: item.id,
          operator: item.operator,
          description: item.operationDesc,
          duration: parseInt(item.executionTime) || 0,
          method: item.requestMethod,
          params: item.requestParams,
          ipAddress: item.ip,
          location: item.browser || '',
          createTime: item.operationTime,
        }))
        return {
          list,
          total: result.data.total || 0,
        }
      }
      return { list: [], total: 0 }
    } catch {
      ElMessage.error('加载数据失败')
      return { list: [], total: 0 }
    }
  }

  const handleSelectionChange = (selection: OperationLog[]) => {
    selectedRows.value = selection
  }

  const handleDelete = async (row: OperationLog) => {
    currentLog.value = row
    deleteModalVisible.value = true
  }

  const deleteLogApi = async (id: number) => {
    const result = await request.delete('/api/log/operation/delete', { params: { id } })
    if (result.code !== 200) {
      throw new Error('删除失败')
    }
  }

  const handleDeleteSuccess = () => {
    currentLog.value = null
  }
</script>

<style lang="scss" scoped>
  .operation-logs {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    border-radius: 8px;

    .duration-badge {
      display: inline-block;
      padding: 2px 10px;
      background: #e8f5e9;
      color: #4caf50;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .text-ellipsis {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
