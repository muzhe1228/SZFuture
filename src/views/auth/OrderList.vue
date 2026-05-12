<template>
  <div class="order-list">
    <!-- Base Table Page -->
    <BaseTablePage
      :search-fields="searchFields"
      :columns="columns"
      :actions="tableActions"
      :fetch-data="fetchOrderList"
      title="订单管理"
      storage-key="order-list"
      :show-column-settings="true"
      :show-selection="true"
      @action="handleTableAction"
      @selection-change="handleSelectionChange"
    >
      <template #extra-actions>
        <el-button type="primary" link @click="handleAddOrder" :icon="Plus"> 新增订单 </el-button>
      </template>
    </BaseTablePage>

    <!-- ==================== Modals ==================== -->

    <!-- 1. 新增订单 / 修改订单 Modal -->
    <OrderFormModal
      v-model="orderModalVisible"
      :is-edit-mode="isEditMode"
      :order="currentOrder"
      @submit="handleOrderSubmit"
    />

    
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  import type { Order } from '@/types/index'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import request from '@/utils/request'
  import { BaseTablePage } from '@/components/BaseTablePage'
  import OrderFormModal from '@/components/Dialog/OrderList/OrderFormModal.vue'
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
    { key: 'view', label: '查看', type: 'primary' },
    { key: 'edit', label: '修改', type: 'success' },
    { key: 'download', label: '下载', type: 'primary' },
    { key: 'delete', label: '删除', type: 'danger' },
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
    ElMessageBox.confirm(`确定要删除订单【${row.orderNo}】吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        await new Promise((resolve) => setTimeout(resolve, 600))
        ElMessage.success('订单删除成功')
      })
      .catch(() => {
        // User cancelled
      })
  }

  // ─── View ────────────────────────────────────────────────────────────

  const handleView = (row: Order) => {
    ElMessage.info(`查看订单: ${row.orderNo}`)
  }

  // ─── Download ────────────────────────────────────────────────────────

  const handleDownload = (row: Order) => {
    ElMessage.success(`正在下载订单: ${row.orderNo}`)
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
