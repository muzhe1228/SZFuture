<template>
  <div class="product-module-config">
    <!-- Base Table Page -->
    <BaseTablePage
      :search-fields="searchFields"
      :columns="columns"
      :actions="tableActions"
      :fetch-data="fetchData"
      title="产品模块配置"
      storage-key="product-module-config"
      :show-column-settings="true"
      :show-selection="true"
      @action="handleTableAction"
      @selection-change="handleSelectionChange"
    >
      <template #extra-actions>
        <el-button type="primary" size="small" @click="handleAdd" :icon="Plus"> 新增模块 </el-button>
        <el-button
          type="danger"
          size="small"
          plain
          :icon="Delete"
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          删除模块
        </el-button>
      </template>
      <template #cell-type="{ row }">
        <el-tag :type="getTypeTagType(row.type)" size="small" effect="plain">
          {{ row.type }}
        </el-tag>
      </template>
      <template #cell-status="{ row }">
        <span class="status-cell">
          <span class="status-dot" :class="row.status === '启用' ? 'status-enabled' : 'status-disabled'"></span>
          {{ row.status }}
        </span>
      </template>
    </BaseTablePage>

    <!-- Add/Edit Module Modal -->
    <ModuleForm
      v-model="moduleModalVisible"
      :is-edit-mode="isEditMode"
      :module="currentModule"
      :parent-menu-options="parentMenuOptions"
      @submit="handleModuleSubmit"
      @close="handleModalClose"
    />

    <!-- View Detail Dialog -->
    <ModuleDetail v-model="viewDialogVisible" :module="viewingModule" />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Plus, Delete } from '@element-plus/icons-vue'
  import type { ProductModule } from '@/types/index'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { BaseTablePage } from '@/components/BaseTablePage'
  import ModuleForm from '@/components/Dialog/ProductModuleConfig/ModuleForm.vue'
  import ModuleDetail from '@/components/Dialog/ProductModuleConfig/ModuleDetail.vue'
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

  const tableActions: ActionButton[] = [
    { key: 'view', label: '查看', type: 'primary' },
    { key: 'edit', label: '修改', type: 'success' },
    { key: 'clone', label: '克隆', type: 'warning', condition: (row: ProductModule) => row.type === '版本' },
    { key: 'delete', label: '删除', type: 'danger' },
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

  // ─── Type Tag Colors ──────────────────────────────────────────────────

  const getTypeTagType = (type: string): 'primary' | 'warning' | 'success' => {
    switch (type) {
      case '产品':
        return 'primary'
      case '版本':
        return 'warning'
      case '功能':
        return 'success'
      default:
        return 'primary'
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
    try {
      await ElMessageBox.confirm(`确定要删除模块 "${row.name}" 吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      ElMessage.success('删除成功')
    } catch {
      // User cancelled
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要删除的模块')
      return
    }
    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个模块吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      ElMessage.success('批量删除成功')
    } catch {
      // User cancelled
    }
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
  const isEditMode = ref(false)
  const editingModuleId = ref<number | null>(null)
  const currentModule = ref<ProductModule | null>(null)
  const viewDialogVisible = ref(false)
  const viewingModule = ref<ProductModule | null>(null)

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
