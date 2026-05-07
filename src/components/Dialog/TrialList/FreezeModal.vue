<template>
  <el-dialog v-model="dialogVisible" title="授权冻结" width="520px" :close-on-click-modal="false">
    <div class="freeze-modal">
      <el-alert title="冻结后该试用授权暂时无法使用，可解冻恢复" type="warning" :closable="false" show-icon />
      <el-form label-width="90px" label-position="right" class="modal-form">
        <el-form-item label="冻结原因">
          <el-input v-model="freezeForm.reason" type="textarea" :rows="4" placeholder="请输入冻结原因" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleFreezeSubmit" :loading="freezeLoading">
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
  trialId?: number | null
  selectedCount?: number
}

const props = defineProps<Props>()

// ─── Emits ──────────────────────────────────────────────────────

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'freeze', reason: string, ids: number[]): void
}>()

// ─── Reactive Data ─────────────────────────────────────────────

const dialogVisible = ref(props.modelValue)
const freezeForm = reactive({ reason: '' })
const freezeLoading = ref(false)

// ─── Watch ─────────────────────────────────────────────────────

import { watch } from 'vue'

watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
  if (newValue) {
    freezeForm.reason = ''
  }
})

// ─── Methods ───────────────────────────────────────────────────

const handleFreezeSubmit = async () => {
  if (!freezeForm.reason.trim()) {
    ElMessage.warning('请填写冻结原因')
    return
  }
  freezeLoading.value = true
  try {
    const response = await fetch('/api/trial/freeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ids: props.trialId ? [props.trialId] : [],
        reason: freezeForm.reason
      })
    })
    const result = await response.json()
    if (result.code === 200) {
      ElMessage.success('试用授权冻结成功')
      emit('freeze', freezeForm.reason, props.trialId ? [props.trialId] : [])
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    emit('update:modelValue', false)
    freezeLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.freeze-modal {
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