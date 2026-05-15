<template>
    <div class="detail-item">
        <div class="detail-item-label">{{ label }}</div>
        <div class="detail-item-value">
            <StatusTag 
                v-if="type === 'status'" 
                :status="value" 
                :status-map="statusMap" 
                :size="size" 
            />
            <template v-else>
                {{ value || '-' }}
            </template>
        </div>
    </div>
</template>
<script setup lang="ts">
import { StatusTag } from '@/components/StatusTag'

interface Props {
    label: string
    value: string
    type?: 'text' | 'status'
    statusMap?: Record<string, string>
    size?: 'large' | 'medium' | 'small' | 'mini'
}

withDefaults(defineProps<Props>(), {
    label: '',
    value: '',
    type: 'text',
    size: 'small',
})
</script>

<style lang="scss" scoped>
.detail-item {
    display: flex;
    align-items: center;
    border-radius: 6px;
    border: 1px solid #E5E5E5;
    overflow: hidden;
    margin-bottom: 12px;

    &-label {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 140px;
        background-color: var(--el-bg-color);
    }

    &-value {
        padding-left: 16px;
        display: flex;
        align-items: center;
        flex: 1;
        background-color: var(--input-bg-color);
        height: 100%;
        border-left: 1px solid #E5E5E5;
        min-height: 40px;
    }
}
</style>