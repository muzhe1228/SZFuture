<template>
  <div class="messages-page">
    <!-- Search Bar -->
    <SearchForm :fields="searchFields" storage-key="messages-search" @search="handleSearch" @reset="handleReset"
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
      title="消息列表"
      storage-key="messages-table"
      :show-column-settings="true"
      :show-selection="true"
      :actions="tableActions"
      row-key="id"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
      @action="handleTableAction"
    >
      <template #cell-status="{ row }">
        <el-tag :type="row.status === '未处理' ? 'danger' : 'success'" size="small" effect="light">
          {{ row.status }}
        </el-tag>
      </template>
      <template #extra-actions>
        <el-button type="danger" size="small" @click="handleBatchDelete" :disabled="selectedMessages.length === 0">
          批量删除
        </el-button>
      </template>
    </DataTable>

    <!-- Message Detail Modal -->
    <MessageDetail v-model="detailModalVisible" :message="currentMessage" @confirm="handleMessageConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import type { Message } from '@/types/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { DataTable } from '@/components/DataTable'
import MessageDetail from '@/components/Dialog/Messages/MessageDetail.vue'
import type { ActionButton } from '@/components/DataTable/types'
import { messageColumns } from '@/config/common/columns'
import { messageSearchFields } from '@/config/common/searchFields'
import request from '@/utils/request'

interface ExtendedMessage extends Message {
  receiveTime: string
  serialNo: string
  expiryDate: string
}

// ─── Search Form ──────────────────────────────────────────────────────

// 搜索字段配置已移至 @/config/common/searchFields.ts
const searchFields = messageSearchFields

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

// ─── Table Config ──────────────────────────────────────────────────────

// 表格列配置已移至 @/config/common/columns.ts
const columns = ref(messageColumns)

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary' },
  { key: 'delete', label: '删除', type: 'danger' }
]

// ─── Table Data ───────────────────────────────────────────────────────

const tableLoading = ref(false)
const selectedMessages = ref<ExtendedMessage[]>([])
const tableData = ref<ExtendedMessage[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const fetchData = async () => {
  tableLoading.value = true
  try {
    const params = {
      page: String(pagination.currentPage),
      pageSize: String(pagination.pageSize),
      ...searchParams.value
    }
    const result = await request({
      url: '/api/message/list',
      method: 'get',
      params: params
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

const handlePageChange = (page: number, pageSize: number) => {
  pagination.currentPage = page
  pagination.pageSize = pageSize
  fetchData()
}

const handleSelectionChange = (selection: ExtendedMessage[]) => {
  selectedMessages.value = selection
}

const handleTableAction = (action: string, row: ExtendedMessage) => {
  if (action === 'view') {
    handleView(row)
  } else if (action === 'delete') {
    handleDelete(row)
  }
}

// ─── Message Detail Modal ─────────────────────────────────────────────

const detailModalVisible = ref(false)
const currentMessage = ref<ExtendedMessage | null>(null)

const handleView = (row: ExtendedMessage) => {
  currentMessage.value = row
  detailModalVisible.value = true
}

const handleMessageConfirm = () => {
  detailModalVisible.value = false
}

// ─── Delete ───────────────────────────────────────────────────────────

const handleDelete = (row: ExtendedMessage) => {
  ElMessageBox.confirm(
    `确定要删除【${row.customerName}】的消息吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const result = await request.delete(`/api/message/delete`, { params: { id: row.id } })
        if (result.code === 200) {
          const idx = tableData.value.findIndex(m => m.id === row.id)
          if (idx !== -1) {
            tableData.value.splice(idx, 1)
            pagination.total = Math.max(0, pagination.total - 1)
          }
          ElMessage.success('删除成功')
        }
      } catch {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      // User cancelled
    })
}

const handleBatchDelete = () => {
  if (selectedMessages.value.length === 0) return
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedMessages.value.length} 条消息吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      try {
        const ids = selectedMessages.value.map(m => m.id)
        const result = await request.delete(`/api/message/delete`, { params: { ids: ids.join(',') } })
        if (result.code === 200) {
          tableData.value = tableData.value.filter(m => !ids.includes(m.id))
          pagination.total = Math.max(0, pagination.total - ids.length)
          selectedMessages.value = []
          ElMessage.success('批量删除成功')
        }
      } catch {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      // User cancelled
    })
}

// ─── Lifecycle ────────────────────────────────────────────────────────

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.messages-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: hidden;
  border-radius: 8px;
}


</style>