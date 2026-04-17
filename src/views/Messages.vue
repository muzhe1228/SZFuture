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
import { ref, computed, onMounted, reactive } from 'vue'
import type { Message } from '@/types/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { DataTable } from '@/components/DataTable'
import MessageDetail from '@/components/Dialog/Messages/MessageDetail.vue'
import type { ColumnConfig, ActionButton } from '@/components/DataTable/types'
import request from '@/utils/request'
import type { SearchField } from '@/components/SearchForm/types'

interface ExtendedMessage extends Message {
  receiveTime: string
  serialNo: string
  expiryDate: string
}

// ─── Search Form ──────────────────────────────────────────────────────

const customerOptions = [
  { label: '客户名称客户名称', value: '客户名称客户名称' },
  { label: '测试客户A', value: '测试客户A' },
  { label: '测试客户B', value: '测试客户B' },
  { label: '华东科技有限公司', value: '华东科技有限公司' },
  { label: '华中信息技术有限公司', value: '华中信息技术有限公司' },
  { label: '深圳创新科技', value: '深圳创新科技' },
  { label: '北京软件开发公司', value: '北京软件开发公司' },
  { label: '上海信息技术公司', value: '上海信息技术公司' },
  { label: '广州数字化公司', value: '广州数字化公司' }
]

const productOptions = [
  { label: '产品A', value: '产品A' },
  { label: '产品B', value: '产品B' },
  { label: '产品C', value: '产品C' }
]

const searchFields = computed<SearchField[]>(() => [
  { prop: 'customerName', label: '客户名称', type: 'select', placeholder: '请选择', options: customerOptions },
  { prop: 'phone', label: '手机号', type: 'input', placeholder: '请输入' },
  { prop: 'product', label: '产品', type: 'select', placeholder: '请选择', options: productOptions },
  { prop: 'expiryDays', label: '到期时间', type: 'input', placeholder: '', suffix: '内' },
  {
    prop: 'status',
    label: '处理状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '未处理', value: '未处理' },
      { label: '已处理', value: '已处理' }
    ]
  }
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

// ─── Table Config ──────────────────────────────────────────────────────

const columns = ref<ColumnConfig[]>([
  { key: 'customerName', label: '客户名称', prop: 'customerName', minWidth: '160', visible: true },
  { key: 'phone', label: '手机号', prop: 'phone', minWidth: '130', visible: true },
  { key: 'expiryTime', label: '到期时间', prop: 'expiryTime', width: '100', align: 'center', visible: true },
  { key: 'status', label: '处理状态', prop: 'status', width: '100', align: 'center', visible: true, hasTemplate: true },
  { key: 'startDate', label: '授权起始日期', prop: 'startDate', minWidth: '170', visible: true },
  { key: 'endDate', label: '授权结束日期', prop: 'endDate', minWidth: '170', visible: true }
])

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