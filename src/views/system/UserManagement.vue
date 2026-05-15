<template>
  <div class="user-management">
    <!-- Middle Panel: Organization Tree -->
    <div class="org-tree-panel">
      <div class="panel-header">
        <span class="panel-title">组织列表</span>
      </div>
      <div class="tree-search">
        <el-input v-model="treeKeyword" placeholder="请输入关键字" clearable size="small" @input="handleTreeSearch">
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>
      <div class="tree-container">
        <el-tree :data="orgTreeData" :props="treeProps" :expand-on-click-node="false"
          :default-expanded-keys="defaultExpandedKeys" :filter-node-method="filterNode" node-key="id" highlight-current
          @node-click="handleNodeClick" ref="treeRef">
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
      <!-- Base Table Page -->
      <BaseTablePage :search-fields="searchFields" :columns="columns" :actions="tableActions" :fetch-data="fetchData"
        title="用户管理" storage-key="user-management" :show-column-settings="true" :show-selection="true"
        @action="handleTableAction" @selection-change="handleSelectionChange">
        <template #cell-status="{ row }">
          <StatusTag :status="row.status" :status-map="statusMap" size="small" />
        </template>
        <template #extra-actions>
          <el-button type="warning" link @click="handleBatchImport" :icon="Upload"> 批量导入用户 </el-button>
          <el-button type="primary" link @click="handleAdd" :icon="Plus"> 新增用户 </el-button>
          <el-button type="danger" link plain @click="handleBatchDelete(selectedUsers)"
            :disabled="selectedUsers.length === 0">
            删除用户
          </el-button>
        </template>
      </BaseTablePage>
    </div>

    <!-- Add/Edit/View User Modal -->
    <UserForm v-model="modalVisible" :is-edit-mode="isEditMode" :view-mode="!isEditMode && currentItem !== null" :user="currentItem"
      :department-options="departmentOptions" :permission-options="permissionOptions" @submit="handleSubmit"
      @close="handleClose" />

    <!-- Delete User Modal -->
    <DeleteModal 
      v-model="deleteModalVisible" 
      :title-text="deleteModalTitle"
      @confirm="confirmDelete"
    />

    <!-- Batch Delete Modal -->
    <DeleteModal 
      v-model="batchDeleteModalVisible" 
      :title-text="`确定要删除选中的 ${selectedItems.length} 个用户吗？`"
      @confirm="confirmBatchDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Upload, OfficeBuilding, Folder, Search } from '@element-plus/icons-vue'
import type { User, OrgTreeNode } from '@/types/index'
import { ElMessage } from 'element-plus'
import type { ElTree } from 'element-plus'
import { BaseTablePage } from '@/components/BaseTablePage'
import { StatusTag } from '@/components/StatusTag'
import UserForm from '@/components/Dialog/UserManagement/UserForm.vue'
import DeleteModal from '@/components/Dialog/common/DeleteModal.vue'
import type { ActionButton } from '@/components/DataTable/types'
import { userColumns } from '@/config/system/columns'
import { userSearchFields } from '@/config/system/searchFields'
import request from '@/utils/request'
import { useCrud } from '@/composables/useCrud'

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
              { id: 122, label: '技术部二组' },
            ],
          },
          { id: 13, label: '财务部' },
          { id: 14, label: '人事部' },
          { id: 15, label: '销售部' },
        ],
      },
      {
        id: 2,
        label: '华中分部',
        children: [
          { id: 21, label: '研发部' },
          { id: 22, label: '技术部' },
          { id: 23, label: '销售部' },
        ],
      },
    ],
  },
])

const treeProps = {
  children: 'children',
  label: 'label',
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
  fetchData({})
}

// ─── Search Form ──────────────────────────────────────────────────────

const searchFields = userSearchFields

// ─── Status Tag Type ──────────────────────────────────────────────────

const statusMap = {
  启用: 'success',
  禁用: 'danger',
}

