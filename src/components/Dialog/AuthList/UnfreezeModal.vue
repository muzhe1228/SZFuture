<template>
  <el-dialog v-model="dialogVisible" title="授权解冻" width="520px" :close-on-click-modal="false">
    <div class="unfreeze-modal">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="冻结时间">
          {{ auth?.freezeTime || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="冻结原因">
          {{ auth?.freezeReason || '-' }}
        </el-descriptions-item>
      </el-descriptions>
      <el-form label-width="90px" label-position="right" class="modal-form">
        <el-form-item label="解冻原因">
          <el-input v-model="unfreezeForm.reason" type="textarea" :rows="4" placeholder="请输入解冻原因" />
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

interface Auth {
  freezeTime?: string
  freezeReason?: string
}

interface Props {
  modelValue: boolean
  auth: Auth | null
}

const props = defineProps<Props>()

// ─── Emits ──────────────────────────────────────────────────────

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'unfreeze', reason: string): void
}>()

// ─── Reactive Data ─────────────────────────────────────────────

const dialogVisible = ref(props.modelValue)
const auth = ref(props.auth)
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

watch(() => props.auth, (newValue) => {
  auth.value = newValue
})

// ─── Methods ───────────────────────────────────────────────────

const handleUnfreezeSubmit = async () => {
  if (!unfreezeForm.reason.trim()) {
    ElMessage.warning('请填写解冻原因')
    return
  }
  unfreezeLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 600))
  ElMessage.success('授权解冻成功')
  emit('unfreeze', unfreezeForm.reason)
  emit('update:modelValue', false)
  unfreezeLoading.value = false
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