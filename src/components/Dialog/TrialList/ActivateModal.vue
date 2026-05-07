<template>
  <el-dialog v-model="dialogVisible" title="试用激活" width="520px" :close-on-click-modal="false">
    <div class="activate-modal">
      <el-form label-width="100px" label-position="right">
        <el-form-item label="License Key">
          <el-input v-model="activateForm.licenseKey" placeholder="请输入 License Key" clearable />
        </el-form-item>
        <el-form-item label="设备指纹">
          <el-input v-model="activateForm.deviceFingerprint" placeholder="请输入设备指纹" clearable />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="success" @click="handleActivateSubmit" :loading="activateLoading">
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
  trialId?: number | null
  licenseKey?: string
}

const props = defineProps<Props>()

// ─── Emits ──────────────────────────────────────────────────────

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'activate', licenseKey: string, deviceFingerprint: string, id: number): void
}>()

// ─── Reactive Data ─────────────────────────────────────────────

const dialogVisible = ref(props.modelValue)
const activateForm = reactive({
  licenseKey: props.licenseKey || '',
  deviceFingerprint: ''
})
const activateLoading = ref(false)

// ─── Watch ─────────────────────────────────────────────────────

import { watch } from 'vue'

watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
  if (newValue) {
    activateForm.licenseKey = props.licenseKey || ''
    activateForm.deviceFingerprint = ''
  }
})

watch(() => props.licenseKey, (newValue) => {
  activateForm.licenseKey = newValue || ''
})

// ─── Methods ───────────────────────────────────────────────────

const handleActivateSubmit = async () => {
  if (!activateForm.licenseKey.trim()) {
    ElMessage.warning('请输入 License Key')
    return
  }
  if (!activateForm.deviceFingerprint.trim()) {
    ElMessage.warning('请输入设备指纹')
    return
  }
  activateLoading.value = true
  try {
    const response = await fetch('/api/trial/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: props.trialId,
        ...activateForm
      })
    })
    const result = await response.json()
    if (result.code === 200) {
      ElMessage.success('激活码生成成功，试用已激活')
      if (props.trialId) {
        emit('activate', activateForm.licenseKey, activateForm.deviceFingerprint, props.trialId)
      }
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    emit('update:modelValue', false)
    activateLoading.value = false
  }
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