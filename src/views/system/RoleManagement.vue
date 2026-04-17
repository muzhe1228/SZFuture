<template>
  <div class="role-management">
    <!-- Search Bar -->
    <SearchForm :fields="searchFields" storage-key="role-management-search" :search-loading="tableLoading"
      :reset-loading="tableLoading" @search="handleSearch" @reset="handleReset" />

    <!-- Data Table -->
    <DataTable
      :columns="columns"
      :data="tableData"
      :loading="tableLoading"
      :total="pagination.total"
      :current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      title="角色管理"
      storage-key="role-management-table"
      :show-column-settings="true"
      :show-selection="true"
      :actions="tableActions"
      row-key="id"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
      @action="handleTableAction"
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
    </DataTable>

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
import { ref, computed, onMounted, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { Role } from '@/types/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { DataTable } from '@/components/DataTable'
import RoleForm from '@/components/Dialog/RoleManagement/RoleForm.vue'
import type { ColumnConfig, ActionButton } from '@/components/DataTable/types'
import type { SearchField } from '@/components/SearchForm/types'
import request from '@/utils/request'



// ─── Search Form ──────────────────────────────────────────────────────

const searchFields = computed<SearchField[]>(() => [
  { prop: 'name', label: '角色名称', type: 'input', placeholder: '请输入' }
])

const handleSearch = (formData: Record<string, any>) => {
  pagination.currentPage = 1
  fetchData(formData)
}

const handleReset = () => {
  pagination.currentPage = 1
  fetchData()
  ElMessage.success('重置成功')
}

// ─── Table Config ─────────────────────────────────────────────────────

const columns = ref<ColumnConfig[]>([
  { key: 'name', label: '角色名称', prop: 'name', minWidth: '140', visible: true },
  { key: 'status', label: '状态', prop: 'status', width: '90', align: 'center', visible: true, hasTemplate: true },
  { key: 'sort', label: '排序', prop: 'sort', width: '140', align: 'center', visible: true },
  { key: 'description', label: '描述', prop: 'description', minWidth: '260', visible: true, showOverflowTooltip: true },
  { key: 'createTime', label: '创建时间', prop: 'createTime', minWidth: '170', visible: true }
])

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

const handlePageChange = (page: number, size: number) => {
  pagination.currentPage = page
  pagination.pageSize = size
  fetchData()
}

// ─── Table Data ───────────────────────────────────────────────────────

const tableLoading = ref(false)
const selectedRoles = ref<Role[]>([])
const tableData = ref<Role[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const fetchData = async (formData?: Record<string, any>) => {
  tableLoading.value = true
  try {
    const params: Record<string, any> = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
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
    tableData.value = ((res as any).data?.list || (res as any).list || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      status: item.status === '禁用' ? '停用' : item.status, // 映射status值
      sort: item.sort || 80, // 提供默认值
      description: item.description,
      createTime: item.createTime
    }))
    pagination.total = (res as any).data?.total ?? (res as any).total ?? 0
  } catch (error) {
    ElMessage.error('获取角色列表失败')
    console.error('Failed to fetch role list:', error)
  } finally {
    tableLoading.value = false
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
    const ids = selectedRoles.value.map(r => r.id)
    tableData.value = tableData.value.filter(r => !ids.includes(r.id))
    pagination.total = Math.max(0, pagination.total - ids.length)
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
    tableData.value = tableData.value.filter(r => r.id !== row.id)
    pagination.total = Math.max(0, pagination.total - 1)
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

const handleRoleSubmit = (role: Role, isEdit: boolean) => {
  if (isEdit && editingRoleId.value) {
    const index = tableData.value.findIndex(r => r.id === editingRoleId.value)
    if (index !== -1) {
      tableData.value[index] = {
        ...tableData.value[index],
        name: role.name,
        description: role.description,
        status: role.status,
        sort: role.sort
      }
    }
    ElMessage.success('编辑成功')
  } else {
    tableData.value.unshift(role)
    pagination.total += 1
    ElMessage.success('新增成功')
  }
}

const handleModalClose = () => {
  isEditMode.value = false
  editingRoleId.value = null
  currentRole.value = null
}

// ─── Lifecycle ────────────────────────────────────────────────────────

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.role-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}


// ─── Role Form Modal ─────────────────────────────────────────────────



// ─── Responsive ──────────────────────────────────────────────────────

@media (max-width: 992px) {
  .search-fields {
    flex-direction: column;
    align-items: stretch;

    .search-field {
      width: 100%;

      .el-input {
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
