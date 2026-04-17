<template>
  <Dialog v-model="dialogVisible" title="授权冻结" width="520px" :close-on-click-modal="false" @close="handleClose">
    <div class="freeze-modal">
      <el-alert
        title="冻结后该授权将无法使用，冻结期间不计入授权有效期内"
        type="warning"
        :closable="false"
        show-icon
      />
      <el-form label-width="90px" label-position="right" class="modal-form">
        <el-form-item label="冻结原因">
          <el-input
            v-model="freezeForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入冻结原因"
          />
        </el-form-item>
        <el-form-item label="审批人员">
          <el-select v-model="freezeForm.approver" placeholder="请选择审批人员" style="width: 100%">
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
        <el-button type="primary" @click="handleFreezeSubmit" :loading="freezeLoading">确定</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { Dialog } from '@/components/Dialog'

const props = defineProps<{
  modelValue: boolean
  freezeLoading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [form: { reason: string; approver: string }]
  'close': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const freezeForm = reactive({
  reason: '',
  approver: ''
})

const handleFreezeSubmit = () => {
  emit('submit', { ...freezeForm })
  dialogVisible.value = false
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleClose = () => {
  freezeForm.reason = ''
  freezeForm.approver = ''
  emit('close')
}
</script>

<style lang="scss" scoped>
.freeze-modal {
  padding: 20px 0;
}

.modal-form {
  margin-top: 20px;

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