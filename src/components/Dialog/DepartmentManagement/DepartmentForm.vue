<template>
  <BaseDialog
    v-model="dialogVisible"
    :title="isEditMode ? '编辑部门' : (viewMode ? '查看部门' : '新增部门')"
    width="520px"
    :close-on-click-modal="false"
    :show-cancel-button="!viewMode"
    :show-confirm-button="!viewMode"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
      class="dept-form"
      :disabled="viewMode"
    >
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入" :disabled="viewMode" />
      </el-form-item>

      <el-form-item label="上级部门" prop="parentId">
        <el-select v-model="form.parentId" placeholder="请选择" filterable style="width: 100%" :disabled="viewMode">
          <el-option v-for="dept in parentDeptOptions" :key="dept.value" :label="dept.label" :value="dept.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="部门排序" prop="sort">
        <el-input-number
          v-model="form.sort"
          :min="0"
          :max="9999"
          :step="1"
          :controls="false"
          align="left"
          style="width: 100%"
          :disabled="viewMode"
        />
      </el-form-item>

      <el-form-item label="部门状态" prop="statusEnabled">
        <el-switch v-model="form.statusEnabled" active-text="启用" inactive-text="禁用" inline-prompt :disabled="viewMode" />
      </el-form-item>

      <el-form-item label="部门备注">
        <el-input v-model="form.remarks" type="textarea" :rows="4" placeholder="请输入" resize="none" :disabled="viewMode" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading"> 确定 </el-button>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { BaseDialog } from '@/components/BaseDialog'
  import type { FormRules } from 'element-plus'
  import type { Department } from '@/types/index'
  import { useForm } from '@/composables/useForm'

  interface ParentDeptOption {
    label: string
    value: number
  }

  interface DeptForm {
    name: string
    parentId: number
    sort: number
    statusEnabled: boolean
    remarks: string
  }

  const props = defineProps<{
    modelValue: boolean
    isEditMode: boolean
    viewMode: boolean
    department: Department | null
    parentDeptOptions: ParentDeptOption[]
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: [department: Department, isEdit: boolean]
    close: []
  }>()

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })

  const submitLoading = ref(false)

  const defaultValues: DeptForm = {
    name: '',
    parentId: 0,
    sort: 0,
    statusEnabled: true,
    remarks: '',
  }

  const rules: FormRules = {
    name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
    parentId: [{ required: true, message: '请选择上级部门', trigger: 'change' }],
    sort: [{ required: true, message: '请输入部门排序', trigger: 'blur' }],
  }

  const { form, formRef, resetForm, validateForm, setFormValue } = useForm<DeptForm>(defaultValues, rules)

  const handleSubmit = async () => {
    try {
      const isValid = await validateForm()
      if (!isValid) return

      submitLoading.value = true

      await new Promise((resolve) => setTimeout(resolve, 600))

      const department: Department = {
        id: props.department?.id || Date.now(),
        name: form.name,
        parentId: form.parentId,
        sort: form.sort,
        createTime:
          props.department?.createTime || new Date().toLocaleString('sv-SE').replace('T', ' ').padEnd(19, '0'),
        status: form.statusEnabled ? '启用' : '禁用',
        remarks: form.remarks,
        children: props.department?.children || [],
      }

      emit('submit', department, props.isEditMode)
      dialogVisible.value = false
    } finally {
      submitLoading.value = false
    }
  }

  const handleCancel = () => {
    dialogVisible.value = false
  }

  const handleClose = () => {
    resetForm()
    emit('close')
  }

  watch(
    () => props.department,
    (newDepartment) => {
      if (newDepartment) {
        setFormValue({
          name: newDepartment.name,
          parentId: newDepartment.parentId,
          sort: newDepartment.sort,
          statusEnabled: newDepartment.status === '启用',
          remarks: newDepartment.remarks || '',
        })
      } else {
        resetForm()
      }
    },
    { immediate: true }
  )
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