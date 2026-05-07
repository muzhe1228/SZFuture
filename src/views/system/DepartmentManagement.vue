<template>
  <div class="department-management">
    <!-- Base Table Page -->
    <BaseTablePage
      :search-fields="searchFields"
      :columns="columns"
      :actions="tableActions"
      :fetch-data="fetchData"
      title="部门管理"
      storage-key="department-management"
      :show-column-settings="true"
      :show-selection="false"
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
    </BaseTablePage>

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
import { ref, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { Department } from '@/types/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import { BaseTablePage } from '@/components/BaseTablePage'
import DepartmentForm from '@/components/Dialog/DepartmentManagement/DepartmentForm.vue'
import type { ActionButton } from '@/components/DataTable/types'
import { departmentColumns } from '@/config/system/columns'
import { departmentSearchFields } from '@/config/system/searchFields'
import request from '@/utils/request'

// ─── Search Form ──────────────────────────────────────────────────────

// 搜索字段配置已移至 @/config/system/searchFields.ts
const searchFields = departmentSearchFields

// ─── Table Config ─────────────────────────────────────────────────────

// 表格列配置已移至 @/config/system/columns.ts
const columns = ref(departmentColumns)

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

// ─── Fetch Data ───────────────────────────────────────────────────────

const fetchData = async (_formData?: Record<string, any>) => {
  try {
    const res = await request.get<Department[]>('/api/department/tree')
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
    const list = data.map((item: any) => mapDepartment(item))
    return {
      list,
      total: list.length
    }
  } catch (error) {
    ElMessage.error('获取部门数据失败')
    return { list: [], total: 0 }
  }
}

// ─── Parent Department Options for Modal ──────────────────────────────

const parentDeptOptions = computed(() => {
  const options: { label: string; value: number }[] = [
    { label: '顶级部门', value: 0 }
  ]
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
    ElMessage.success('删除成功')
  } catch {
    // User cancelled
  }
}

// ─── Department Modal ─────────────────────────────────────────────────

const deptModalVisible = ref(false)
const isEditMode = ref(false)
const editingDeptId = ref<number | null>(null)
const currentDepartment = ref<Department | null>(null)

const handleDepartmentSubmit = (_department: Department, isEdit: boolean) => {
  if (isEdit) {
    ElMessage.success('编辑成功')
  } else {
    ElMessage.success('新增成功')
  }
}

const handleModalClose = () => {
  isEditMode.value = false
  editingDeptId.value = null
  currentDepartment.value = null
}
</script>

<style lang="scss" scoped>
.department-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}
</style>
