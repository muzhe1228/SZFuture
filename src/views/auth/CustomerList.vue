<template>
  <div class="customer-list">
    <!-- Search Bar -->
    <SearchForm
      :fields="searchFields"
      storage-key="customer-list-search"
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
      title="客户管理"
      storage-key="customer-list-table"
      :show-column-settings="true"
      :show-selection="true"
      :actions="tableActions"
      row-key="id"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
      @action="handleTableAction"
    >
      <template #extra-actions>
        <el-button type="primary" size="small" @click="handleAddCustomer" :icon="Plus">
          新增客户
        </el-button>
      </template>
      <template #cell-accountStatus="{ row }">
        <el-tag
          :type="getStatusType(row.accountStatus)"
          size="small"
        >
          {{ row.accountStatus }}
        </el-tag>
      </template>
    </DataTable>

    <!-- ==================== Modals ==================== -->

    <!-- Add / Edit Customer Modal -->
    <CustomerForm 
      v-model="customerModalVisible" 
      :is-edit-mode="isEditMode" 
      :customer="currentCustomer" 
      @submit="handleCustomerSubmit" 
      @close="() => {}" 
    />

    <!-- View Customer Modal -->
    <CustomerDetail v-model="viewModalVisible" :customer="currentCustomer" />

    <!-- Delete Confirm Modal -->
    <DeleteConfirm 
      v-model="deleteModalVisible" 
      :loading="deleteLoading" 
      @confirm="handleDeleteConfirm" 
      @cancel="() => {}" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { Customer } from '@/types/index'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import SearchForm from '@/components/SearchForm.vue'
import { DataTable } from '@/components/DataTable'
import CustomerForm from '@/components/Dialog/CustomerList/CustomerForm.vue'
import CustomerDetail from '@/components/Dialog/CustomerList/CustomerDetail.vue'
import DeleteConfirm from '@/components/Dialog/CustomerList/DeleteConfirm.vue'
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
  {
    prop: 'accountStatus',
    label: '账户状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '正常', value: '正常' },
      { label: '冻结', value: '冻结' },
      { label: '关闭', value: '关闭' }
    ]
  }
])

const handleSearch = async (formData: Record<string, any>) => {
  pagination.currentPage = 1
  await fetchCustomerList(formData)
}

const handleReset = async () => {
  pagination.currentPage = 1
  await fetchCustomerList()
  ElMessage.success('重置成功')
}

// ─── Table Config ─────────────────────────────────────────────────────

const columns = ref<ColumnConfig[]>([
  { key: 'name', label: '客户名称', prop: 'name', minWidth: '160', visible: true },
  { key: 'contact', label: '联系人', prop: 'contact', minWidth: '120', visible: true },
  { key: 'phone', label: '手机号', prop: 'phone', minWidth: '140', visible: true },
  { key: 'accountStatus', label: '账户状态', prop: 'accountStatus', width: '100', align: 'center', visible: true, hasTemplate: true },
  { key: 'createDate', label: '创建日期', prop: 'createDate', minWidth: '170', visible: true }
])

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary' },
  { key: 'edit', label: '修改', type: 'success' },
  { key: 'download', label: '下载', type: 'primary' },
  { key: 'delete', label: '删除', type: 'danger' }
]

const handleTableAction = (action: string, row: Customer) => {
  if (action === 'view') {
    handleView(row)
  } else if (action === 'edit') {
    handleEdit(row)
  } else if (action === 'download') {
    handleDownload(row)
  } else if (action === 'delete') {
    handleDelete(row)
  }
}

const handlePageChange = (page: number, size: number) => {
  pagination.currentPage = page
  pagination.pageSize = size
  fetchCustomerList()
}

// ─── Status Tag Type ──────────────────────────────────────────────────

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    '正常': 'success',
    '冻结': 'warning',
    '关闭': 'danger'
  }
  return (map[status] || 'info') as any
}

// ─── Table Data ───────────────────────────────────────────────────────

const tableLoading = ref(false)
const selectedCustomers = ref<Customer[]>([])
const tableData = ref<Customer[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const fetchCustomerList = async (formData?: Record<string, any>) => {
  tableLoading.value = true
  try {
    const response: any = await request.get('/api/customer/list', {
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
        name: item.name,
        contact: item.contact,
        phone: item.phone,
        accountStatus: item.accountStatus,
        createDate: item.createDate,
        email: item.email,
        salesOwner: item.salesOwner
      }))
      pagination.total = response.data.total || 0
    }
  } catch (error) {
    ElMessage.error('获取客户列表失败')
  } finally {
    tableLoading.value = false
  }
}

const handleSelectionChange = (selection: Customer[]) => {
  selectedCustomers.value = selection
}



// ─── Current Customer (for modals) ────────────────────────────────────

const currentCustomer = ref<Customer | null>(null)

// ─── Add / Edit Customer Modal ───────────────────────────────────────

const customerModalVisible = ref(false)
const isEditMode = ref(false)

const handleAddCustomer = () => {
  isEditMode.value = false
  currentCustomer.value = null
  customerModalVisible.value = true
}

const handleEdit = (row: Customer) => {
  isEditMode.value = true
  currentCustomer.value = row
  customerModalVisible.value = true
}

const handleCustomerSubmit = async (customer: Customer, isEdit: boolean) => {
  try {
    customerModalVisible.value = false
    await new Promise(resolve => setTimeout(resolve, 600))

    if (isEdit && currentCustomer.value) {
      const idx = tableData.value.findIndex(c => c.id === currentCustomer.value!.id)
      if (idx !== -1) {
        tableData.value[idx] = {
          ...tableData.value[idx],
          name: customer.name,
          contact: customer.contact,
          phone: customer.phone,
          email: customer.email,
          salesOwner: customer.salesOwner,
          accountStatus: customer.accountStatus
        }
      }
      ElMessage.success('客户修改成功')
    } else {
      tableData.value.unshift(customer)
      pagination.total += 1
      ElMessage.success('客户新增成功')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

// ─── View Modal ──────────────────────────────────────────────────────

const viewModalVisible = ref(false)

const handleView = (row: Customer) => {
  currentCustomer.value = row
  viewModalVisible.value = true
}

// ─── Download ────────────────────────────────────────────────────────

const handleDownload = (row: Customer) => {
  ElMessage.success(`正在下载客户资料: ${row.name}`)
}

// ─── Delete Modal ───────────────────────────────────────────────────

const deleteModalVisible = ref(false)
const deleteLoading = ref(false)

const handleDelete = (row: Customer) => {
  currentCustomer.value = row
  deleteModalVisible.value = true
}

const handleDeleteConfirm = async () => {
  if (!currentCustomer.value) return
  deleteLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 600))

    const idx = tableData.value.findIndex(c => c.id === currentCustomer.value!.id)
    if (idx !== -1) {
      tableData.value.splice(idx, 1)
      pagination.total = Math.max(0, pagination.total - 1)
    }

    ElMessage.success('客户删除成功')
  } catch {
    ElMessage.error('删除失败')
  } finally {
    deleteModalVisible.value = false
    deleteLoading.value = false
  }
}

// ─── Lifecycle ───────────────────────────────────────────────────────

onMounted(() => {
  fetchCustomerList()
})
</script>

<style lang="scss" scoped>
.customer-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}


</style>
