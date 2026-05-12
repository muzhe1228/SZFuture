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
        <el-button type="primary" link @click="handleAdd" :icon="Plus"> 新增部门 </el-button>
      </template>
      <template #cell-status="{ row }">
        <el-tag :type="row.status === '启用' ? 'primary' : 'danger'" size="small">
          {{ row.status }}
        </el-tag>
      </template>
    </BaseTablePage>

    <!-- Add/Edit Department Modal -->
    <DepartmentForm
      v-model="modalVisible"
      :is-edit-mode="isEditMode"
      :department="currentItem"
      :parent-dept-options="parentDeptOptions"
      @submit="handleSubmit"
      @close="handleClose"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Plus } from '@element-plus/icons-vue'
  import type { Department } from '@/types/index'
  import { ElMessage } from 'element-plus'
  import { BaseTablePage } from '@/components/BaseTablePage'
  import DepartmentForm from '@/components/Dialog/DepartmentManagement/DepartmentForm.vue'
  import type { ActionButton } from '@/components/DataTable/types'
  import { departmentColumns } from '@/config/system/columns'
  import { departmentSearchFields } from '@/config/system/searchFields'
  import request from '@/utils/request'
  import { useCrud } from '@/composables/useCrud'

  // ─── Search Form ──────────────────────────────────────────────────────

  const searchFields = departmentSearchFields

  // ─── Table Config ─────────────────────────────────────────────────────

  const columns = ref(departmentColumns)

  const tableActions: ActionButton[] = [
    { key: 'view', label: '查看', type: 'primary', icon: 'IconShow' },
    { key: 'edit', label: '编辑', type: 'success', icon: 'IconEdit' },
    { key: 'delete', label: '删除', type: 'danger', icon: 'IconDel' },
  ]

  // ─── Fetch Data ───────────────────────────────────────────────────────

  const refreshList = async () => {}

  const {
    modalVisible,
    isEditMode,
    currentItem,
    handleAdd,
    handleEdit,
    handleView,
    handleDelete,
    handleSubmit,
    handleClose,
  } = useCrud<Department>({
    fetchList: refreshList,
    deleteApi: async (id) => {
      await request({
        url: '/api/department/delete',
        method: 'delete',
        params: { id },
      })
    },
    onSubmit: async (department, isEdit) => {
      if (isEdit && department.id) {
        await request({
          url: '/api/department/update',
          method: 'put',
          data: department,
        })
      } else {
        await request({
          url: '/api/department/create',
          method: 'post',
          data: department,
        })
      }
    },
  })

  const fetchData = async (_formData?: Record<string, any>) => {
    try {
      const res = await request.get<Department[]>('/api/department/tree')
      const mapDepartment = (dept: any): Department => ({
        id: dept.id,
        name: dept.name,
        parentId: dept.parentId || 0,
        sort: dept.sortOrder || 0,
        createTime: dept.createTime || new Date().toISOString(),
        status: dept.status || '启用',
        remarks: dept.remarks || dept.description || '',
        children: dept.children ? dept.children.map((child: any) => mapDepartment(child)) : undefined,
      })

      const data = Array.isArray(res) ? res : (res as any).data || (res as any).list || []
      const list = data.map((item: any) => mapDepartment(item))
      return {
        list,
        total: list.length,
      }
    } catch {
      ElMessage.error('获取部门数据失败')
      return { list: [], total: 0 }
    }
  }

  // ─── Parent Department Options for Modal ──────────────────────────────

  const parentDeptOptions = computed(() => {
    const options: { label: string; value: number }[] = [{ label: '顶级部门', value: 0 }]
    return options
  })

  const handleTableAction = (action: string, row: Department) => {
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
  .department-management {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    border-radius: 8px;
  }
</style>
