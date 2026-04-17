<template>
  <div class="product-module-config">
    <!-- Search Bar -->
    <SearchForm
      :fields="searchFields"
      storage-key="product-module-config-search"
      @search="handleSearch"
      @reset="handleReset"
      :search-loading="tableLoading"
      :reset-loading="tableLoading"
    />

    <!-- Data Table -->
    <DataTable
      :columns="columns"
      :data="filteredTableData"
      :loading="tableLoading"
      :total="tableData.length"
      :current-page="1"
      :page-size="100"
      :page-sizes="[10, 20, 50, 100]"
      title="产品模块配置"
      storage-key="product-module-config-table"
      :show-column-settings="true"
      :show-selection="true"
      :actions="tableActions"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      :default-expand-all="true"
      @selection-change="handleSelectionChange"
      @action="handleTableAction"
    >
      <template #extra-actions>
        <el-button type="primary" size="small" @click="handleAdd" :icon="Plus">
          新增模块
        </el-button>
        <el-button type="danger" size="small" plain :icon="Delete" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
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
    </DataTable>

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
import { ref, computed, onMounted } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { ProductModule } from '@/types/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { DataTable } from '@/components/DataTable'
import ModuleForm from '@/components/Dialog/ProductModuleConfig/ModuleForm.vue'
import ModuleDetail from '@/components/Dialog/ProductModuleConfig/ModuleDetail.vue'
import type { ColumnConfig, ActionButton } from '@/components/DataTable/types'
import type { SearchField } from '@/components/SearchForm/types'
import request from '@/utils/request'

// ─── Search Form ──────────────────────────────────────────────────────

const searchFields = computed<SearchField[]>(() => [
  { prop: 'name', label: '名称', type: 'input', placeholder: '请输入' },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '启用', value: '启用' },
      { label: '停用', value: '停用' }
    ]
  }
])

const currentFilters = ref<Record<string, any>>({})

const handleSearch = (formData: Record<string, any>) => {
  currentFilters.value = { ...formData }
  fetchData()
}

const handleReset = () => {
  currentFilters.value = {}
  fetchData()
  ElMessage.success('重置成功')
}

// ─── Table Config ─────────────────────────────────────────────────────

const columns = ref<ColumnConfig[]>([
  { key: 'name', label: '名称', prop: 'name', minWidth: '200', visible: true, showOverflowTooltip: true },
  { key: 'type', label: '类型', prop: 'type', width: '100', align: 'center', visible: true, hasTemplate: true },
  { key: 'status', label: '状态', prop: 'status', width: '100', align: 'center', visible: true, hasTemplate: true },
  { key: 'description', label: '说明', prop: 'description', minWidth: '180', visible: true, showOverflowTooltip: true }
])

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary' },
  { key: 'edit', label: '修改', type: 'success' },
  { key: 'clone', label: '克隆', type: 'warning', condition: (row: ProductModule) => row.type === '版本' },
  { key: 'delete', label: '删除', type: 'danger' }
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

// ─── Table Data ───────────────────────────────────────────────────────

const tableLoading = ref(false)
const tableData = ref<ProductModule[]>([])

// ─── Filtered Data ────────────────────────────────────────────────────

const filteredTableData = computed(() => {
  const filterNode = (nodes: ProductModule[]): ProductModule[] => {
    return nodes
      .map((node) => {
        const children = node.children ? filterNode(node.children) : []
        const nameMatch = !currentFilters.value.name || node.name.includes(currentFilters.value.name)
        const statusMatch = !currentFilters.value.status || node.status === currentFilters.value.status
        const childrenMatch = children.length > 0

        if (nameMatch && statusMatch) {
          return { ...node, children: children.length ? children : node.children }
        }
        if (childrenMatch) {
          return { ...node, children }
        }
        return null
      })
      .filter(Boolean) as ProductModule[]
  }

  return filterNode(tableData.value)
})

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

const fetchData = async () => {
  tableLoading.value = true
  try {
    const result = await request.get('/api/product/module/list', {
      params: currentFilters.value
    })
    if (result.code === 200) {
      tableData.value = result.data.list || []
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    tableLoading.value = false
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
    await ElMessageBox.confirm(
      `确定要删除模块 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    removeModuleFromTree(tableData.value, row.id)
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
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个模块吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    for (const row of selectedRows.value) {
      removeModuleFromTree(tableData.value, row.id)
    }
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  } catch {
    // User cancelled
  }
}

const handleClone = (row: ProductModule) => {
  ElMessage.info(`克隆模块: ${row.name}`)
}

const removeModuleFromTree = (nodes: ProductModule[], id: number): boolean => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      nodes.splice(i, 1)
      return true
    }
    if (nodes[i].children && removeModuleFromTree(nodes[i].children!, id)) {
      return true
    }
  }
  return false
}

const findParentId = (nodes: ProductModule[], targetId: number, parentId?: number): number | undefined => {
  for (const node of nodes) {
    if (node.id === targetId) return parentId
    if (node.children) {
      const result = findParentId(node.children, targetId, node.id)
      if (result !== undefined) return result
    }
  }
  return undefined
}

// ─── Parent Menu Options ──────────────────────────────────────────────

const parentMenuOptions = computed(() => {
  const options: { label: string; value: number }[] = []

  const traverse = (nodes: ProductModule[], prefix = '') => {
    for (const node of nodes) {
      options.push({ label: prefix + node.name, value: node.id })
      if (node.children) {
        traverse(node.children, prefix + '\u00A0\u00A0\u00A0')
      }
    }
  }

  traverse(tableData.value)
  return options
})

// ─── Module Modal ─────────────────────────────────────────────────────

const moduleModalVisible = ref(false)
const isEditMode = ref(false)
const editingModuleId = ref<number | null>(null)
const currentModule = ref<ProductModule | null>(null)
const viewDialogVisible = ref(false)
const viewingModule = ref<ProductModule | null>(null)

const findModuleInTree = (nodes: ProductModule[], id: number): ProductModule | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findModuleInTree(node.children, id)
      if (found) return found
    }
  }
  return null
}

const handleModuleSubmit = async (module: ProductModule, isEdit: boolean) => {
  try {
    const api = isEdit ? '/api/product/module/update' : '/api/product/module/create'
    const method = isEdit ? 'PUT' : 'POST'

    const response = await fetch(api, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: isEdit ? editingModuleId.value : undefined,
        name: module.name,
        type: module.type,
        parentId: module.parentId,
        status: module.status,
        description: module.description
      })
    })
    const result = await response.json()
    if (result.code === 200) {
      if (isEdit && editingModuleId.value !== null) {
        const mod = findModuleInTree(tableData.value, editingModuleId.value)
        if (mod) {
          mod.name = module.name
          mod.type = module.type
          mod.status = module.status
          mod.description = module.description
        }
        ElMessage.success('编辑成功')
      } else {
        const newModule: ProductModule = {
          id: Date.now(),
          name: module.name,
          type: module.type,
          status: module.status,
          description: module.description,
          children: []
        }

        if (module.type === '产品') {
          tableData.value.push(newModule)
        } else {
          const parent = findModuleInTree(tableData.value, module.parentId || 0)
          if (parent) {
            if (!parent.children) parent.children = []
            parent.children.push(newModule)
          } else {
            tableData.value.push(newModule)
          }
        }
        ElMessage.success('新增成功')
      }
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleModalClose = () => {
  isEditMode.value = false
  editingModuleId.value = null
  currentModule.value = null
}

// ─── Lifecycle ────────────────────────────────────────────────────────

onMounted(() => {
  fetchData()
})
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
