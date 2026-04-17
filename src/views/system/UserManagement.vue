<template>
  <div class="user-management">
    <!-- Middle Panel: Organization Tree -->
    <div class="org-tree-panel">
      <div class="panel-header">
        <span class="panel-title">组织列表</span>
      </div>
      <div class="tree-search">
        <el-input
          v-model="treeKeyword"
          placeholder="请输入关键字"
          clearable
          size="small"
          @input="handleTreeSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="tree-container">
        <el-tree
          :data="orgTreeData"
          :props="treeProps"
          :expand-on-click-node="false"
          :default-expanded-keys="defaultExpandedKeys"
          :filter-node-method="filterNode"
          node-key="id"
          highlight-current
          @node-click="handleNodeClick"
          ref="treeRef"
        >
          <template #default="{ node, data }">
            <span class="custom-tree-node">
              <el-icon v-if="data.children && data.children.length" class="node-icon">
                <OfficeBuilding />
              </el-icon>
              <el-icon v-else class="node-icon">
                <Folder />
              </el-icon>
              <span>{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </div>
    </div>

    <!-- Right Panel: Main Content -->
    <div class="main-panel">
      <!-- Search Bar -->
      <SearchForm
        :fields="searchFields"
        :search-loading="tableLoading"
        :reset-loading="tableLoading"
        storage-key="user-search"
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
        title="用户管理"
        storage-key="user-management-table"
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
          <el-button type="warning" size="small" @click="handleBatchImport" :icon="Upload">
            批量导入用户
          </el-button>
          <el-button type="primary" size="small" @click="handleAddUser" :icon="Plus">
            新增用户
          </el-button>
          <el-button type="danger" size="small" plain @click="handleBatchDelete" :disabled="selectedUsers.length === 0">
            删除用户
          </el-button>
        </template>
      </DataTable>
    </div>

    <!-- Add/Edit User Modal -->
    <UserForm 
      v-model="userModalVisible" 
      :is-edit-mode="isEditMode" 
      :user="currentUser" 
      :department-options="departmentOptions" 
      :permission-options="permissionOptions" 
      @submit="handleUserSubmit" 
      @close="handleModalClose" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { Plus, Upload, OfficeBuilding, Folder } from '@element-plus/icons-vue'
import type { User, OrgTreeNode } from '@/types/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ElTree } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { DataTable } from '@/components/DataTable'
import UserForm from '@/components/Dialog/UserManagement/UserForm.vue'
import type { ColumnConfig, ActionButton } from '@/components/DataTable/types'
import type { SearchField } from '@/components/SearchForm/types'
import request from '@/utils/request'

// ─── Organization Tree ────────────────────────────────────────────────

const treeKeyword = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()

const orgTreeData = ref<OrgTreeNode[]>([
  {
    id: 0,
    label: '全部',
    children: [
      {
        id: 1,
        label: '华东分部',
        children: [
          { id: 11, label: '研发部' },
          {
            id: 12,
            label: '技术部',
            children: [
              { id: 121, label: '技术部一组' },
              { id: 122, label: '技术部二组' }
            ]
          },
          { id: 13, label: '财务部' },
          { id: 14, label: '人事部' },
          { id: 15, label: '销售部' }
        ]
      },
      {
        id: 2,
        label: '华中分部',
        children: [
          { id: 21, label: '研发部' },
          { id: 22, label: '技术部' },
          { id: 23, label: '销售部' }
        ]
      }
    ]
  }
])

const treeProps = {
  children: 'children',
  label: 'label'
}

const defaultExpandedKeys = [0, 1, 12]

const selectedOrgNode = ref<OrgTreeNode | null>(null)

const handleTreeSearch = () => {
  treeRef.value?.filter(treeKeyword.value)
}

const filterNode = (value: string, data: OrgTreeNode) => {
  if (!value) return true
  return data.label.includes(value)
}

const handleNodeClick = (data: OrgTreeNode) => {
  selectedOrgNode.value = data
  pagination.currentPage = 1
  fetchData()
}

// ─── Search Form ──────────────────────────────────────────────────────

const searchFields = computed<SearchField[]>(() => [
  { prop: 'name', label: '姓名', type: 'input', placeholder: '请输入' },
  { prop: 'phone', label: '手机号', type: 'input', placeholder: '请输入' },
  { prop: 'username', label: '用户名', type: 'input', placeholder: '请输入' },
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

const searchParams = ref<Record<string, any>>({})

const handleSearch = (formData: Record<string, any>) => {
  pagination.currentPage = 1
  searchParams.value = { ...formData }
  fetchData()
}

const handleReset = () => {
  pagination.currentPage = 1
  searchParams.value = {}
  fetchData()
  ElMessage.success('重置成功')
}

// ─── Table Config ─────────────────────────────────────────────────────

const columns = ref<ColumnConfig[]>([
  { key: 'name', label: '姓名', prop: 'name', minWidth: '100', visible: true },
  { key: 'username', label: '用户名', prop: 'username', minWidth: '120', visible: true },
  { key: 'phone', label: '手机号', prop: 'phone', minWidth: '130', visible: true },
  { key: 'email', label: '邮箱', prop: 'email', minWidth: '180', visible: true, showOverflowTooltip: true },
  { key: 'createTime', label: '创建时间', prop: 'createTime', minWidth: '170', visible: true },
  { key: 'status', label: '状态', prop: 'status', width: '90', align: 'center', visible: true, hasTemplate: true }
])

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary' },
  { key: 'edit', label: '编辑', type: 'success' },
  { key: 'delete', label: '删除', type: 'danger' }
]

// ─── Table Data ───────────────────────────────────────────────────────

const tableLoading = ref(false)
const selectedUsers = ref<User[]>([])
const tableData = ref<User[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const fetchData = async () => {
  tableLoading.value = true
  try {
    const params: Record<string, any> = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    }

    // Build keyword from search params
    const keywordParts: string[] = []
    if (searchParams.value.name) keywordParts.push(searchParams.value.name)
    if (searchParams.value.phone) keywordParts.push(searchParams.value.phone)
    if (searchParams.value.username) keywordParts.push(searchParams.value.username)
    if (searchParams.value.status) keywordParts.push(searchParams.value.status)

    if (keywordParts.length > 0) {
      params.keyword = keywordParts.join(' ')
    }

    // Apply org filter if a node is selected
    if (selectedOrgNode.value && selectedOrgNode.value.id !== 0) {
      params.department = selectedOrgNode.value.label
    }

    const res = await request({
      url: '/api/user/list',
      method: 'get',
      params
    })

    if ((res as any).code === 200) {
      tableData.value = (res as any).data.list
      pagination.total = (res as any).data.total
    }
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    tableLoading.value = false
  }
}

const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
}

const handlePageChange = (page: number, size: number) => {
  pagination.currentPage = page
  pagination.pageSize = size
  fetchData()
}

const handleTableAction = (action: string, row: User) => {
  if (action === 'view') {
    handleView(row)
  } else if (action === 'edit') {
    handleEdit(row)
  } else if (action === 'delete') {
    handleDelete(row)
  }
}

// ─── Action Handlers ──────────────────────────────────────────────────

const handleBatchImport = () => {
  ElMessage.info('批量导入用户功能开发中...')
}

const handleAddUser = () => {
  isEditMode.value = false
  currentUser.value = null
  userModalVisible.value = true
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const ids = selectedUsers.value.map(u => u.id)
    await request({
      url: '/api/user/batch-delete',
      method: 'post',
      data: { ids }
    })
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // User cancelled
  }
}

