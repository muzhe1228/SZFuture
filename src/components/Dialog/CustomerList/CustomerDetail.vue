<template>
  <Dialog v-model="dialogVisible" title="客户详情" width="560px" :close-on-click-modal="false">
    <div class="view-modal" v-if="customer">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="客户名称" :span="2">{{ customer.name }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ customer.contact }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ customer.phone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱" :span="2">{{ customer.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="销售负责人" :span="2">{{ customer.salesOwner || '-' }}</el-descriptions-item>
        <el-descriptions-item label="账户状态">
          <el-tag :type="getStatusType(customer.accountStatus)" size="small">{{ customer.accountStatus }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建日期">{{ customer.createDate }}</el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Dialog } from '@/components/Dialog'
import type { Customer } from '@/types/index'

const props = defineProps<{
  modelValue: boolean
  customer: Customer | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    '正常': 'success',
    '冻结': 'warning',
    '关闭': 'danger'
  }
  return (map[status] || 'info') as any
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.view-modal {
  .el-descriptions {
    --el-descriptions-item-bordered-label-background: #fafafa;
  }
}
</style>