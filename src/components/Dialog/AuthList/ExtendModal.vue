<template>
  <BaseDialog
    :model-value="modelValue"
    title="授权延期"
    width="520px"
    :close-on-click-modal="false"
    :show-cancel-button="false"
    confirm-text="确定"
    :confirm-loading="extendLoading"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @confirm="handleExtendSubmit"
    @cancel="handleCancel"
  >
    <div class="extend-modal">
      <el-form label-width="120px" label-position="right">
        <el-form-item label="授权延长至">
          <el-date-picker
            v-model="extendForm.extendTo"
            type="datetime"
            placeholder="选择日期时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { BaseDialog } from '@/components/BaseDialog'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'extend', extendTo: string): void
}>()

const extendForm = reactive({ extendTo: '' })
const extendLoading = ref(false)

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      extendForm.extendTo = ''
    }
  }
)

const handleExtendSubmit = async () => {
  if (!extendForm.extendTo) {
    ElMessage.warning('请选择延长至的日期时间')
    return
  }
  extendLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 600))
  ElMessage.success('授权延期成功')
  emit('extend', extendForm.extendTo)
}

const handleCancel = () => {
  extendForm.extendTo = ''
}
</script>

<style lang="scss" scoped>
.extend-modal {
  padding: 20px 0;
}
</style>
