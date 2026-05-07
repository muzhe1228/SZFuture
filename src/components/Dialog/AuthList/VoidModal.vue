<template>
  <el-dialog v-model="dialogVisible" title="授权作废" width="520px" :close-on-click-modal="false">
    <div class="void-modal">
      <el-alert title="作废后该授权无法使用，无法恢复该操作" type="error" :closable="false" show-icon />
      <el-form label-width="90px" label-position="right" class="modal-form">
        <el-form-item label="作废原因">
          <el-input v-model="voidForm.reason" type="textarea" :rows="3" placeholder="请输入作废原因" />
        </el-form-item>
        <el-form-item label="审批人员">
          <el-select v-model="voidForm.approver" placeholder="请选择审批人员" style="width: 100%">
            <el-option label="张经理" value="张经理" />
            <el-option label="李主管" value="李主管" />
            <el-option label="王总监" value="王总监" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleVoidSubmit" :loading="voidLoading">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// ─── Props ──────────────────────────────────────────────────────

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

// ─── Emits ──────────────────────────────────────────────────────

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'void', reason: string, approver: string): void
}>()

// ─── Reactive Data ─────────────────────────────────────────────

const dialogVisible = ref(props.modelValue)
const voidForm = reactive({ reason: '', approver: '' })
const voidLoading = ref(false)

// ─── Watch ─────────────────────────────────────────────────────

import { watch } from 'vue'

watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
  if (newValue) {
    voidForm.reason = ''
    voidForm.approver = ''
  }
})

// ─── Methods ───────────────────────────────────────────────────

const handleVoidSubmit = async () => {
  if (!voidForm.reason.trim()) {
    ElMessage.warning('请填写作废原因')
    return
  }
  if (!voidForm.approver) {
    ElMessage.warning('请选择审批人员')
    return
  }
  voidLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 600))
  ElMessage.success('授权作废成功')
  emit('void', voidForm.reason, voidForm.approver)
  emit('update:modelValue', false)
  voidLoading.value = false
}
</script>

<style lang="scss" scoped>
.void-modal {
  .el-alert {
    margin-bottom: 20px;
  }
}

.modal-form {
  margin-top: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>