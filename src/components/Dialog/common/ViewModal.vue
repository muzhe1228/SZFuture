<template>
  <BaseDialog
    :model-value="modelValue"
    :title="title"
    width="600px"
    :close-on-click-modal="false"
    confirm-text="关闭"
    :show-cancel-button="false"
    :show-confirm-button="false"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @confirm="handleConfirm"
  >
    <div class="view-modal" v-if="data">
      <DetailItem 
        v-for="item in viewFields" 
        :key="item.key" 
        :label="item.label"
        :value="String(data[item.key as keyof typeof data] || '-')"
        :type="item.type"
        :status-map="statusMap"
      />
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DetailItem } from '@/components/DetailItem'
import { BaseDialog } from '@/components/BaseDialog'
import { statusMap as defaultStatusMap } from '@/config/statusMap'
import type { ColumnConfig } from '@/components/DataTable/types'

interface Props {
  modelValue: boolean
  data?: Record<string, any> | null
  title?: string
  columns?: ColumnConfig[]
  statusMap?: Record<string, string>
}

const props = withDefaults(defineProps<Props>(), {
  title: '详情信息',
  columns: () => [],
  statusMap: () => defaultStatusMap,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const viewFields = computed(() => {
  return props.columns
    .filter(col => {
      if (col.viewField === false) return false
      if (col.hasTemplate && !col.viewType && col.viewField !== true) return false
      return col.visible !== false
    })
    .map(col => ({
      label: col.label,
      key: col.prop || col.key,
      type: col.viewType || (col.hasTemplate ? 'status' : 'text'),
    }))
})

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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>