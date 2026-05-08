<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :show-close="showClose"
    @close="handleClose"
  >
    <div class="dialog-content">
      <slot></slot>
    </div>
    <template #footer>
      <slot name="footer">
        <div class="dialog-footer">
          <el-button v-if="showCancelButton" @click="handleCancel" :loading="cancelLoading">
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
          <slot name="extra-actions"></slot>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'

  interface Props {
    modelValue: boolean
    title: string
    width?: string
    closeOnClickModal?: boolean
    closeOnPressEscape?: boolean
    showClose?: boolean
    showFooter?: boolean
    showCancelButton?: boolean
    showConfirmButton?: boolean
    cancelText?: string
    confirmText?: string
    confirmType?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
    cancelLoading?: boolean
    confirmLoading?: boolean
    confirmDisabled?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    width: '520px',
    closeOnClickModal: false,
    closeOnPressEscape: false,
    showClose: true,
    showFooter: true,
    showCancelButton: true,
    showConfirmButton: true,
    cancelText: '取消',
    confirmText: '确定',
    confirmType: 'primary',
    cancelLoading: false,
    confirmLoading: false,
    confirmDisabled: false,
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'close'): void
    (e: 'cancel'): void
    (e: 'confirm'): void
  }>()

  const dialogVisible = ref(props.modelValue)

  watch(
    () => props.modelValue,
    (newValue) => {
      dialogVisible.value = newValue
    }
  )

  watch(dialogVisible, (newValue) => {
    emit('update:modelValue', newValue)
  })

  const handleClose = () => {
    emit('close')
  }

  const handleCancel = () => {
    dialogVisible.value = false
    emit('cancel')
  }

  const handleConfirm = () => {
    emit('confirm')
  }
</script>

<style lang="scss" scoped>
  .dialog-content {
    margin-bottom: 20px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
