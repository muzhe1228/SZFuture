<template>
  <div class="customer-list">
    <!-- Base Table Page -->
    <BaseTablePage
      :search-fields="searchFields"
      :columns="columns"
      :actions="tableActions"
      :fetch-data="fetchCustomerList"
      title="客户管理"
      storage-key="customer-list"
      :show-column-settings="true"
      :show-selection="true"
      @action="handleTableAction"
      @selection-change="handleSelectionChange"
    >
      <template #extra-actions>
        <el-button type="primary" link @click="handleAddCustomer" :icon="Plus"> 新增客户 </el-button>
        <el-button type="danger" link plain @click="handleBatchDelete" :disabled="selectedCustomers.length === 0">
          批量删除
        </el-button>
      </template>
      <template #cell-accountStatus="{ row }">
        <StatusTag :status="row.accountStatus" size="small" />
      </template>
    </BaseTablePage>

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

    <!-- Download Customer Modal -->
    <CustomerDownloadModal v-model="downloadModalVisible" :customer="currentCustomer" @download="handleDownloadSubmit" />

    <!-- Delete Customer Modal -->
    <DeleteModal 
      v-model="deleteModalVisible" 
      :title-text="currentCustomer?.name"
      :delete-api="deleteCustomerApi"
      :id="currentCustomer?.id"
      @success="handleDeleteSuccess"
    />

    <!-- Batch Delete Modal -->
    <DeleteModal 
      mode="batch"
      v-model="batchDeleteModalVisible" 
      :title-text="selectedCustomers.length"
      @confirm="confirmBatchDelete"
    />

  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  import type { Customer } from '@/types/index'
  import { ElMessage } from 'element-plus'
  import request from '@/utils/request'
  import { BaseTablePage } from '@/components/BaseTablePage'
  import { StatusTag } from '@/components/StatusTag'
  import CustomerForm from '@/components/Dialog/CustomerList/CustomerForm.vue'
  import CustomerDetail from '@/components/Dialog/CustomerList/CustomerDetail.vue'
  import CustomerDownloadModal from '@/components/Dialog/CustomerList/CustomerDownloadModal.vue'
  import DeleteModal from '@/components/Dialog/common/DeleteModal.vue'
  import type { ActionButton } from '@/components/DataTable/types'
  import { customerColumns } from '@/config/auth/columns'
  import { customerSearchFields } from '@/config/auth/searchFields'

  // ─── Search Form ──────────────────────────────────────────────────────

  // 搜索字段配置已移至 @/config/auth/searchFields.ts
  const searchFields = customerSearchFields

  // ─── Table Config ─────────────────────────────────────────────────────

  // 表格列配置已移至 @/config/auth/columns.ts
  const columns = ref(customerColumns)

  const tableActions: ActionButton[] = [
    { key: 'view', label: '查看', type: 'primary', icon: 'IconShow' },
    { key: 'edit', label: '修改', type: 'success', icon: 'IconEdit' },
    { key: 'download', label: '下载', type: 'primary', icon: 'IconDownload' },
    { key: 'delete', label: '删除', type: 'danger', icon: 'IconDel' },
  ]

  // ─── Table Data ───────────────────────────────────────────────────────

  const selectedCustomers = ref<Customer[]>([])

  const fetchCustomerList = async (formData?: Record<string, any>, page: number = 1, pageSize: number = 20) => {
    try {
      const response: any = await request.get('/api/customer/list', {
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
          name: item.name,
          contact: item.contact,
          phone: item.phone,
          accountStatus: item.accountStatus,
          createDate: item.createDate,
          email: item.email,
          salesOwner: item.salesOwner,
        }))
        return { list, total: response.data.total || 0 }
      }
      return { list: [], total: 0 }
    } catch {
      ElMessage.error('获取客户列表失败')
      return { list: [], total: 0 }
    }
  }

  const handleSelectionChange = (selection: Customer[]) => {
    selectedCustomers.value = selection
  }

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

  // ─── Current Customer (for modals) ────────────────────────────────────

  const currentCustomer = ref<Customer | null>(null)

  // ─── Add / Edit Customer Modal ───────────────────────────────────────

  const customerModalVisible = ref(false)
  const viewModalVisible = ref(false)
  const downloadModalVisible = ref(false)
  const deleteModalVisible = ref(false)
  const batchDeleteModalVisible = ref(false)
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

  const handleCustomerSubmit = async (_customer: Customer, isEdit: boolean) => {
    try {
      customerModalVisible.value = false
      await new Promise((resolve) => setTimeout(resolve, 600))
      ElMessage.success(isEdit ? '客户修改成功' : '客户新增成功')
    } catch {
      ElMessage.error('操作失败')
    }
  }

  // ─── View Modal ──────────────────────────────────────────────────────

  const handleView = (row: Customer) => {
    currentCustomer.value = row
    viewModalVisible.value = true
  }

  // ─── Download ────────────────────────────────────────────────────────

  const handleDownload = (row: Customer) => {
    currentCustomer.value = row
    downloadModalVisible.value = true
  }

  const handleDownloadSubmit = (customerName: string) => {
    ElMessage.success(`正在下载客户资料: ${customerName}`)
  }

  // ─── Delete ───────────────────────────────────────────────────

  const handleDelete = (row: Customer) => {
    currentCustomer.value = row
    deleteModalVisible.value = true
  }

  const deleteCustomerApi = async (id: number) => {
    await request.delete('/api/customer/delete', { params: { id } })
  }

  const handleDeleteSuccess = () => {
    // 删除成功后的处理，如刷新列表
  }

  // ─── Batch Delete ──────────────────────────────────────────────────────

  const handleBatchDelete = () => {
    if (selectedCustomers.value.length === 0) {
      ElMessage.warning('请先选择要删除的客户')
      return
    }
    batchDeleteModalVisible.value = true
  }

  const confirmBatchDelete = async () => {
    try {
      const ids = selectedCustomers.value.map((customer) => customer.id)
      await request.delete('/api/customer/delete', { params: { ids: ids.join(',') } })
      ElMessage.success('批量删除成功')
    } catch {
      ElMessage.error('删除失败')
    } finally {
      batchDeleteModalVisible.value = false
    }
  }
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
