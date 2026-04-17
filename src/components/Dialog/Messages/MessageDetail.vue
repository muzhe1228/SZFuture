<template>
  <Dialog v-model="dialogVisible" title="消息详情" width="780px" :close-on-click-modal="false">
    <div class="detail-modal" v-if="message">
      <el-table :data="[message]" border class="detail-info-table">
        <el-table-column label="标题" width="200" align="center">
          <template #default>
            【{{ message.customerName }}】-授权即将到期
          </template>
        </el-table-column>
        <el-table-column label="接收时间" min-width="200">
          <template #default>
            {{ message.receiveTime }}
          </template>
        </el-table-column>
      </el-table>

      <div class="detail-body">
        <p class="detail-label">正文内容:</p>
        <div class="detail-content">
          【{{ message.customerName }}】订阅的【{{ message.serialNo }}】授权将于【{{ message.expiryDate
          }}】到期，请联系客户续费。
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Dialog } from '@/components/Dialog'
import type { Message } from '@/types/index'

interface ExtendedMessage extends Message {
  receiveTime: string
  serialNo: string
  expiryDate: string
}

const props = defineProps<{
  modelValue: boolean
  message: ExtendedMessage | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.detail-modal {
  .detail-info-table {
    margin-bottom: 20px;

    :deep(.el-table__header th) {
      background-color: #fafafa;
      font-weight: 500;
    }
  }

  .detail-body {
    .detail-label {
      font-size: 14px;
      color: #303133;
      font-weight: 500;
      margin-bottom: 12px;
    }

    .detail-content {
      min-height: 200px;
      padding: 16px;
      font-size: 14px;
      color: #303133;
      line-height: 1.8;
      background-color: #fff;
      border: 1px solid #ebeef5;
      border-radius: 4px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>