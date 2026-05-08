<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="title" 
    width="600px" 
    :close-on-click-modal="false"
  >
    <div class="view-modal" v-if="data">
      <el-descriptions :column="2" border>
        <template v-for="item in descriptionItems" :key="item.key">
          <el-descriptions-item :label="item.label" :span="item.span || 1">
            <template v-if="item.type === 'status'">
              <StatusTag :status="data[item.key as keyof typeof data] as string" :status-map="statusMap" size="small" />
            </template>
            <template v-else>
              {{ data[item.key as keyof typeof data] || '-' }}
            </template>
          </el-descriptions-item>
        </template>
      </el-descriptions>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { StatusTag } from '@/components/StatusTag'

  interface DescriptionItem {
    label: string
    key: string
    span?: number
    type?: 'status' | 'text'
  }

  interface Props {
    modelValue: boolean
    data?: Record<string, any> | null
    title?: string
    descriptionItems?: DescriptionItem[]
    statusMap?: Record<string, string>
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '详情信息',
    descriptionItems: () => [],
    statusMap: () => ({
      已激活: 'warning',
      未激活: 'info',
      已过期: 'info',
      已冻结: 'danger',
      正常: 'success',
      冻结: 'danger',
    }),
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
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
</script>

<style lang="scss" scoped>
  .view-modal {
    .el-descriptions {
      --el-descriptions-item-bordered-label-background: #fafafa;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>