<template>
  <div class="role-management">
    <!-- Base Table Page -->
    <BaseTablePage
      :search-fields="searchFields"
      :columns="columns"
      :actions="tableActions"
      :fetch-data="fetchData"
      title="角色管理"
      storage-key="role-management"
      :show-column-settings="true"
      :show-selection="true"
      @action="handleTableAction"
      @selection-change="handleSelectionChange"
    >
      <template #cell-status="{ row }">
        <el-tag :type="row.status === '启用' ? 'success' : 'danger'" size="small">
          {{ row.status }}
        </el-tag>
      </template>
      <template #extra-actions>
        <el-button type="primary" size="small" @click="handleAddRole" :icon="Plus">新增角色</el-button>
        <el-button type="danger" size="small" plain @click="handleBatchDelete" :disabled="selectedRoles.length === 0">删除角色</el-button>
      </template>
    </BaseTablePage>

    <!-- Add/Edit Role Modal -->
    <RoleForm 
      v-model="roleModalVisible" 
      :is-edit-mode="isEditMode" 
      :role="currentRole" 
      @submit="handleRoleSubmit" 
      @close="handleModalClose" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { Role } from '@/types/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import { BaseTablePage } from '@/components/BaseTablePage'
import RoleForm from '@/components/Dialog/RoleManagement/RoleForm.vue'
import type { ActionButton } from '@/components/DataTable/types'
import { roleColumns } from '@/config/system/columns'
import { roleSearchFields } from '@/config/system/searchFields'
import request from '@/utils/request'

// ─── Search Form ──────────────────────────────────────────────────────

// 搜索字段配置已移至 @/config/system/searchFields.ts
const searchFields = roleSearchFields

// ─── Table Config ─────────────────────────────────────────────────────

// 表格列配置已移至 @/config/system/columns.ts
const columns = ref(roleColumns)

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary' },
  { key: 'edit', label: '编辑', type: 'success' },
  { key: 'delete', label: '删除', type: 'danger' }
]

const handleTableAction = (action: string, row: Role) => {
  if (action === 'view') {
    handleView(row)
  } else if (action === 'edit') {
    handleEdit(row)
  } else if (action === 'delete') {
    handleDelete(row)
  }
}

// ─── Table Data ───────────────────────────────────────────────────────

const selectedRoles = ref<Role[]>([])

const fetchData = async (formData?: Record<string, any>, page: number = 1, pageSize: number = 20) => {
  try {
    const params: Record<string, any> = {
      page,
      pageSize
    }
    if (formData?.name) {
      params.name = formData.name
    }

    const res = await request({
      url: '/api/role/list',
      method: 'get',
      params
    })

    // 映射mock数据中的字段到Role类型
    const list = ((res as any).data?.list || (res as any).list || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      status: item.status === '禁用' ? '停用' : item.status, // 映射status值
      sort: item.sort || 80, // 提供默认值
      description: item.description,
      createTime: item.createTime
    }))
    return {
      list,
      total: (res as any).data?.total ?? (res as any).total ?? 0
    }
  } catch (error) {
    ElMessage.error('获取角色列表失败')
    return { list: [], total: 0 }
  }
}

const handleSelectionChange = (selection: Role[]) => {
  selectedRoles.value = selection
}

// ─── Action Handlers ──────────────────────────────────────────────────

const handleAddRole = () => {
  isEditMode.value = false
  currentRole.value = null
  roleModalVisible.value = true
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRoles.value.length} 个角色吗？`,
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

const handleView = (row: Role) => {
  ElMessage.info(`查看角色: ${row.name}`)
}

const handleEdit = (row: Role) => {
  isEditMode.value = true
  editingRoleId.value = row.id
  currentRole.value = row
  roleModalVisible.value = true
}

const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${row.name}" 吗？`,
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

// ─── Role Modal ───────────────────────────────────────────────────────

const roleModalVisible = ref(false)
const isEditMode = ref(false)
const editingRoleId = ref<number | null>(null)
const currentRole = ref<Role | null>(null)

const handleRoleSubmit = (_role: Role, isEdit: boolean) => {
  ElMessage.success(isEdit ? '编辑成功' : '新增成功')
}

const handleModalClose = () => {
  isEditMode.value = false
  editingRoleId.value = null
  currentRole.value = null
}
</script>

<style lang="scss" scoped>
.role-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}
</style>
