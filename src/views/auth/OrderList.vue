<template>
  <div class="order-list">
    <!-- Search Bar -->
    <SearchForm
      :fields="searchFields"
      storage-key="order-list-search"
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
      title="订单管理"
      storage-key="order-list-table"
      :show-column-settings="true"
      :show-selection="true"
      :actions="tableActions"
      row-key="id"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
      @action="handleTableAction"
    >
      <template #extra-actions>
        <el-button type="primary" size="small" @click="handleAddOrder" :icon="Plus">
          新增订单
        </el-button>
      </template>
    </DataTable>


    <!-- ==================== Modals ==================== -->

    <!-- 1. 新增订单 / 修改订单 Modal -->
    <el-dialog
      v-model="orderModalVisible"
      :title="isEditMode ? '修改订单' : '新增订单'"
      width="720px"
      :close-on-click-modal="false"
      @close="resetOrderModal"
    >
      <el-form
        ref="orderFormRef"
        :model="orderForm"
        :rules="orderFormRules"
        label-width="110px"
        label-position="right"
        class="order-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开户账户" prop="account">
              <el-select v-model="orderForm.account" placeholder="请选择" style="width: 100%">
                <el-option label="xx科技有限公司" value="xx科技有限公司" />
                <el-option label="测试客户A" value="测试客户A" />
                <el-option label="测试客户B" value="测试客户B" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="订单编号" prop="orderNo">
              <el-input v-model="orderForm.orderNo" placeholder="编号规则" clearable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="授权数量" prop="authCount">
              <el-input-number
                v-model="orderForm.authCount"
                :min="1"
                :max="9999"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="productName">
              <el-select
                v-model="orderForm.productName"
                placeholder="请选择"
                style="width: 100%"
                @change="handleProductChange"
              >
                <el-option label="产品A" value="产品A" />
                <el-option label="产品B" value="产品B" />
                <el-option label="产品C" value="产品C" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="产品版本" prop="productVersion">
              <el-select
                v-model="orderForm.productVersion"
                placeholder="请先选择产品名称"
                style="width: 100%"
                :disabled="!orderForm.productName"
              >
                <el-option
                  v-for="v in availableVersions"
                  :key="v"
                  :label="v"
                  :value="v"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="许可模版" prop="licenseTemplate">
              <el-select
                v-model="orderForm.licenseTemplate"
                placeholder="请选择"
                style="width: 100%"
                @change="handleLicenseTemplateChange"
              >
                <el-option label="模版A - 标准版" value="模版A" />
                <el-option label="模版B - 企业版" value="模版B" />
                <el-option label="模版C - 试用版" value="模版C" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="许可类型" prop="licenseType">
              <el-select v-model="orderForm.licenseType" placeholder="根据许可模版显示默认值" style="width: 100%">
                <el-option label="永久许可" value="永久许可" />
                <el-option label="订阅许可" value="订阅许可" />
                <el-option label="试用许可" value="试用许可" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="浮动许可" prop="floatingLicense">
              <div class="floating-license-field">
                <el-switch v-model="orderForm.floatingEnabled" />
                <el-input
                  v-if="orderForm.floatingEnabled"
                  v-model="orderForm.floatingLicense"
                  placeholder="请输入浮动许可数量"
                  type="number"
                  :min="0"
                  style="width: 120px; margin-left: 8px"
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="授权起始" prop="authStartDate">
              <el-date-picker
                v-model="orderForm.authStartDate"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="授权结束" prop="authEndDate">
              <el-date-picker
                v-model="orderForm.authEndDate"
                type="datetime"
                placeholder="选择日期时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="功能权限" prop="permissions">
          <div class="permission-grid">
            <div
              v-for="perm in permissionsList"
              :key="perm.name"
              class="permission-item"
            >
              <el-checkbox v-model="perm.checked" @change="handlePermissionChange">
                {{ perm.name }}
              </el-checkbox>
              <el-input-number
                v-model="perm.limit"
                :min="0"
                :max="9999"
                :disabled="!perm.checked"
                controls-position="right"
                size="small"
                style="width: 90px"
              />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="订单备注" prop="remarks">
          <el-input
            v-model="orderForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入订单备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="orderModalVisible = false">取消</el-button>
          <el-button type="primary" @click="handleOrderSubmit" :loading="orderSubmitLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 2. 删除确认 Modal -->
    <el-dialog
      v-model="deleteModalVisible"
      width="420px"
      :close-on-click-modal="false"
      class="delete-dialog"
    >
      <div class="delete-content">
        <div class="delete-header">
          <el-icon class="warning-icon" :size="24" color="#E6A23C">
            <WarningFilled />
          </el-icon>
          <span class="delete-title">温馨提示</span>
        </div>
        <p class="delete-message">是否删除所选订单?</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteModalVisible = false">取消</el-button>
          <el-button type="primary" @click="handleDeleteConfirm" :loading="deleteLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { Order } from '@/types/index'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import request from '@/utils/request'
