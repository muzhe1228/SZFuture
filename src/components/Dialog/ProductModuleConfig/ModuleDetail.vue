<template>
  <Dialog v-model="dialogVisible" title="模块详情" width="500px" :close-on-click-modal="false">
    <el-descriptions :column="1" border v-if="module">
      <el-descriptions-item label="名称">{{ module.name }}</el-descriptions-item>
      <el-descriptions-item label="类型">
        <el-tag :type="getTypeTagType(module.type)" size="small">
          {{ module.type }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="状态">{{ module.status }}</el-descriptions-item>
      <el-descriptions-item label="说明">{{ module.description || '--' }}</el-descriptions-item>
    </el-descriptions>
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
import type { ProductModule } from '@/types/index'

const props = defineProps<{
  modelValue: boolean
  module: ProductModule | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const getTypeTagType = (type: string): 'primary' | 'warning' | 'success' => {
  switch (type) {
    case '产品':
      return 'primary'
    case '版本':
      return 'warning'
    case '功能':
      return 'success'
    default:
      return 'primary'
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>