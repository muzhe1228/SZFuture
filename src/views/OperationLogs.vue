<template>
  <div class="operation-logs">
    <!-- Search Bar -->
    <SearchForm :fields="searchFields" storage-key="operation-logs-search" @search="handleSearch" @reset="handleReset"
      :search-loading="tableLoading" :reset-loading="tableLoading" />

    <!-- Data Table -->
    <DataTable
      :columns="columns"
      :data="tableData"
      :loading="tableLoading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="[10, 20, 50, 100]"
      title="操作日志"
      storage-key="operation-logs-table"
      :show-column-settings="true"
      :show-selection="true"
      :actions="tableActions"
      row-key="id"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
      @action="handleTableAction"
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
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { DataTable } from '@/components/DataTable'
import type { ActionButton } from '@/components/DataTable/types'
import { operationLogColumns } from '@/config/audit/columns'
import { operationLogSearchFields } from '@/config/audit/searchFields'
import type { OperationLog } from '@/types/index'
import request from '@/utils/request'

const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const selectedRows = ref<OperationLog[]>([])
const tableData = ref<OperationLog[]>([])
const searchParams = ref<Record<string, any>>({})

// ─── Table Config ─────────────────────────────────────────────────────

// 表格列配置已移至 @/config/audit/columns.ts
const columns = ref(operationLogColumns)

const tableActions: ActionButton[] = [
  { key: 'delete', label: '删除', type: 'danger', icon: Delete }
]

const handleTableAction = (action: string, row: OperationLog) => {
  if (action === 'delete') {
    handleDelete(row)
  }
}

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  fetchData()
}

// 搜索字段配置已移至 @/config/audit/searchFields.ts
const searchFields = operationLogSearchFields

const fetchData = async () => {
  tableLoading.value = true
  try {
    const result = await request.get('/api/log/operation/list', {
      params: {
        page: String(currentPage.value),
        pageSize: String(pageSize.value),
        ...searchParams.value
      }
    })
    console.log(result)
    if (result.code === 200) {
      // 映射mock数据中的字段到OperationLog类型
      tableData.value = (result.data.list || []).map((item: any) => ({
        id: item.id,
        operator: item.operator,
        description: item.operationDesc,
        duration: parseInt(item.executionTime) || 0,
        method: item.requestMethod,
        params: item.requestParams,
        ipAddress: item.ip,
        location: item.browser || '',
        createTime: item.operationTime
      }))
      total.value = result.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    tableLoading.value = false
  }
}

const handleSearch = (formData: Record<string, any>) => {
  searchParams.value = { ...formData }
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  searchParams.value = {}
  currentPage.value = 1
  fetchData()
  ElMessage.success('重置成功')
}

const handleSelectionChange = (selection: OperationLog[]) => {
  selectedRows.value = selection
}

const handleDelete = async (row: OperationLog) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除操作人 "${row.operator}" 的日志记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const result = await request.delete(`/api/log/operation/delete`, { params: { id: row.id } })
    if (result.code === 200) {
      tableData.value = tableData.value.filter(item => item.id !== row.id)
      total.value = tableData.value.length
      ElMessage.success('删除成功')
    }
  } catch {
    // User cancelled
  }
}

onMounted(() => {
  fetchData()
})
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
