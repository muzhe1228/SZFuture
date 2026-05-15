<template>
  <div class="order-list">
    <!-- Base Table Page -->
    <BaseTablePage :search-fields="searchFields" :columns="columns" :actions="tableActions" :fetch-data="fetchOrderList"
      title="订单管理" storage-key="order-list" :show-column-settings="true" :show-selection="true"
      @action="handleTableAction" @selection-change="handleSelectionChange">
      <template #extra-actions>
        <el-button type="primary" link @click="handleAddOrder" :icon="Plus"> 新增订单 </el-button>
        <el-button type="danger" link plain @click="handleBatchDelete" :disabled="selectedOrders.length === 0">
          批量删除
        </el-button>
      </template>
    </BaseTablePage>

    <!-- ==================== Modals ==================== -->

    <!-- 1. 新增订单 / 修改订单 Modal -->
    <OrderFormModal v-model="orderModalVisible" :is-edit-mode="isEditMode" :order="currentOrder"
      @submit="handleOrderSubmit" />

    <!-- 2. 订单查看 Modal -->
    <ViewModal v-model="viewModalVisible" :data="currentOrder || undefined" :title="`订单详情`" :columns="columns" />

    <!-- 3. 订单下载 Modal -->
    <DownloadModal v-model="downloadModalVisible" :order="currentOrder" @download="handleDownloadSubmit" />

    <!-- 4. 订单删除 Modal -->
    <DeleteModal 
      v-model="deleteModalVisible" 
      :title-text="currentOrder?.orderNo"
      :delete-api="deleteOrderApi"
      :id="currentOrder?.id"
      @success="handleDeleteSuccess"
    />

    <!-- 5. 批量删除 Modal -->
    <DeleteModal 
      mode="batch"
      v-model="batchDeleteModalVisible" 
      :title-text="`确定要删除选中的 ${selectedOrders.length} 个订单吗？`"
      @confirm="confirmBatchDelete"
    />

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { Order } from '@/types/index'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { BaseTablePage } from '@/components/BaseTablePage'
import OrderFormModal from '@/components/Dialog/OrderList/OrderFormModal.vue'
import ViewModal from '@/components/Dialog/common/ViewModal.vue'
import DownloadModal from '@/components/Dialog/OrderList/DownloadModal.vue'
import DeleteModal from '@/components/Dialog/common/DeleteModal.vue'
import type { ActionButton } from '@/components/DataTable/types'
import { orderColumns } from '@/config/auth/columns'
import { orderSearchFields } from '@/config/auth/searchFields'

// ─── Search Form ──────────────────────────────────────────────────────

// 搜索字段配置已移至 @/config/auth/searchFields.ts
const searchFields = orderSearchFields

// ─── Table Config ─────────────────────────────────────────────────────

// 表格列配置已移至 @/config/auth/columns.ts
const columns = ref(orderColumns)

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary', icon: 'IconShow' },
  { key: 'edit', label: '修改', type: 'success', icon: 'IconEdit' },
  { key: 'download', label: '下载', type: 'primary', icon: 'IconDownload' },
  { key: 'delete', label: '删除', type: 'danger', icon: 'IconDel' },
]

// ─── Table Data ───────────────────────────────────────────────────────

const selectedOrders = ref<Order[]>([])

const fetchOrderList = async (formData?: Record<string, any>, page: number = 1, pageSize: number = 20) => {
  try {
    const response: any = await request.get('/api/order/list', {
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
        orderNo: item.orderNo,
        createTime: item.createTime,
        customerName: item.customerName,
        authCount: item.authCount,
        authStartDate: item.authStartDate,
        authEndDate: item.authEndDate,
      }))
      return { list, total: response.data.total || 0 }
    }
    return { list: [], total: 0 }
  } catch {
    ElMessage.error('获取订单列表失败')
    return { list: [], total: 0 }
  }
}

const handleSelectionChange = (selection: Order[]) => {
  selectedOrders.value = selection
}

const handleTableAction = (action: string, row: Order) => {
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

// ─── Current Order (for modals) ──────────────────────────────────────

const currentOrder = ref<Order | null>(null)

// ─── Modal Visibility ─────────────────────────────────────────────────

const orderModalVisible = ref(false)
const viewModalVisible = ref(false)
const downloadModalVisible = ref(false)
const deleteModalVisible = ref(false)
const batchDeleteModalVisible = ref(false)
const isEditMode = ref(false)

// ─── Add / Edit Order ────────────────────────────────────────────────

const handleAddOrder = () => {
  isEditMode.value = false
  currentOrder.value = null
  orderModalVisible.value = true
}

const handleEdit = (row: Order) => {
  isEditMode.value = true
  currentOrder.value = row
  orderModalVisible.value = true
}

const handleOrderSubmit = (_order: any) => {
  // 处理订单提交逻辑
  ElMessage.success(isEditMode.value ? '订单修改成功' : '订单新增成功')
}

// ─── Delete Order ─────────────────────────────────────────────────────

const handleDelete = (row: Order) => {
  currentOrder.value = row
  deleteModalVisible.value = true
}

const deleteOrderApi = async (id: number) => {
  await request.delete('/api/order/delete', { params: { id } })
}

const handleDeleteSuccess = () => {
  // 删除成功后的处理，如刷新列表
}

// ─── View ────────────────────────────────────────────────────────────

const handleView = (row: Order) => {
  currentOrder.value = row
  viewModalVisible.value = true
}

// ─── Download ────────────────────────────────────────────────────────

const handleDownload = (row: Order) => {
  currentOrder.value = row
  downloadModalVisible.value = true
}

const handleDownloadSubmit = (orderNo: string) => {
  ElMessage.success(`正在下载订单: ${orderNo}`)
}

// ─── Batch Delete ──────────────────────────────────────────────────────

const handleBatchDelete = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning('请先选择要删除的订单')
    return
  }
  batchDeleteModalVisible.value = true
}

const confirmBatchDelete = async () => {
  try {
    const ids = selectedOrders.value.map((order) => order.id)
    await request.delete('/api/order/delete', { params: { ids: ids.join(',') } })
    ElMessage.success('批量删除成功')
  } catch {
    ElMessage.error('删除失败')
  } finally {
    batchDeleteModalVisible.value = false
  }
}
</script>

<style lang="scss" scoped>
.order-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}
</style>
