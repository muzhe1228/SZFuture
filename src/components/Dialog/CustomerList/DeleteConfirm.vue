<template>
  <Dialog v-model="dialogVisible" title="删除确认" width="420px" :close-on-click-modal="false" class="delete-dialog">
    <div class="delete-content">
      <div class="delete-header">
        <el-icon class="warning-icon" :size="24" color="#E6A23C">
          <WarningFilled />
        </el-icon>
        <span class="delete-title">温馨提示</span>
      </div>
      <p class="delete-message">是否删除所选客户?</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="danger" @click="handleConfirm" :loading="loading">确定</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import { Dialog } from '@/components/Dialog'

const props = defineProps<{
  modelValue: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleCancel = () => {
  emit('cancel')
  dialogVisible.value = false
}

const handleConfirm = () => {
  emit('confirm')
  dialogVisible.value = false
}
</script>

<style lang="scss" scoped>
.delete-dialog {
  :deep(.el-dialog__header) {
    display: none;
  }

  :deep(.el-dialog__body) {
    padding: 30px 20px 20px;
  }
}

.delete-content {
  text-align: center;

  .delete-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;

    .warning-icon {
      flex-shrink: 0;
    }

    .delete-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .delete-message {
    font-size: 14px;
    color: #606266;
    margin: 0;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>