const handleView = (row: User) => {
  ElMessage.info(`查看用户: ${row.name}`)
}

const handleEdit = (row: User) => {
  isEditMode.value = true
  editingUserId.value = row.id
  currentUser.value = row
  userModalVisible.value = true
}

const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await request({
      url: '/api/user/delete',
      method: 'delete',
      params: { id: row.id }
    })
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // User cancelled
  }
}

// ─── User Modal ───────────────────────────────────────────────────────

const userModalVisible = ref(false)
const isEditMode = ref(false)
const editingUserId = ref<number | null>(null)
const currentUser = ref<User | null>(null)

const departmentOptions = [
  { label: '华东分部-研发部', value: '华东分部-研发部' },
  { label: '华东分部-技术部', value: '华东分部-技术部' },
  { label: '华东分部-技术部一组', value: '华东分部-技术部一组' },
  { label: '华东分部-技术部二组', value: '华东分部-技术部二组' },
  { label: '华东分部-财务部', value: '华东分部-财务部' },
  { label: '华东分部-人事部', value: '华东分部-人事部' },
  { label: '华东分部-销售部', value: '华东分部-销售部' },
  { label: '华中分部-研发部', value: '华中分部-研发部' },
  { label: '华中分部-技术部', value: '华中分部-技术部' },
  { label: '华中分部-销售部', value: '华中分部-销售部' }
]

