<template>
  <Dialog v-model="dialogVisible" :title="isEditMode ? '编辑部门' : '新增部门'" width="520px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="deptFormRef" :model="deptForm" :rules="deptFormRules" label-width="100px" label-position="right" class="dept-form">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="deptForm.name" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="上级部门" prop="parentId">
        <el-select v-model="deptForm.parentId" placeholder="请选择" filterable style="width: 100%">
          <el-option v-for="dept in parentDeptOptions" :key="dept.value" :label="dept.label" :value="dept.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="部门排序" prop="sort">
        <el-input-number v-model="deptForm.sort" :min="0" :max="9999" :step="1" controls-position="right" style="width: 100%" />
      </el-form-item>

      <el-form-item label="部门状态" prop="statusEnabled">
        <el-switch v-model="deptForm.statusEnabled" active-text="启用" inactive-text="禁用" inline-prompt />
      </el-form-item>

      <el-form-item label="部门备注">
        <el-input v-model="deptForm.remarks" type="textarea" :rows="4" placeholder="请输入" resize="none" />
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
import { Dialog } from '@/components/Dialog'
import type { FormInstance, FormRules } from 'element-plus'
import type { Department } from '@/types/index'

interface ParentDeptOption {
  label: string
  value: number
}

const props = defineProps<{
  modelValue: boolean
  isEditMode: boolean
  department: Department | null
  parentDeptOptions: ParentDeptOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [department: Department, isEdit: boolean]
  'close': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const deptFormRef = ref<FormInstance>()
const submitLoading = ref(false)

const deptForm = reactive({
  name: '',
  parentId: 0,
  sort: 0,
  statusEnabled: true,
  remarks: ''
})

const deptFormRules: FormRules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  parentId: [{ required: true, message: '请选择上级部门', trigger: 'change' }],
  sort: [{ required: true, message: '请输入部门排序', trigger: 'blur' }]
}

const resetDeptForm = () => {
  deptForm.name = ''
  deptForm.parentId = 0
  deptForm.sort = 0
  deptForm.statusEnabled = true
  deptForm.remarks = ''
  deptFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!deptFormRef.value) return
  try {
    await deptFormRef.value.validate()
    submitLoading.value = true

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600))

    const department: Department = {
      id: props.department?.id || Date.now(),
      name: deptForm.name,
      parentId: deptForm.parentId,
      sort: deptForm.sort,
      createTime: props.department?.createTime || new Date().toLocaleString('sv-SE').replace('T', ' ').padEnd(19, '0'),
      status: deptForm.statusEnabled ? '启用' : '禁用',
      remarks: deptForm.remarks,
      children: props.department?.children || []
    }

    emit('submit', department, props.isEditMode)
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
  resetDeptForm()
  emit('close')
}

// Watch for department changes to update form
watch(() => props.department, (newDepartment) => {
  if (newDepartment) {
    deptForm.name = newDepartment.name
    deptForm.parentId = newDepartment.parentId
    deptForm.sort = newDepartment.sort
    deptForm.statusEnabled = newDepartment.status === '启用'
    deptForm.remarks = newDepartment.remarks || ''
  } else {
    resetDeptForm()
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.dept-form {
  padding: 8px 0;

  .el-input-number {
    :deep(.el-input__wrapper) {
      padding-right: 40px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>