<template>
  <BaseDialog
    v-model="dialogVisible"
    :title="isEditMode ? '修改试用申请' : '新增试用申请'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
      class="trial-form"
    >
      <el-form-item label="*申请客户" prop="customerName">
        <el-input v-model="form.customerName" placeholder="请输入申请客户" />
      </el-form-item>
      <el-form-item label="*联系人" prop="contactName">
        <el-input v-model="form.contactName" placeholder="请输入联系人" />
      </el-form-item>
      <el-form-item label="*联系电话" prop="contactPhone">
        <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="*产品名称" prop="productName">
        <el-select v-model="form.productName" placeholder="请选择产品名称" style="width: 100%">
          <el-option label="产品A" value="产品A" />
          <el-option label="产品B" value="产品B" />
          <el-option label="产品C" value="产品C" />
        </el-select>
      </el-form-item>
      <el-form-item label="*试用时长" prop="trialDuration">
        <el-input-number
          v-model="form.trialDuration"
          :min="1"
          :max="30"
          :controls="false"
          align="left"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="*试用状态" prop="status">
        <el-select v-model="form.status" placeholder="请选择试用状态" style="width: 100%">
          <el-option label="待审批" value="待审批" />
          <el-option label="已通过" value="已通过" />
          <el-option label="已拒绝" value="已拒绝" />
          <el-option label="已过期" value="已过期" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remarks" type="textarea" :rows="3" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'
  import { BaseDialog } from '@/components/BaseDialog'
  import type { FormRules } from 'element-plus'
  import type { Trial } from '@/types/index'
  import { useForm } from '@/composables/useForm'

  interface TrialForm {
    customerName: string
    contactName: string
    contactPhone: string
    productName: string
    trialDuration: number
    status: '已激活' | '未激活' | '已冻结' | '已过期'
    remarks: string
  }

  const props = defineProps<{
    modelValue: boolean
    isEditMode: boolean
    trial: Trial | null
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: [trial: Trial, isEdit: boolean]
    close: []
  }>()

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })

  const submitLoading = ref(false)

  const defaultValues: TrialForm = {
    customerName: '',
    contactName: '',
    contactPhone: '',
    productName: '',
    trialDuration: 7,
    status: '未激活',
    remarks: '',
  }

  const rules: FormRules = {
    customerName: [{ required: true, message: '请输入申请客户', trigger: 'blur' }],
    contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
    contactPhone: [
      { required: true, message: '请输入联系电话', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
    ],
    productName: [{ required: true, message: '请选择产品名称', trigger: 'change' }],
    trialDuration: [{ required: true, message: '请输入试用时长', trigger: 'blur' }],
    status: [{ required: true, message: '请选择试用状态', trigger: 'change' }],
  }

  const { form, formRef, resetForm, validateForm, setFormValue } = useForm<TrialForm>(defaultValues, rules)

  const handleSubmit = async () => {
    try {
      const isValid = await validateForm()
      if (!isValid) return

      submitLoading.value = true

      const trial: Trial = {
        id: props.trial?.id || Date.now(),
        customerName: form.customerName,
        phone: form.contactPhone,
        bindDate: new Date().toISOString().split('T')[0],
        authStartDate: new Date().toISOString().split('T')[0],
        authEndDate: new Date(Date.now() + form.trialDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        productName: form.productName,
        trialDuration: form.trialDuration,
        status: form.status,
        createTime: props.trial?.createTime || new Date().toISOString().replace('T', ' ').substring(0, 19),
        remarks: form.remarks,
      }

      emit('submit', trial, props.isEditMode)
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
    () => props.trial,
    (newTrial) => {
      if (newTrial) {
        setFormValue({
          customerName: newTrial.customerName || '',
          contactName: newTrial.contactName || '',
          contactPhone: newTrial.contactPhone || '',
          productName: newTrial.productName || '',
          trialDuration: newTrial.trialDuration || 7,
          status: newTrial.status || '未激活',
          remarks: newTrial.remarks || '',
        })
      } else {
        resetForm()
      }
    },
    { immediate: true }
  )
</script>

<style lang="scss" scoped>
  .trial-form {
    .el-form-item {
      margin-bottom: 16px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>