// ─── Table Config ─────────────────────────────────────────────────────

const columns = ref(userColumns)

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary' ,icon:'IconShow'},
  { key: 'edit', label: '编辑', type: 'success', icon: 'IconEdit' },
  { key: 'delete', label: '删除', type: 'danger', icon: 'IconDel' },
]

// ─── Table Data ───────────────────────────────────────────────────────

const tableLoading = ref(false)
const selectedUsers = ref<User[]>([])

const refreshList = async () => {
  await fetchData({})
}

const {
  modalVisible,
  deleteModalVisible,
  batchDeleteModalVisible,
  isEditMode,
  currentItem,
  currentDeleteItem,
  selectedItems,
  handleAdd,
  handleEdit,
  handleView,
  handleDelete,
  confirmDelete,
  handleBatchDelete,
  confirmBatchDelete,
  handleSubmit,
  handleClose,
} = useCrud<User>({
  fetchList: refreshList,
  deleteApi: async (id) => {
    await request({
      url: '/api/user/delete',
      method: 'delete',
      params: { id },
    })
  },
  onSubmit: async (user, isEdit) => {
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
      avatar: user.avatar,
    }

    if (isEdit && user.id) {
      await request({
        url: '/api/user/update',
        method: 'put',
        data: { id: user.id, ...userData },
      })
    } else {
      await request({
        url: '/api/user/create',
        method: 'post',
        data: userData,
      })
    }
  },
})

const deleteModalTitle = computed(() => {
  const name = currentDeleteItem.value?.name || currentDeleteItem.value?.username || ''
  return `确定要删除用户 "${name}" 吗？`
})

const fetchData = async (formData?: Record<string, any>, page: number = 1, pageSize: number = 20) => {
  tableLoading.value = true
  try {
    const params: Record<string, any> = {
      page,
      pageSize,
    }

    const keywordParts: string[] = []
    if (formData?.name) keywordParts.push(formData.name)
    if (formData?.phone) keywordParts.push(formData.phone)
    if (formData?.username) keywordParts.push(formData.username)
    if (formData?.status) keywordParts.push(formData.status)

    if (keywordParts.length > 0) {
      params.keyword = keywordParts.join(' ')
    }

    if (selectedOrgNode.value && selectedOrgNode.value.id !== 0) {
      params.department = selectedOrgNode.value.label
    }

    const res = await request({
      url: '/api/user/list',
      method: 'get',
      params,
    })

    if ((res as any).code === 200) {
      return {
        list: (res as any).data.list,
        total: (res as any).data.total,
      }
    }
    return { list: [], total: 0 }
  } catch {
    ElMessage.error('获取用户列表失败')
    return { list: [], total: 0 }
  } finally {
    tableLoading.value = false
  }
}

const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection
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

// ─── User Form Options ────────────────────────────────────────────────

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
  { label: '华中分部-销售部', value: '华中分部-销售部' },
]

const permissionOptions = [
  { label: '系统管理', value: 'system' },
  { label: '用户管理', value: 'user' },
  { label: '角色管理', value: 'role' },
  { label: '授权管理', value: 'auth' },
  { label: '产品管理', value: 'product' },
  { label: '审批管理', value: 'approval' },
  { label: '运维管理', value: 'operation' },
  { label: '消息管理', value: 'message' },
]
</script>

<style lang="scss" scoped>
.user-management {
  display: flex;
  height: 100%;
  gap: 1px;
}

.org-tree-panel {
  width: 260px;
  min-width: 260px;
  background-color: var(--el-bg-color);
  display: flex;
  flex-direction: column;
  border-radius: 8px;

  .panel-header {
    padding: 16px 16px 12px;
    border-bottom: 1px solid #ebeef5;

    .panel-title {
      font-size: 16px;
      font-weight: 500;
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
        font-size: 14px;
      }
    }
  }
}

.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 15px;
  overflow-y: auto;
}

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
