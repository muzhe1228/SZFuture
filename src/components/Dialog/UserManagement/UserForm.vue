<template>
  <Dialog v-model="dialogVisible" :title="isEditMode ? '编辑用户' : '新增用户'" width="680px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="100px" label-position="right" class="user-form">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="userForm.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="userForm.username" placeholder="请输入用户名" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="用户头像">
        <el-upload class="avatar-uploader" action="#" :show-file-list="false" :auto-upload="false" :on-change="handleAvatarChange">
          <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar-preview" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="归属部门" prop="department">
            <el-select v-model="userForm.department" placeholder="请选择归属部门" filterable style="width: 100%">
              <el-option v-for="dept in departmentOptions" :key="dept.value" :label="dept.label" :value="dept.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号码" prop="phone">
            <el-input v-model="userForm.phone" placeholder="请输入手机号码" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="工作邮箱">
            <el-input v-model="userForm.email" placeholder="请输入工作邮箱" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户性别">
            <el-radio-group v-model="userForm.gender">
              <el-radio value="男">男</el-radio>
              <el-radio value="女">女</el-radio>
              <el-radio value="保密">保密</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="用户岗位">
            <el-input v-model="userForm.position" placeholder="请输入用户岗位" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户权限" prop="permission">
            <el-select v-model="userForm.permission" placeholder="请选择用户权限" multiple collapse-tags collapse-tags-tooltip style="width: 100%">
              <el-option v-for="perm in permissionOptions" :key="perm.value" :label="perm.label" :value="perm.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="用户状态" prop="status">
        <el-switch v-model="userForm.statusEnabled" active-text="启用" inactive-text="禁用" inline-prompt />
      </el-form-item>

      <el-form-item label="用户备注">
        <el-input v-model="userForm.remarks" type="textarea" :rows="3" placeholder="请输入用户备注" />
      </el-form-item>
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
import { Plus } from '@element-plus/icons-vue'
import { Dialog } from '@/components/Dialog'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import type { User } from '@/types/index'

interface Option {
  label: string
  value: string
}

const props = defineProps<{
  modelValue: boolean
  isEditMode: boolean
  user: User | null
  departmentOptions: Option[]
  permissionOptions: Option[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [user: User, isEdit: boolean]
  'close': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const userFormRef = ref<FormInstance>()
const submitLoading = ref(false)

const userForm = reactive({
  name: '',
  username: '',
  avatar: '',
  department: '',
  phone: '',
  email: '',
  gender: '保密',
  position: '',
  permission: [] as string[],
  statusEnabled: true,
  remarks: ''
})

const userFormRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  department: [{ required: true, message: '请选择归属部门', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  permission: [{ required: true, message: '请选择用户权限', trigger: 'change' }]
}

const resetUserForm = () => {
  userForm.name = ''
  userForm.username = ''
  userForm.avatar = ''
  userForm.department = ''
  userForm.phone = ''
  userForm.email = ''
  userForm.gender = '保密'
  userForm.position = ''
  userForm.permission = []
  userForm.statusEnabled = true
  userForm.remarks = ''
  userFormRef.value?.clearValidate()
}

const handleAvatarChange = (file: UploadFile) => {
  if (file.raw) {
    const reader = new FileReader()
    reader.onload = (e) => {
      userForm.avatar = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }
}

const handleSubmit = async () => {
  if (!userFormRef.value) return
  try {
    await userFormRef.value.validate()
    submitLoading.value = true

    const user: User = {
      id: props.user?.id || Date.now(),
      name: userForm.name,
      username: userForm.username,
      phone: userForm.phone,
      email: userForm.email,
      department: userForm.department,
      gender: userForm.gender,
      position: userForm.position,
      permission: userForm.permission.join(','),
      status: userForm.statusEnabled ? '启用' : '禁用',
      remarks: userForm.remarks,
      avatar: userForm.avatar,
      createTime: props.user?.createTime || new Date().toLocaleString('sv-SE').replace('T', ' ').padEnd(19, '0')
    }

    emit('submit', user, props.isEditMode)
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
  resetUserForm()
  emit('close')
}

// Watch for user changes to update form
watch(() => props.user, (newUser) => {
  if (newUser) {
    userForm.name = newUser.name
    userForm.username = newUser.username
    userForm.phone = newUser.phone
    userForm.email = newUser.email
    userForm.department = newUser.department || ''
    userForm.gender = newUser.gender || '保密'
    userForm.position = newUser.position || ''
    userForm.permission = newUser.permission ? newUser.permission.split(',') : []
    userForm.statusEnabled = newUser.status === '启用'
    userForm.remarks = newUser.remarks || ''
    userForm.avatar = newUser.avatar || ''
  } else {
    resetUserForm()
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.user-form {
  padding: 8px 0;

  .avatar-uploader {
    :deep(.el-upload) {
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);

      &:hover {
        border-color: #409eff;
      }
    }
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
  }

  .avatar-preview {
    width: 100px;
    height: 100px;
    display: block;
    object-fit: cover;
    border-radius: 6px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>