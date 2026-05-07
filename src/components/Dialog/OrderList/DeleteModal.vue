<template>
  <el-dialog
    v-model="dialogVisible"
    width="420px"
    :close-on-click-modal="false"
    class="delete-dialog"
  >
    <div class="delete-content">
      <div class="delete-header">
        <el-icon class="warning-icon" :size="24" color="#E6A23C">
          <WarningFilled />
        </el-icon>
        <span class="delete-title">温馨提示</span>
      </div>
      <p class="delete-message">是否删除所选订单?</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDeleteConfirm" :loading="deleteLoading">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// ─── Props ──────────────────────────────────────────────────────

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()

// ─── Emits ──────────────────────────────────────────────────────

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'delete'): void
}>()

// ─── Reactive Data ─────────────────────────────────────────────

const dialogVisible = ref(props.modelValue)
const deleteLoading = ref(false)

// ─── Watch ─────────────────────────────────────────────────────

import { watch } from 'vue'

watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
})

// ─── Methods ───────────────────────────────────────────────────

const handleDeleteConfirm = async () => {
  deleteLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 600))
  ElMessage.success('订单删除成功')
  emit('delete')
  emit('update:modelValue', false)
  deleteLoading.value = false
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
      font-size: 18px;
      font-weight: 600;
      
    }
  }

  .delete-message {
    font-size: 15px;
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