<template>
  <Dialog v-model="dialogVisible" title="授权延期" width="520px" :close-on-click-modal="false" @close="handleClose">
    <div class="extend-modal">
      <el-form ref="extendFormRef" :model="extendForm" :rules="extendFormRules" label-width="90px" label-position="right" class="modal-form">
        <el-form-item label="延期天数" prop="extendDays">
          <el-input-number
            v-model="extendForm.extendDays"
            :min="1"
            :max="3650"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="延期原因" prop="reason">
          <el-input
            v-model="extendForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入延期原因"
          />
        </el-form-item>
        <el-form-item label="审批人员" prop="approver">
          <el-select v-model="extendForm.approver" placeholder="请选择审批人员" style="width: 100%">
            <el-option label="张经理" value="张经理" />
            <el-option label="李主管" value="李主管" />
            <el-option label="王总监" value="王总监" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleExtendSubmit" :loading="extendLoading">确定</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Dialog } from '@/components/Dialog'
import type { FormInstance, FormRules } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  extendLoading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [form: { extendDays: number; reason: string; approver: string }]
  'close': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const extendFormRef = ref<FormInstance>()

const extendForm = reactive({
  extendDays: 30,
  reason: '',
  approver: ''
})

const extendFormRules: FormRules = {
  extendDays: [{ required: true, message: '请输入延期天数', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入延期原因', trigger: 'blur' }],
  approver: [{ required: true, message: '请选择审批人员', trigger: 'change' }]
}

const handleExtendSubmit = async () => {
  if (!extendFormRef.value) return
  try {
    await extendFormRef.value.validate()
    emit('submit', { ...extendForm })
    dialogVisible.value = false
  } catch {
    // Form validation failed
  }
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleClose = () => {
  extendForm.extendDays = 30
  extendForm.reason = ''
  extendForm.approver = ''
  extendFormRef.value?.clearValidate()
  emit('close')
}
</script>

<style lang="scss" scoped>
.extend-modal {
  padding: 20px 0;
}

.modal-form {
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