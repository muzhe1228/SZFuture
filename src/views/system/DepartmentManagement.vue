<template>
  <div class="department-management">
    <!-- Search Bar -->
    <SearchForm
      :fields="searchFields"
      :loading="tableLoading"
      storage-key="department-management-search"
      @search="handleSearch"
      @reset="handleReset"
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
      title="部门管理"
      storage-key="department-management-table"
      :show-column-settings="true"
      :show-selection="false"
      :actions="tableActions"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      :default-expand-all="true"
      @action="handleTableAction"
    >
      <template #extra-actions>
        <el-button type="primary" size="small" @click="handleAdd" :icon="Plus">
          新增部门
        </el-button>
      </template>
      <template #cell-status="{ row }">
        <el-tag :type="row.status === '启用' ? 'primary' : 'danger'" size="small">
          {{ row.status }}
        </el-tag>
      </template>
    </DataTable>

    <!-- Add/Edit Department Modal -->
    <DepartmentForm 
      v-model="deptModalVisible" 
      :is-edit-mode="isEditMode" 
      :department="currentDepartment" 
      :parent-dept-options="parentDeptOptions" 
      @submit="handleDepartmentSubmit" 
      @close="handleModalClose" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { Department } from '@/types/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { DataTable } from '@/components/DataTable'
import DepartmentForm from '@/components/Dialog/DepartmentManagement/DepartmentForm.vue'
import type { ColumnConfig, ActionButton } from '@/components/DataTable/types'
import type { SearchField } from '@/components/SearchForm/types'
import request from '@/utils/request'

// ─── Search Form ──────────────────────────────────────────────────────

const searchFields = computed<SearchField[]>(() => [
  { prop: 'name', label: '部门名称', type: 'input', placeholder: '请输入' },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '启用', value: '启用' },
      { label: '禁用', value: '禁用' }
    ]
  }
])

const handleSearch = (formData: Record<string, any>) => {
  currentFilters.value = { ...formData }
}

const handleReset = () => {
  currentFilters.value = {}
  fetchDepartments()
  ElMessage.success('重置成功')
}

// ─── Table Config ─────────────────────────────────────────────────────

const columns = ref<ColumnConfig[]>([
  { key: 'name', label: '部门名称', prop: 'name', minWidth: '180', visible: true },
  { key: 'sort', label: '部门排序', prop: 'sort', width: '100', align: 'center', visible: true },
  { key: 'createTime', label: '创建时间', prop: 'createTime', minWidth: '180', visible: true },
  { key: 'status', label: '部门状态', prop: 'status', width: '110', align: 'center', visible: true, hasTemplate: true },
  { key: 'remarks', label: '部门备注', prop: 'remarks', minWidth: '180', visible: true, showOverflowTooltip: true }
])

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary' },
  { key: 'edit', label: '编辑', type: 'success' },
  { key: 'delete', label: '删除', type: 'danger' }
]

const handleTableAction = (action: string, row: Department) => {
  if (action === 'view') {
    handleView(row)
  } else if (action === 'edit') {
    handleEdit(row)
  } else if (action === 'delete') {
    handleDelete(row)
  }
}

// ─── Table Data ───────────────────────────────────────────────────────

const tableLoading = ref(false)
const tableData = ref<Department[]>([])

// ─── API Calls ────────────────────────────────────────────────────────

const fetchDepartments = async () => {
  tableLoading.value = true
  try {
    const res = await request.get<Department[]>('/api/department/tree')
    console.log(res)
    // 映射mock数据中的字段到Department类型
    const mapDepartment = (dept: any): Department => ({
      id: dept.id,
      name: dept.name,
      parentId: dept.parentId || 0,
      sort: dept.sortOrder || 0, // 映射sortOrder到sort
      createTime: dept.createTime || new Date().toISOString(),
      status: dept.status || '启用',
      remarks: dept.remarks || dept.description || '', // 提供默认值，尝试从description字段获取
      children: dept.children ? dept.children.map((child: any) => mapDepartment(child)) : undefined
    })
    
    const data = Array.isArray(res) ? res : (res as any).data || (res as any).list || []
    tableData.value = data.map((item: any) => mapDepartment(item))
  } catch (error) {
    ElMessage.error('获取部门数据失败')
  } finally {
    tableLoading.value = false
  }
}

