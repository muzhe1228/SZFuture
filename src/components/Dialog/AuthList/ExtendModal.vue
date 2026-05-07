<template>
  <el-dialog v-model="dialogVisible" title="授权延期" width="520px" :close-on-click-modal="false">
    <div class="extend-modal">
      <el-form label-width="120px" label-position="right">
        <el-form-item label="授权延长至:">
          <el-date-picker v-model="extendForm.extendTo" type="datetime" placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleExtendSubmit" :loading="extendLoading">
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
  (e: 'extend', extendTo: string): void
}>()

// ─── Reactive Data ─────────────────────────────────────────────

const dialogVisible = ref(props.modelValue)
const extendForm = reactive({ extendTo: '' })
const extendLoading = ref(false)

// ─── Watch ─────────────────────────────────────────────────────

import { watch } from 'vue'

watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
  if (newValue) {
    extendForm.extendTo = ''
  }
})

// ─── Methods ───────────────────────────────────────────────────

const handleExtendSubmit = async () => {
  if (!extendForm.extendTo) {
    ElMessage.warning('请选择延长至的日期时间')
    return
  }
  extendLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 600))
  ElMessage.success('授权延期成功')
  emit('extend', extendForm.extendTo)
  emit('update:modelValue', false)
  extendLoading.value = false
}
</script>

<style lang="scss" scoped>
.extend-modal {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>