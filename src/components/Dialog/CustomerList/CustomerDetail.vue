<template>
  <BaseDialog
    :model-value="modelValue"
    title="客户详情"
    width="520px"
    :close-on-click-modal="false"
    confirm-text="关闭"
    :show-cancel-button="false"
    :show-confirm-button="false"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @confirm="handleConfirm"
  >
    <div class="view-modal" v-if="customer">
      <DetailItem label="客户名称" :value="customer.name" />
      <DetailItem label="联系人" :value="customer.contact" />
      <DetailItem label="手机号" :value="customer.phone" />
      <DetailItem label="邮箱" :value="customer.email || '-'" />
      <DetailItem label="销售负责人" :value="customer.salesOwner || '-'" />
      <DetailItem label="账户状态" :value="customer.accountStatus" type="status" :status-map="statusMap" />
      <DetailItem label="创建日期" :value="customer.createDate" />
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { BaseDialog } from '@/components/BaseDialog'
import { DetailItem } from '@/components/DetailItem'
import type { Customer } from '@/types/index'

interface Props {
  modelValue: boolean
  customer: Customer | null
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const statusMap = {
  正常: 'success',
  冻结: 'warning',
  关闭: 'danger',
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