// ─── Filtered Data ────────────────────────────────────────────────────

const currentFilters = ref<Record<string, any>>({})

const filteredTableData = computed(() => {
  const filterNode = (nodes: Department[]): Department[] => {
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
      .filter(Boolean) as Department[]
  }

  return filterNode(tableData.value)
})

// ─── Parent Department Options for Modal ──────────────────────────────

const parentDeptOptions = computed(() => {
  const options: { label: string; value: number }[] = [
    { label: '顶级部门', value: 0 }
  ]

  const traverse = (nodes: Department[]) => {
    for (const node of nodes) {
      options.push({ label: node.name, value: node.id })
      if (node.children) {
        traverse(node.children)
      }
    }
  }

  traverse(tableData.value)
  return options
})

// ─── Action Handlers ──────────────────────────────────────────────────

const handleAdd = () => {
  isEditMode.value = false
  currentDepartment.value = null
  deptModalVisible.value = true
}

const handleView = (row: Department) => {
  ElMessage.info(`查看部门: ${row.name}`)
}

const handleEdit = (row: Department) => {
  isEditMode.value = true
  editingDeptId.value = row.id
  currentDepartment.value = row
  deptModalVisible.value = true
}

const handleDelete = async (row: Department) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除部门 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    removeDeptFromTree(tableData.value, row.id)
    ElMessage.success('删除成功')
  } catch {
    // User cancelled
  }
}

const removeDeptFromTree = (nodes: Department[], id: number): boolean => {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) {
      nodes.splice(i, 1)
      return true
    }
    if (nodes[i].children && removeDeptFromTree(nodes[i].children!, id)) {
      return true
    }
  }
  return false
}

// ─── Department Modal ─────────────────────────────────────────────────

const deptModalVisible = ref(false)
const isEditMode = ref(false)
const editingDeptId = ref<number | null>(null)
const currentDepartment = ref<Department | null>(null)

const findDeptInTree = (nodes: Department[], id: number): Department | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findDeptInTree(node.children, id)
      if (found) return found
    }
  }
  return null
}

const handleDepartmentSubmit = (department: Department, isEdit: boolean) => {
  if (isEdit && editingDeptId.value !== null) {
    // Update existing department
    const dept = findDeptInTree(tableData.value, editingDeptId.value)
    if (dept) {
      dept.name = department.name
      dept.parentId = department.parentId
      dept.sort = department.sort
      dept.status = department.status
      dept.remarks = department.remarks
    }
    ElMessage.success('编辑成功')
  } else {
    // Add new department
    const newDept: Department = {
      ...department,
      children: []
    }

    if (department.parentId === 0) {
      // Top-level department
      tableData.value.push(newDept)
    } else {
      // Child department
      const parent = findDeptInTree(tableData.value, department.parentId)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(newDept)
      } else {
        tableData.value.push(newDept)
      }
    }
    ElMessage.success('新增成功')
  }
}

const handleModalClose = () => {
  isEditMode.value = false
  editingDeptId.value = null
  currentDepartment.value = null
}

// ─── Lifecycle ────────────────────────────────────────────────────────

onMounted(() => {
  fetchDepartments()
})
</script>

<style lang="scss" scoped>
.department-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}




// ─── Responsive ──────────────────────────────────────────────────────

@media (max-width: 992px) {
  .search-fields {
    flex-direction: column;
    align-items: stretch;

    .search-field {
      width: 100%;

      .el-input,
      .el-select {
        width: 100%;
      }
    }
  }

  .search-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-actions {
    justify-content: flex-end;
  }
}
</style>
