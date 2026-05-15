<template>
  <BaseDialog
    :model-value="modelValue"
    title="许可模版详情"
    width="520px"
    :close-on-click-modal="false"
    confirm-text="关闭"
    :show-cancel-button="false"
    :show-confirm-button="false"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @confirm="handleConfirm"
  >
    <div class="view-modal" v-if="template">
      <DetailItem label="模版名称" :value="template.name" />
      <DetailItem label="产品名称" :value="template.productName" />
      <DetailItem label="版本号" :value="template.version" />
      <DetailItem label="状态" :value="template.status" type="status" :status-map="statusMap" />
      <DetailItem label="创建时间" :value="template.createTime" />
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { BaseDialog } from '@/components/BaseDialog'
import { DetailItem } from '@/components/DetailItem'

interface LicenseTemplate {
  id: number
  name: string
  productName: string
  version: string
  status: string
  createTime: string
}

interface Props {
  modelValue: boolean
  template?: LicenseTemplate | null
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const statusMap = {
  启用: 'success',
  禁用: 'warning',
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