import SearchForm from '@/components/SearchForm.vue'
import { DataTable } from '@/components/DataTable'

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
      { label: 'xx科技有限公司', value: 'xx科技有限公司' },
      { label: '测试客户A', value: '测试客户A' },
      { label: '测试客户B', value: '测试客户B' }
    ]
  },
  {
    prop: 'orderNo',
    label: '订单编号',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: 'SGZZ-20210906-001', value: 'SGZZ-20210906-001' },
      { label: 'SGZZ-20210907-002', value: 'SGZZ-20210907-002' },
      { label: 'SGZZ-20210908-003', value: 'SGZZ-20210908-003' }
    ]
  },
  {
    prop: 'product',
    label: '产品',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '产品A', value: '产品A' },
      { label: '产品B', value: '产品B' },
      { label: '产品C', value: '产品C' }
    ]
  },
  {
    prop: 'licenseType',
    label: '许可类型',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '永久许可', value: '永久许可' },
      { label: '订阅许可', value: '订阅许可' },
      { label: '试用许可', value: '试用许可' }
    ]
  }
])

const handleSearch = async (formData: Record<string, any>) => {
  pagination.currentPage = 1
  await fetchOrderList(formData)
}

const handleReset = async () => {
  pagination.currentPage = 1
  await fetchOrderList()
  ElMessage.success('重置成功')
}

// ─── Table Config ─────────────────────────────────────────────────────

const columns = ref<ColumnConfig[]>([
  { key: 'orderNo', label: '订单编号', prop: 'orderNo', minWidth: '180', visible: true },
  { key: 'createTime', label: '创建时间', prop: 'createTime', minWidth: '170', visible: true },
  { key: 'customerName', label: '客户名称', prop: 'customerName', minWidth: '180', visible: true },
  { key: 'authCount', label: '授权数量', prop: 'authCount', width: '100', align: 'center', visible: true },
  { key: 'authStartDate', label: '授权起始日期', prop: 'authStartDate', minWidth: '170', visible: true },
  { key: 'authEndDate', label: '授权结束日期', prop: 'authEndDate', minWidth: '170', visible: true }
])

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary' },
  { key: 'edit', label: '修改', type: 'success' },
  { key: 'download', label: '下载', type: 'primary' },
  { key: 'delete', label: '删除', type: 'danger' }
]

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

const handlePageChange = (page: number, size: number) => {
  pagination.currentPage = page
  pagination.pageSize = size
  fetchOrderList()
}

// ─── Table Data ───────────────────────────────────────────────────────

const tableLoading = ref(false)
const selectedOrders = ref<Order[]>([])
const tableData = ref<Order[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const fetchOrderList = async (formData?: Record<string, any>) => {
  tableLoading.value = true
  try {
    const response: any = await request.get('/api/order/list', {
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
        orderNo: item.orderNo,
        createTime: item.createTime,
        customerName: item.customerName,
        authCount: item.authCount,
        authStartDate: item.authStartDate,
        authEndDate: item.authEndDate
      }))
      pagination.total = response.data.total || 0
    }
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    tableLoading.value = false
  }
}

