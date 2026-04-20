<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    @close="handleClose"
  >
    <!-- Modal Content -->
    <div class="modal-content">
      <slot></slot>
    </div>

    <!-- Modal Footer -->
    <template #footer>
      <div class="dialog-footer" v-if="showFooter">
        <el-button
          v-if="showCancelButton"
          @click="handleCancel"
          :loading="cancelLoading"
        >
          {{ cancelText }}
        </el-button>
        <el-button
          v-if="showConfirmButton"
          :type="confirmType"
          @click="handleConfirm"
          :loading="confirmLoading"
          :disabled="confirmDisabled"
        >
          {{ confirmText }}
        </el-button>
        <slot name="footer"></slot>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Props
const props = defineProps<{
  // 可见性（v-model）
  modelValue: boolean
  // 标题
  title: string
  // 宽度
  width?: string
  // 是否可点击模态框关闭
  closeOnClickModal?: boolean
  // 是否可按ESC关闭
  closeOnPressEscape?: boolean
  // 是否显示关闭按钮
  showClose?: boolean
  // 是否显示底部
  showFooter?: boolean
  // 是否显示取消按钮
  showCancelButton?: boolean
  // 是否显示确认按钮
  showConfirmButton?: boolean
  // 取消按钮文本
  cancelText?: string
  // 确认按钮文本
  confirmText?: string
  // 确认按钮类型
  confirmType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  // 取消按钮加载状态
  cancelLoading?: boolean
  // 确认按钮加载状态
  confirmLoading?: boolean
  // 确认按钮禁用状态
  confirmDisabled?: boolean
}>()

// Emits
const emit = defineEmits<{
  // 可见性变化事件（v-model）
  (e: 'update:modelValue', value: boolean): void
  // 关闭事件
  (e: 'close'): void
  // 取消事件
  (e: 'cancel'): void
  // 确认事件
  (e: 'confirm'): void
}>()

// Reactive data
const visible = ref(props.modelValue)

// Defaults
const width = props.width || '500px'
const closeOnClickModal = props.closeOnClickModal !== false
const closeOnPressEscape = props.closeOnPressEscape !== false
const showClose = props.showClose !== false
const showFooter = props.showFooter !== false
const showCancelButton = props.showCancelButton !== false
const showConfirmButton = props.showConfirmButton !== false
const cancelText = props.cancelText || '取消'
const confirmText = props.confirmText || '确定'
const confirmType = props.confirmType || 'primary'

// Watch for modelValue changes
watch(
  () => props.modelValue,
  (newValue) => {
    visible.value = newValue
  }
)

// Watch for visible changes
watch(
  visible,
  (newValue) => {
    emit('update:modelValue', newValue)
  }
)

// Methods
const handleClose = () => {
  emit('close')
}

const handleCancel = () => {
  visible.value = false
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style lang="scss" scoped>
.modal-content {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>