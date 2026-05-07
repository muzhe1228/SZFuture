<template>
  <el-dialog v-model="dialogVisible" title="授权激活" width="520px" :close-on-click-modal="false">
    <div class="activate-modal">
      <el-form label-width="100px" label-position="right">
        <el-form-item label="授权编号">
          <el-input v-model="activateForm.authNo" placeholder="请输入密钥" clearable />
        </el-form-item>
        <el-form-item label="离线激活码">
          <el-input v-model="activateForm.deviceFingerprint" placeholder="请输入设备指纹" clearable />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="success" @click="handleGenerateActivationCode" :loading="activateLoading">
          生成激活码
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
  authNo?: string
}

const props = defineProps<Props>()

// ─── Emits ──────────────────────────────────────────────────────

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'activate', authNo: string, deviceFingerprint: string): void
}>()

// ─── Reactive Data ─────────────────────────────────────────────

const dialogVisible = ref(props.modelValue)
const activateForm = reactive({ authNo: props.authNo || '', deviceFingerprint: '' })
const activateLoading = ref(false)

// ─── Watch ─────────────────────────────────────────────────────

import { watch } from 'vue'

watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
  if (newValue) {
    activateForm.authNo = props.authNo || ''
    activateForm.deviceFingerprint = ''
  }
})

watch(() => props.authNo, (newValue) => {
  activateForm.authNo = newValue || ''
})

// ─── Methods ───────────────────────────────────────────────────

const handleGenerateActivationCode = async () => {
  if (!activateForm.authNo.trim()) {
    ElMessage.warning('请输入密钥')
    return
  }
  if (!activateForm.deviceFingerprint.trim()) {
    ElMessage.warning('请输入设备指纹')
    return
  }
  activateLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 800))
  ElMessage.success('激活码生成成功，授权已激活')
  emit('activate', activateForm.authNo, activateForm.deviceFingerprint)
  emit('update:modelValue', false)
  activateLoading.value = false
}
</script>

<style lang="scss" scoped>
.activate-modal {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>