const handleSelectionChange = (selection: Order[]) => {
  selectedOrders.value = selection
}



// ─── Current Order (for modals) ──────────────────────────────────────

const currentOrder = ref<Order | null>(null)

// ─── Permission Grid ─────────────────────────────────────────────────

interface PermissionItem {
  name: string
  checked: boolean
  limit: number
}

const defaultPermissions: PermissionItem[] = [
  { name: '功能模块A', checked: false, limit: 0 },
  { name: '功能模块B', checked: false, limit: 0 },
  { name: '功能模块C', checked: false, limit: 0 },
  { name: '功能模块D', checked: false, limit: 0 },
  { name: '功能模块E', checked: false, limit: 0 },
  { name: '功能模块F', checked: false, limit: 0 },
  { name: '功能模块G', checked: false, limit: 0 },
  { name: '功能模块H', checked: false, limit: 0 },
  { name: '功能模块I', checked: false, limit: 0 },
  { name: '功能模块J', checked: false, limit: 0 },
  { name: '功能模块K', checked: false, limit: 0 },
  { name: '功能模块L', checked: false, limit: 0 }
]

const permissionsList = ref<PermissionItem[]>([])

const resetPermissions = () => {
  permissionsList.value = defaultPermissions.map(p => ({ ...p }))
}

const handlePermissionChange = () => {
  // Optional: react to permission changes
}

// ─── Product & Version Mapping ───────────────────────────────────────

const versionMap: Record<string, string[]> = {
  '产品A': ['V1.0', 'V2.0', 'V3.0'],
  '产品B': ['V1.0', 'V2.0'],
  '产品C': ['V1.0', 'V3.0']
}

const availableVersions = computed(() => {
  if (!orderForm.productName) return []
  return versionMap[orderForm.productName] || []
})

const handleProductChange = () => {
  orderForm.productVersion = ''
}

// ─── License Template -> Default License Type ────────────────────────

const licenseTemplateDefaultMap: Record<string, string> = {
  '模版A': '永久许可',
  '模版B': '订阅许可',
  '模版C': '试用许可'
}

const handleLicenseTemplateChange = () => {
  const tpl = orderForm.licenseTemplate
  if (tpl && licenseTemplateDefaultMap[tpl]) {
    orderForm.licenseType = licenseTemplateDefaultMap[tpl]
  }
}

// ─── 1. Add / Edit Order Modal ───────────────────────────────────────

const orderModalVisible = ref(false)
const isEditMode = ref(false)
const orderFormRef = ref<FormInstance>()
const orderSubmitLoading = ref(false)

const orderForm = reactive({
  account: '',
  orderNo: '',
  authCount: 1,
  productName: '',
  productVersion: '',
  licenseTemplate: '',
  licenseType: '',
  authStartDate: '',
  authEndDate: '',
  floatingEnabled: false,
  floatingLicense: '',
  remarks: ''
})

const orderFormRules: FormRules = {
  account: [{ required: true, message: '请选择开户账户', trigger: 'change' }],
  orderNo: [{ required: true, message: '请输入订单编号', trigger: 'blur' }],
  authCount: [{ required: true, message: '请输入授权数量', trigger: 'blur' }],
  productName: [{ required: true, message: '请选择产品名称', trigger: 'change' }],
  productVersion: [{ required: true, message: '请选择产品版本', trigger: 'change' }],
  licenseTemplate: [{ required: true, message: '请选择许可模版', trigger: 'change' }],
  licenseType: [{ required: true, message: '请选择许可类型', trigger: 'change' }],
  authStartDate: [{ required: true, message: '请选择授权起始日期', trigger: 'change' }],
  authEndDate: [{ required: true, message: '请选择授权结束日期', trigger: 'change' }]
}

const handleAddOrder = () => {
  isEditMode.value = false
  currentOrder.value = null
  resetOrderForm()
  orderModalVisible.value = true
}

const handleEdit = (row: Order) => {
  isEditMode.value = true
  currentOrder.value = row
  orderForm.account = row.customerName
  orderForm.orderNo = row.orderNo
  orderForm.authCount = row.authCount
  orderForm.authStartDate = row.authStartDate
  orderForm.authEndDate = row.authEndDate
  orderModalVisible.value = true
}

