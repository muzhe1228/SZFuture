<template>
  <el-dialog v-model="dialogVisible" title="授权更新" width="520px" :close-on-click-modal="false">
    <div class="unfreeze-modal">
      <el-descriptions :column="1" border v-if="trial">
        <el-descriptions-item label="冻结时间">
          {{ trial.freezeTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="冻结原因">
          {{ trial.freezeReason || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <el-form label-width="90px" label-position="right" class="modal-form">
        <el-form-item label="更新原因">
          <el-input v-model="unfreezeForm.reason" type="textarea" :rows="4" placeholder="请输入更新原因" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUnfreezeSubmit" :loading="unfreezeLoading">
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

interface Trial {
  freezeTime?: string
  freezeReason?: string
}

interface Props {
  modelValue: boolean
  trial?: Trial | null
  trialId?: number | null
}

const props = defineProps<Props>()

// ─── Emits ──────────────────────────────────────────────────────

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'unfreeze', reason: string, id: number): void
}>()

// ─── Reactive Data ─────────────────────────────────────────────

const dialogVisible = ref(props.modelValue)
const trial = ref(props.trial)
const unfreezeForm = reactive({ reason: '' })
const unfreezeLoading = ref(false)

// ─── Watch ─────────────────────────────────────────────────────

import { watch } from 'vue'

watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
  if (newValue) {
    unfreezeForm.reason = ''
  }
})

watch(() => props.trial, (newValue) => {
  trial.value = newValue
})

// ─── Methods ───────────────────────────────────────────────────

const handleUnfreezeSubmit = async () => {
  if (!unfreezeForm.reason.trim()) {
    ElMessage.warning('请填写更新原因')
    return
  }
  unfreezeLoading.value = true
  try {
    const response = await fetch('/api/trial/unfreeze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: props.trialId, reason: unfreezeForm.reason })
    })
    const result = await response.json()
    if (result.code === 200) {
      ElMessage.success('试用授权更新成功')
      if (props.trialId) {
        emit('unfreeze', unfreezeForm.reason, props.trialId)
      }
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    emit('update:modelValue', false)
    unfreezeLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.unfreeze-modal {
  .el-descriptions {
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