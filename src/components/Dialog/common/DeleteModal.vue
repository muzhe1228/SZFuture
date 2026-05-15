<template>
  <BaseDialog :model-value="modelValue" title="温馨提示" width="420px" :close-on-click-modal="false" confirm-text="确定"
    cancel-text="取消" :confirm-button-type="'danger'" :loading="loading"
    @update:model-value="(val) => emit('update:modelValue', val)" @confirm="handleConfirm">
    <div class="delete-modal">
      <div class="delete-icon">
        <img :src="IconWarn" />
      </div>
      <div class="delete-message">
        <p v-if="mode === 'single'">删除【<span>{{ titleText }}</span>】后将无法恢复，请确认是否继续？</p>
        <p v-else-if="mode === 'batch'">确定要删除选中的 <span>{{ titleText }}</span> 条内容吗？</p>
        <p v-else>删除所选项后将无法恢复，请确认是否继续？</p>
       <!-- 删除所选项后将无法恢复，请确认是否继续？ -->
        <!-- 是否删除所选项？ -->
        <!-- <p class="message-title">{{ titleText }}</p>
        <p class="message-content">{{ messageText }}</p> -->
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconWarn from '@/assets/icons/iconWarn.png'
import { BaseDialog } from '@/components/BaseDialog'
import { ElMessage } from 'element-plus'

interface Props {
  modelValue: boolean
  mode?: 'single' | 'batch'
  titleText?: string | number
  deleteApi?: (...args: any[]) => Promise<any>
  id?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'single',
  titleText: '确认删除',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'success'): void
  (e: 'error', error: any): void
}>()

const loading = ref(false)

const handleConfirm = async () => {
  emit('confirm')
  
  if (!props.deleteApi) {
    emit('update:modelValue', false)
    emit('success')
    return
  }

  loading.value = true
  try {
    await props.deleteApi(props.id)
    ElMessage.success('删除成功')
    emit('update:modelValue', false)
    emit('success')
  } catch (error: any) {
    ElMessage.error(error.message || '删除失败')
    emit('error', error)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.delete-modal {
  display: flex;
  padding: 0;

  .delete-icon {
    width: 16px;
    margin-right: 8px;

    img {
      width: 100%;
      vertical-align: middle;
    }
  }

  .delete-message {
    span{
      color: var(--el-color-error);
    }
  }
}
</style>