const resetOrderForm = () => {
  orderForm.account = ''
  orderForm.orderNo = ''
  orderForm.authCount = 1
  orderForm.productName = ''
  orderForm.productVersion = ''
  orderForm.licenseTemplate = ''
  orderForm.licenseType = ''
  orderForm.authStartDate = ''
  orderForm.authEndDate = ''
  orderForm.floatingEnabled = false
  orderForm.floatingLicense = ''
  orderForm.remarks = ''
  resetPermissions()
  orderFormRef.value?.clearValidate()
}

const resetOrderModal = () => {
  resetOrderForm()
}

const handleOrderSubmit = async () => {
  if (!orderFormRef.value) return
  await orderFormRef.value.validate(async (valid) => {
    if (!valid) return

    orderSubmitLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 600))

    if (isEditMode.value && currentOrder.value) {
      const idx = tableData.value.findIndex(o => o.id === currentOrder.value!.id)
      if (idx !== -1) {
        tableData.value[idx].customerName = orderForm.account
        tableData.value[idx].orderNo = orderForm.orderNo
        tableData.value[idx].authCount = orderForm.authCount
        tableData.value[idx].authStartDate = orderForm.authStartDate
        tableData.value[idx].authEndDate = orderForm.authEndDate
      }
      ElMessage.success('订单修改成功')
    } else {
      const newOrder: Order = {
        id: Date.now(),
        orderNo: orderForm.orderNo,
        createTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }).replace(/\//g, '-'),
        customerName: orderForm.account,
        authCount: orderForm.authCount,
        authStartDate: orderForm.authStartDate,
        authEndDate: orderForm.authEndDate
      }
      tableData.value.unshift(newOrder)
      pagination.total += 1
      ElMessage.success('订单新增成功')
    }

    orderModalVisible.value = false
    orderSubmitLoading.value = false
  })
}

// ─── 2. Delete Modal ─────────────────────────────────────────────────

const deleteModalVisible = ref(false)
const deleteLoading = ref(false)

const handleDelete = (row: Order) => {
  currentOrder.value = row
  deleteModalVisible.value = true
}

const handleDeleteConfirm = async () => {
  if (!currentOrder.value) return
  deleteLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 600))

  const idx = tableData.value.findIndex(o => o.id === currentOrder.value!.id)
  if (idx !== -1) {
    tableData.value.splice(idx, 1)
    pagination.total = Math.max(0, pagination.total - 1)
  }

  ElMessage.success('订单删除成功')
  deleteModalVisible.value = false
  deleteLoading.value = false
}

// ─── View ────────────────────────────────────────────────────────────

const handleView = (row: Order) => {
  ElMessage.info(`查看订单: ${row.orderNo}`)
}

// ─── Download ────────────────────────────────────────────────────────

const handleDownload = (row: Order) => {
  ElMessage.success(`正在下载订单: ${row.orderNo}`)
}

// ─── Lifecycle ───────────────────────────────────────────────────────

onMounted(() => {
  resetPermissions()
  fetchOrderList()
})
</script>

<style lang="scss" scoped>
.order-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}

// ─── Dialog Footer ──────────────────────────────────────────────────

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// ─── Order Form Modal ───────────────────────────────────────────────

.order-form {
  .floating-license-field {
    display: flex;
    align-items: center;
  }
}

.permission-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 16px;
  width: 100%;
}

.permission-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;

  .el-checkbox {
    flex-shrink: 0;
  }
}

// ─── Delete Dialog ──────────────────────────────────────────────────

.delete-dialog {
  :deep(.el-dialog__header) {
    display: none;
  }

  :deep(.el-dialog__body) {
    padding: 30px 20px 20px;
  }
}

.delete-content {
  text-align: center;

  .delete-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;

    .warning-icon {
      flex-shrink: 0;
    }

    .delete-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .delete-message {
    font-size: 15px;
    color: #606266;
    margin: 0;
  }
}
</style>