const permissionOptions = [
  { label: '系统管理', value: 'system' },
  { label: '用户管理', value: 'user' },
  { label: '角色管理', value: 'role' },
  { label: '授权管理', value: 'auth' },
  { label: '产品管理', value: 'product' },
  { label: '审批管理', value: 'approval' },
  { label: '运维管理', value: 'operation' },
  { label: '消息管理', value: 'message' }
]

const handleUserSubmit = async (user: User, isEdit: boolean) => {
  try {
    const userData = {
      name: user.name,
      username: user.username,
      phone: user.phone,
      email: user.email,
      department: user.department,
      gender: user.gender,
      position: user.position,
      permission: user.permission ? user.permission.split(',') : [],
      status: user.status,
      remarks: user.remarks,
      avatar: user.avatar
    }

    if (isEdit && editingUserId.value) {
      await request({
        url: '/api/user/update',
        method: 'put',
        data: { id: editingUserId.value, ...userData }
      })
      ElMessage.success('编辑成功')
    } else {
      await request({
        url: '/api/user/create',
        method: 'post',
        data: userData
      })
      ElMessage.success('新增成功')
    }

    fetchData()
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleModalClose = () => {
  isEditMode.value = false
  editingUserId.value = null
  currentUser.value = null
}

// ─── Lifecycle ────────────────────────────────────────────────────────

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.user-management {
  display: flex;
  height: 100%;
  gap: 1px;
}

// ─── Organization Tree Panel ─────────────────────────────────────────

.org-tree-panel {
  width: 260px;
  min-width: 260px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ebeef5;
  border-radius: 8px;

  .panel-header {
    padding: 16px 16px 12px;
    border-bottom: 1px solid #ebeef5;

    .panel-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .tree-search {
    padding: 12px 16px;

    .el-input {
      --el-input-border-color: #dcdfe6;
    }
  }

  .tree-container {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px 16px;

    .el-tree {
      --el-tree-node-hover-bg-color: #f5f7fa;
    }

    .custom-tree-node {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;

      .node-icon {
        color: #909399;
        font-size: 14px;
      }
    }
  }
}

// ─── Main Content Panel ──────────────────────────────────────────────

.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 15px;
  overflow-y: auto;
}





// ─── Responsive ──────────────────────────────────────────────────────

@media (max-width: 1200px) {
  .org-tree-panel {
    width: 220px;
    min-width: 220px;
  }
}

@media (max-width: 992px) {
  .user-management {
    flex-direction: column;
  }

  .org-tree-panel {
    width: 100%;
    min-width: unset;
    max-height: 240px;
    border-right: none;
    border-bottom: 1px solid #ebeef5;
  }
}
</style>