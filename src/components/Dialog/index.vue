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
    <!-- Dialog Content -->
    <slot></slot>

    <!-- Dialog Footer -->
    <template #footer>
      <slot name="footer">
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleConfirm" :loading="loading">
            确定
          </el-button>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  width?: string
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  loading?: boolean
}>(), {
  width: '500px',
  closeOnClickModal: false,
  closeOnPressEscape: true,
  showClose: true,
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel': []
  'close': []
}>()

const dialogVisible = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
})

watch(dialogVisible, (newValue) => {
  emit('update:modelValue', newValue)
})

const handleClose = () => {
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  dialogVisible.value = false
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>