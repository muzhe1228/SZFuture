<template>
  <BaseDialog v-model="dialogVisible" title="消息详情" width="960" :close-on-click-modal="false">
    <div class="detail-modal" v-if="message">
      <div class="detail-header">
        <div class="detail-header-item">
          <div class="item-label">标题</div>
          <div class="item-text">{{ `【${message.customerName}】-授权即将到期 ` }}</div>
        </div>
        <div class="detail-header-item">
          <div class="item-label">接收时间</div>
          <div class="item-text">{{ message.receiveTime }}</div>
        </div>
      </div>

      <div class="detail-body">
        <p class="detail-label">正文内容:</p>
        <div class="detail-content">
          【{{ message.customerName }}】订阅的【{{ message.serialNo }}】授权将于【{{
            message.expiryDate
          }}】到期，请联系客户续费。
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BaseDialog } from '@/components/BaseDialog'
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
  confirm: []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.detail-modal {
  .detail-header {
    padding-top: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    &-item {
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #E5E5E5;
      .item-label {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 120px;
        height: 40px;
        background-color: #416BCB1A;
        font-size: 14px;
      }
    }
  }

  .detail-body {
    .detail-label {
      font-size: 14px;
      margin-bottom: 12px;
    }

    .detail-content {
      min-height: 200px;
      padding: 16px;
      font-size: 14px;

      line-height: 1.8;
      background-color: #fff;
      border: 1px solid #ebeef5;
      border-radius: 12px;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
