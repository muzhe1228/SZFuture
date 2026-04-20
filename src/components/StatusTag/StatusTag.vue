<template>
  <el-tag
    :type="tagType"
    :size="size"
    :effect="effect"
  >
    {{ status }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
const props = defineProps<{
  // 状态值
  status: string
  // 状态类型映射
  statusMap?: Record<string, string>
  // 标签大小
  size?: 'large' | 'medium' | 'small' | 'mini'
  // 标签效果
  effect?: 'dark' | 'light' | 'plain'
}>()

// Default status map
const defaultStatusMap: Record<string, string> = {
  '正常': 'success',
  '激活': 'success',
  '已激活': 'warning',
  '未激活': 'info',
  '已冻结': 'danger',
  '冻结': 'warning',
  '已作废': 'info',
  '作废': 'danger',
  '已授权': 'success',
  '未授权': 'info',
  '已过期': 'danger',
  '过期': 'danger',
  '已取消': 'info',
  '关闭': 'danger',
  '禁用': 'warning'
}

// Computed properties
const tagType = computed(() => {
  const map = props.statusMap || defaultStatusMap
  return map[props.status] || 'info'
})
</script>

<style lang="scss" scoped>
/* 可根据需要添加自定义样式 */
</style>