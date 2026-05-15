<template>
  <BaseDialog
    :model-value="modelValue"
    title="模块详情"
    width="520px"
    :close-on-click-modal="false"
    confirm-text="关闭"
    :show-cancel-button="false"
    :show-confirm-button="false"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @confirm="handleConfirm"
  >
    <div class="view-modal" v-if="module">
      <DetailItem label="名称" :value="module.name" />
      <DetailItem label="类型" :value="module.type" type="status" :status-map="typeMap" />
      <DetailItem label="状态" :value="module.status" />
      <DetailItem label="说明" :value="module.description || '--'" />
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { BaseDialog } from '@/components/BaseDialog'
import { DetailItem } from '@/components/DetailItem'
import type { ProductModule } from '@/types/index'

interface Props {
  modelValue: boolean
  module: ProductModule | null
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const typeMap = {
  产品: 'primary',
  版本: 'warning',
  功能: 'success',
}

const handleConfirm = () => {
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.view-modal {
  .el-descriptions {
    --el-descriptions-item-bordered-label-background: #fafafa;
  }
}
</style>
