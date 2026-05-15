<template>
  <div class="product-module-config">
    <!-- Base Table Page -->
    <BaseTablePage :search-fields="searchFields" :columns="columns" :actions="tableActions" :fetch-data="fetchData"
      title="产品模块配置" storage-key="product-module-config" :show-column-settings="true" :show-selection="true"
      @action="handleTableAction" @selection-change="handleSelectionChange">
      <template #extra-actions>
        <el-button type="primary" link @click="handleAdd" :icon="Plus"> 新增模块 </el-button>
        <el-button type="danger" link plain :icon="Delete" :disabled="selectedRows.length === 0"
          @click="handleBatchDelete">
          删除模块
        </el-button>
      </template>
      <template #cell-type="{ row }">
        <StatusTag :status="row.type" size="small" effect="plain" />
      </template>
      <template #cell-status="{ row }">
        <StatusTag :status="row.status" mode="dot" />
      </template>
    </BaseTablePage>

    <!-- Add/Edit Module Modal -->
    <ModuleForm v-model="moduleModalVisible" :is-edit-mode="isEditMode" :module="currentModule"
      :parent-menu-options="parentMenuOptions" @submit="handleModuleSubmit" @close="handleModalClose" />

    <!-- View Detail Dialog -->
    <ViewModal v-model="viewDialogVisible" :data="viewingModule" :title="'模块详情'" :columns="columns" />

    <!-- Delete Module Modal -->
    <DeleteModal :mode="currentModule ? 'single' : 'batch'" v-model="deleteModalVisible"
      :title-text="deleteModalTitle" :delete-api="deleteModuleApi" :id="currentModule?.id"
      @success="handleDeleteSuccess" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { ProductModule } from '@/types/index'
import { ElMessage } from 'element-plus'
import { BaseTablePage } from '@/components/BaseTablePage'
import { StatusTag } from '@/components/StatusTag'
import ModuleForm from '@/components/Dialog/ProductModuleConfig/ModuleForm.vue'
import ViewModal from '@/components/Dialog/common/ViewModal.vue'
import DeleteModal from '@/components/Dialog/common/DeleteModal.vue'
import type { ActionButton } from '@/components/DataTable/types'
import { productModuleColumns } from '@/config/product/columns'
import { productModuleSearchFields } from '@/config/product/searchFields'
import request from '@/utils/request'

// ─── Search Form ──────────────────────────────────────────────────────

// 搜索字段配置已移至 @/config/product/searchFields.ts
const searchFields = productModuleSearchFields

// ─── Table Config ─────────────────────────────────────────────────────

// 表格列配置已移至 @/config/product/columns.ts
const columns = ref(productModuleColumns)
// , condition: (row: ProductModule) => row.type === '版本' 
const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary', icon: 'IconShow' },
  { key: 'edit', label: '修改', type: 'success', icon: 'IconEdit' },
  { key: 'clone', label: '克隆', type: 'warning', icon: 'IconCopy' },
  { key: 'delete', label: '删除', type: 'danger', icon: 'IconDel' },
]

const handleTableAction = (action: string, row: ProductModule) => {
  if (action === 'view') {
    handleView(row)
  } else if (action === 'edit') {
    handleEdit(row)
  } else if (action === 'clone') {
    handleClone(row)
  } else if (action === 'delete') {
    handleDelete(row)
  }
}

// ─── Selection ────────────────────────────────────────────────────────

const selectedRows = ref<ProductModule[]>([])

const handleSelectionChange = (selection: ProductModule[]) => {
  selectedRows.value = selection
}

// ─── Fetch Data ───────────────────────────────────────────────────────

const fetchData = async (formData?: Record<string, any>) => {
  try {
    const result = await request.get('/api/product/module/list', {
      params: formData,
    })
    if (result.code === 200) {
      const list = result.data.list || []
      return {
        list,
        total: list.length,
      }
    }
    return { list: [], total: 0 }
  } catch {
    ElMessage.error('加载数据失败')
    return { list: [], total: 0 }
  }
}

// ─── Action Handlers ──────────────────────────────────────────────────

const handleAdd = () => {
  isEditMode.value = false
  currentModule.value = null
  moduleModalVisible.value = true
}

const handleView = (row: ProductModule) => {
  viewingModule.value = row
  viewDialogVisible.value = true
}

const handleEdit = (row: ProductModule) => {
  isEditMode.value = true
  editingModuleId.value = row.id
  currentModule.value = row
  moduleModalVisible.value = true
}

const handleDelete = async (row: ProductModule) => {
  currentModule.value = row
  deleteModalVisible.value = true
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的模块')
    return
  }
  currentModule.value = null
  deleteModalVisible.value = true
}

const deleteModuleApi = async () => {
  if (currentModule.value) {
    await request.delete('/api/product/module/delete', { params: { id: currentModule.value.id } })
  } else {
    const ids = selectedRows.value.map(r => r.id)
    await request.delete('/api/product/module/delete', { params: { ids: ids.join(',') } })
  }
}

const handleDeleteSuccess = () => {
  currentModule.value = null
}

const handleClone = (row: ProductModule) => {
  ElMessage.info(`克隆模块: ${row.name}`)
}

// ─── Parent Menu Options ──────────────────────────────────────────────

const parentMenuOptions = computed(() => {
  const options: { label: string; value: number }[] = []
  return options
})

// ─── Module Modal ─────────────────────────────────────────────────────

const moduleModalVisible = ref(false)
const deleteModalVisible = ref(false)
const isEditMode = ref(false)
const editingModuleId = ref<number | null>(null)
const currentModule = ref<ProductModule | null>(null)
const viewDialogVisible = ref(false)
const viewingModule = ref<ProductModule | null>(null)

const deleteModalTitle = computed(() => {
  if (currentModule.value) {
    return currentModule.value.name
  }
  return selectedRows.value.length
})

const handleModuleSubmit = async (_module: ProductModule, isEdit: boolean) => {
  try {
    ElMessage.success(isEdit ? '编辑成功' : '新增成功')
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleModalClose = () => {
  isEditMode.value = false
  editingModuleId.value = null
  currentModule.value = null
}
</script>

<style lang="scss" scoped>
.product-module-config {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}
</style>
