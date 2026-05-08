<template>
  <el-dialog v-model="dialogVisible" title="许可模版详情" width="600px" :close-on-click-modal="false">
    <el-descriptions :column="1" border v-if="template">
      <el-descriptions-item label="模版名称">{{ template.name }}</el-descriptions-item>
      <el-descriptions-item label="产品名称">{{ template.productName }}</el-descriptions-item>
      <el-descriptions-item label="版本号">{{ template.version }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <span class="status-cell">
          <span class="status-dot" :class="template.status === '启用' ? 'status-enabled' : 'status-disabled'"></span>
          {{ template.status }}
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ template.createTime }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  // ─── Props ──────────────────────────────────────────────────────

  interface LicenseTemplate {
    id: number
    name: string
    productName: string
    version: string
    status: string
    createTime: string
  }

  interface Props {
    modelValue: boolean
    template?: LicenseTemplate | null
  }

  const props = defineProps<Props>()

  // ─── Emits ──────────────────────────────────────────────────────

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
  }>()

  // ─── Reactive Data ─────────────────────────────────────────────

  const dialogVisible = ref(props.modelValue)
  const template = ref(props.template)

  // ─── Watch ─────────────────────────────────────────────────────

  import { watch } from 'vue'

  watch(
    () => props.modelValue,
    (newValue) => {
      dialogVisible.value = newValue
    }
  )

  watch(
    () => props.template,
    (newValue) => {
      template.value = newValue
    }
  )

  watch(dialogVisible, (newValue) => {
    emit('update:modelValue', newValue)
  })
</script>

<style lang="scss" scoped>
  .status-cell {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .status-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-enabled {
    background-color: #67c23a;
  }

  .status-disabled {
    background-color: var(--el-text-color-secondary);
  }
</style>
