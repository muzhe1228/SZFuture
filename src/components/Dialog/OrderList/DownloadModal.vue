<template>
  <BaseDialog
    :model-value="modelValue"
    title="下载订单"
    width="480px"
    :close-on-click-modal="false"
    confirm-text="下载"
    :confirm-disabled="!selectedFormat"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @confirm="handleDownload"
    @cancel="handleCancel"
  >
    <div class="download-modal">
      <div class="form-item">
        <label class="form-label">订单编号</label>
        <div class="form-value">{{ order?.orderNo || '-' }}</div>
      </div>
      
      <div class="form-item">
        <label class="form-label">客户名称</label>
        <div class="form-value">{{ order?.customerName || '-' }}</div>
      </div>
      
      <div class="form-item">
        <label class="form-label">导出格式</label>
        <el-radio-group v-model="selectedFormat">
          <el-radio value="xlsx">Excel (.xlsx)</el-radio>
          <el-radio value="pdf">PDF (.pdf)</el-radio>
          <el-radio value="csv">CSV (.csv)</el-radio>
        </el-radio-group>
      </div>
      
      <div class="form-item">
        <label class="form-label">包含内容</label>
        <el-checkbox-group v-model="selectedContent">
          <el-checkbox value="basic">基本信息</el-checkbox>
          <el-checkbox value="auth">授权明细</el-checkbox>
          <el-checkbox value="history">操作记录</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BaseDialog } from '@/components/BaseDialog'
import type { Order } from '@/types/index'

interface Props {
  modelValue: boolean
  order?: Order | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'download', orderNo: string): void
}>()

const selectedFormat = ref('xlsx')
const selectedContent = ref(['basic', 'auth'])

const handleDownload = () => {
  if (props.order) {
    emit('download', props.order.orderNo)
  }
}

const handleCancel = () => {
  selectedFormat.value = 'xlsx'
  selectedContent.value = ['basic', 'auth']
}
</script>

<style lang="scss" scoped>
.download-modal {
  padding: 16px 0;
  
  .form-item {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 8px;
  }
  
  .form-value {
    font-size: 14px;
    color: #606266;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
  }
}
</style>