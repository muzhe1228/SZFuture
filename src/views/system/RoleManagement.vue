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
        <el-button type="primary" size="small" @click="handleAdd" :icon="Plus">新增角色</el-button>
        <el-button
          type="danger"
          size="small"
          plain
          @click="() => handleBatchDelete(selectedRoles)"
          :disabled="selectedRoles.length === 0"
          >删除角色</el-button
        >
      </template>
    </BaseTablePage>

    <!-- Add/Edit Role Modal -->
    <RoleForm
      v-model="modalVisible"
      :is-edit-mode="isEditMode"
      :role="currentItem"
      @submit="handleSubmit"
      @close="handleClose"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  import type { Role } from '@/types/index'
  import { ElMessage } from 'element-plus'
  import { BaseTablePage } from '@/components/BaseTablePage'
  import RoleForm from '@/components/Dialog/RoleManagement/RoleForm.vue'
  import type { ActionButton } from '@/components/DataTable/types'
  import { roleColumns } from '@/config/system/columns'
  import { roleSearchFields } from '@/config/system/searchFields'
  import request from '@/utils/request'
  import { useCrud } from '@/composables/useCrud'

  // ─── Search Form ──────────────────────────────────────────────────────

  const searchFields = roleSearchFields

  // ─── Table Config ─────────────────────────────────────────────────────

  const columns = ref(roleColumns)

  const tableActions: ActionButton[] = [
    { key: 'view', label: '查看', type: 'primary' },
    { key: 'edit', label: '编辑', type: 'success' },
    { key: 'delete', label: '删除', type: 'danger' },
  ]

  // ─── Table Data ───────────────────────────────────────────────────────

  const selectedRoles = ref<Role[]>([])

  const refreshList = async () => {}

  const {
    modalVisible,
    isEditMode,
    currentItem,
    handleAdd,
    handleEdit,
    handleView,
    handleDelete,
    handleBatchDelete,
    handleSubmit,
    handleClose,
  } = useCrud<Role>({
    fetchList: refreshList,
    deleteApi: async (id) => {
      await request({
        url: '/api/role/delete',
        method: 'delete',
        params: { id },
      })
    },
    onSubmit: async (role, isEdit) => {
      if (isEdit && role.id) {
        await request({
          url: '/api/role/update',
          method: 'put',
          data: role,
        })
      } else {
        await request({
          url: '/api/role/create',
          method: 'post',
          data: role,
        })
      }
    },
  })

  const fetchData = async (formData?: Record<string, any>, page: number = 1, pageSize: number = 20) => {
    try {
      const params: Record<string, any> = {
        page,
        pageSize,
      }
      if (formData?.name) {
        params.name = formData.name
      }

      const res = await request({
        url: '/api/role/list',
        method: 'get',
        params,
      })

      const list = ((res as any).data?.list || (res as any).list || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        status: item.status === '禁用' ? '停用' : item.status,
        sort: item.sort || 80,
        description: item.description,
        createTime: item.createTime,
      }))
      return {
        list,
        total: (res as any).data?.total ?? (res as any).total ?? 0,
      }
    } catch {
      ElMessage.error('获取角色列表失败')
      return { list: [], total: 0 }
    }
  }

  const handleSelectionChange = (selection: Role[]) => {
    selectedRoles.value = selection
  }

  const handleTableAction = (action: string, row: Role) => {
    if (action === 'view') {
      handleView(row)
    } else if (action === 'edit') {
      handleEdit(row)
    } else if (action === 'delete') {
      handleDelete(row)
    }
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
