<template>
  <Dialog v-model="dialogVisible" :title="isEditMode ? '编辑角色' : '新增角色'" width="900px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="roleFormRef" :model="roleForm" :rules="roleFormRules" label-width="80px" label-position="right" class="role-form">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="角色名称" prop="name">
            <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序">
            <el-input-number v-model="roleForm.sort" :min="0" :max="999" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="描述">
        <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请填写描述" />
      </el-form-item>

      <el-form-item label="状态" prop="statusEnabled">
        <el-switch v-model="roleForm.statusEnabled" active-text="启用" inactive-text="停用" inline-prompt />
      </el-form-item>

      <!-- Permission Settings -->
      <div class="permission-section">
        <div class="section-title">权限设置</div>
        <el-table :data="permissionTableData" border class="permission-table" :show-header="true" height="400px">
          <el-table-column prop="category" label="一级目录" width="160" />
          <el-table-column label="菜单" min-width="260">
            <template #default="{ row }">
              <div class="menu-cell">
                <el-checkbox v-model="row.menuChecked" @change="handleMenuCheck(row)">
                  {{ row.menuName }}
                </el-checkbox>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="按钮授权" min-width="280">
            <template #default="{ row }">
              <div class="buttons-cell">
                <el-checkbox-group v-model="row.selectedButtons">
                  <el-checkbox v-for="btn in row.buttons" :key="btn" :label="btn" :disabled="!row.menuChecked" />
                </el-checkbox-group>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Dialog } from '@/components/Dialog'
import type { FormInstance, FormRules } from 'element-plus'
import type { Role, PermissionNode } from '@/types/index'

interface PermissionRow {
  category: string
  menuName: string
  menuChecked: boolean
  buttons: string[]
  selectedButtons: string[]
}

const props = defineProps<{
  modelValue: boolean
  isEditMode: boolean
  role: Role | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [role: Role, isEdit: boolean]
  'close': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const roleFormRef = ref<FormInstance>()
const submitLoading = ref(false)

const roleForm = reactive({
  name: '',
  description: '',
  statusEnabled: true,
  sort: 80
})

const roleFormRules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }]
}

// Permission Data
const defaultPermissionData: PermissionNode[] = [
  {
    category: '工作台',
    subMenus: [
      { name: '数据统计', buttons: ['新增', '编辑', '删除'] },
      { name: '统计报表', buttons: ['新增', '编辑', '删除'] },
      { name: '消息通知', buttons: ['新增', '编辑', '删除'] }
    ]
  },
  {
    category: '授权管理',
    subMenus: [
      { name: '试用列表', buttons: ['新增', '编辑', '删除'] },
      { name: '授权列表', buttons: ['新增', '编辑', '删除', '审核'] },
      { name: '订单列表', buttons: ['新增', '编辑', '删除'] }
    ]
  },
  {
    category: '产品管理',
    subMenus: [
      { name: '111', buttons: ['新增', '编辑', '删除'] },
      { name: '112', buttons: ['新增', '编辑', '删除'] }
    ]
  },
  {
    category: '系统管理',
    subMenus: [
      { name: '113', buttons: ['新增', '编辑', '删除'] },
      { name: '114', buttons: ['新增', '编辑', '删除'] }
    ]
  },
  {
    category: '运维管理',
    subMenus: [
      { name: '115', buttons: ['详情'] },
      { name: '116', buttons: ['详情'] }
    ]
  }
]

const permissionTableData = ref<PermissionRow[]>([])

const initPermissionData = () => {
  permissionTableData.value = defaultPermissionData.flatMap(node =>
    node.subMenus.map(sub => ({
      category: node.category,
      menuName: sub.name,
      menuChecked: false,
      buttons: [...sub.buttons],
      selectedButtons: [] as string[]
    }))
  )
}

const handleMenuCheck = (row: PermissionRow) => {
  if (!row.menuChecked) {
    row.selectedButtons = []
  }
}

const resetRoleForm = () => {
  roleForm.name = ''
  roleForm.description = ''
  roleForm.statusEnabled = true
  roleForm.sort = 80
  roleFormRef.value?.clearValidate()
  initPermissionData()
}

const handleSubmit = async () => {
  if (!roleFormRef.value) return
  try {
    await roleFormRef.value.validate()
    submitLoading.value = true

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    const role: Role = {
      id: props.role?.id || Date.now(),
      name: roleForm.name,
      description: roleForm.description,
      status: roleForm.statusEnabled ? '启用' : '停用',
      sort: roleForm.sort,
      createTime: props.role?.createTime || new Date().toLocaleString('sv-SE').replace('T', ' ').padEnd(19, '0')
    }

    emit('submit', role, props.isEditMode)
    dialogVisible.value = false
  } catch {
    // Form validation failed
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleClose = () => {
  resetRoleForm()
  emit('close')
}

// Watch for role changes to update form
watch(() => props.role, (newRole) => {
  if (newRole) {
    roleForm.name = newRole.name
    roleForm.description = newRole.description
    roleForm.statusEnabled = newRole.status === '启用'
    roleForm.sort = newRole.sort
  } else {
    resetRoleForm()
  }
}, { immediate: true })

// Initialize permission data when component mounts
initPermissionData()
</script>

<style lang="scss" scoped>
.role-form {
  padding: 8px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.permission-section {
  margin-top: 8px;

  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 12px;
    padding-left: 4px;
    border-left: 3px solid #409eff;
    line-height: 1.2;
  }
}

.permission-table {
  :deep(.el-table__header-wrapper) {
    th {
      background-color: #fafafa;
      color: #303133;
      font-weight: 500;
    }
  }

  :deep(.el-table__row) {
    .el-checkbox {
      margin-right: 12px;
      margin-bottom: 4px;
    }
  }
}

.menu-cell {
  padding: 4px 0;
}

.buttons-cell {
  padding: 4px 0;

  .el-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>