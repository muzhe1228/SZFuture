<template>
  <span v-if="mode === 'dot'" class="status-dot-wrapper">
    <span class="status-dot" :class="dotClass"></span>
    <span class="status-text" :class="textClass">{{ status || '未知' }}</span>
  </span>
  <el-tag v-else :type="tagType" :size="size" :effect="effect">
    {{ status || '未知' }}
  </el-tag>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { statusMap as defaultStatusMap } from '@/config/statusMap'

  // Props
  const props = defineProps<{
    // 状态值
    status: string | undefined
    // 状态类型映射
    statusMap?: Record<string, string>
    // 标签大小
    size?: 'large' | 'medium' | 'small' | 'mini'
    // 标签效果
    effect?: 'dark' | 'light' | 'plain'
    // 显示模式：tag（标签）或 dot（圆点）
    mode?: 'tag' | 'dot'
  }>()

  // Computed properties
  const tagType = computed(() => {
    const map = props.statusMap || defaultStatusMap
    return map[props.status || ''] || 'info'
  })

  const dotClass = computed(() => {
    const type = tagType.value
    return `status-dot-${type}`
  })

  const textClass = computed(() => {
    const type = tagType.value
    return `status-text-${type}`
  })
</script>

<style lang="scss" scoped>
  .status-dot-wrapper {
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

  .status-dot-success {
    background-color: #67c23a;
  }

  .status-dot-warning {
    background-color: #e6a23c;
  }

  .status-dot-danger {
    background-color: #f56c6c;
  }

  .status-dot-info {
    background-color: #909399;
  }

  .status-dot-primary {
    background-color: #409eff;
  }

  .status-text {
    font-size: 14px;
  }

  .status-text-success {
    color: #67c23a;
  }

  .status-text-warning {
    color: #e6a23c;
  }

  .status-text-danger {
    color: #f56c6c;
  }

  .status-text-info {
    color: #909399;
  }

  .status-text-primary {
    color: #409eff;
  }
</style>
