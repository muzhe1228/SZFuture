<template>
  <Dialog v-model="dialogVisible" :title="isEditMode ? '修改试用申请' : '新增试用申请'" width="600px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="trialFormRef" :model="trialForm" :rules="trialFormRules" label-width="100px" label-position="right" class="trial-form">
      <el-form-item label="*申请客户" prop="customerName">
        <el-input v-model="trialForm.customerName" placeholder="请输入申请客户" />
      </el-form-item>
      <el-form-item label="*联系人" prop="contactName">
        <el-input v-model="trialForm.contactName" placeholder="请输入联系人" />
      </el-form-item>
      <el-form-item label="*联系电话" prop="contactPhone">
        <el-input v-model="trialForm.contactPhone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="*产品名称" prop="productName">
        <el-select v-model="trialForm.productName" placeholder="请选择产品名称" style="width: 100%">
          <el-option label="产品A" value="产品A" />
          <el-option label="产品B" value="产品B" />
          <el-option label="产品C" value="产品C" />
        </el-select>
      </el-form-item>
      <el-form-item label="*试用时长" prop="trialDuration">
        <el-input-number
          v-model="trialForm.trialDuration"
          :min="1"
          :max="30"
          controls-position="right"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="*试用状态" prop="status">
        <el-select v-model="trialForm.status" placeholder="请选择试用状态" style="width: 100%">
          <el-option label="待审批" value="待审批" />
          <el-option label="已通过" value="已通过" />
          <el-option label="已拒绝" value="已拒绝" />
          <el-option label="已过期" value="已过期" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="trialForm.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入备注"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Dialog } from '@/components/Dialog'
import type { FormInstance, FormRules } from 'element-plus'
import type { Trial } from '@/types/index'

const props = defineProps<{
  modelValue: boolean
  isEditMode: boolean
  trial: Trial | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [trial: Trial, isEdit: boolean]
  'close': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const trialFormRef = ref<FormInstance>()
const submitLoading = ref(false)

const trialForm = reactive({
  customerName: '',
  contactName: '',
  contactPhone: '',
  productName: '',
  trialDuration: 7,
  status: '未激活' as '已激活' | '未激活' | '已冻结' | '已过期',
  remarks: ''
})

const trialFormRules: FormRules = {
  customerName: [{ required: true, message: '请输入申请客户', trigger: 'blur' }],
  contactName: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  productName: [{ required: true, message: '请选择产品名称', trigger: 'change' }],
  trialDuration: [{ required: true, message: '请输入试用时长', trigger: 'blur' }],
  status: [{ required: true, message: '请选择试用状态', trigger: 'change' }]
}

const resetTrialForm = () => {
  trialForm.customerName = ''
  trialForm.contactName = ''
  trialForm.contactPhone = ''
  trialForm.productName = ''
  trialForm.trialDuration = 7
  trialForm.status = '未激活'
  trialForm.remarks = ''
  trialFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!trialFormRef.value) return
  try {
    await trialFormRef.value.validate()
    submitLoading.value = true

    const trial: Trial = {
      id: props.trial?.id || Date.now(),
      customerName: trialForm.customerName,
      phone: trialForm.contactPhone,
      bindDate: new Date().toISOString().split('T')[0],
      authStartDate: new Date().toISOString().split('T')[0],
      authEndDate: new Date(Date.now() + trialForm.trialDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contactName: trialForm.contactName,
      contactPhone: trialForm.contactPhone,
      productName: trialForm.productName,
      trialDuration: trialForm.trialDuration,
      status: trialForm.status,
      createTime: props.trial?.createTime || new Date().toISOString().replace('T', ' ').substring(0, 19),
      remarks: trialForm.remarks
    }

    emit('submit', trial, props.isEditMode)
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
  resetTrialForm()
  emit('close')
}

// Watch for trial changes to update form
watch(() => props.trial, (newTrial) => {
  if (newTrial) {
    trialForm.customerName = newTrial.customerName || ''
    trialForm.contactName = newTrial.contactName || ''
    trialForm.contactPhone = newTrial.contactPhone || ''
    trialForm.productName = newTrial.productName || ''
    trialForm.trialDuration = newTrial.trialDuration || 7
    trialForm.status = newTrial.status || '未激活'
    trialForm.remarks = newTrial.remarks || ''
  } else {
    resetTrialForm()
  }
}, { immediate: true })
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