<template>
  <el-dialog v-model="dialogVisible" title="产品试用信息" width="600px" :close-on-click-modal="false">
    <div class="view-modal" v-if="trial">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="客户名称">
          {{ trial.customerName }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ trial.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="绑定日期">
          {{ trial.bindDate }}
        </el-descriptions-item>
        <el-descriptions-item label="授权起始日期">
          {{ trial.authStartDate }}
        </el-descriptions-item>
        <el-descriptions-item label="授权结束日期">
          {{ trial.authEndDate }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <StatusTag :status="trial.status" :status-map="statusMap" size="small" />
        </el-descriptions-item>
        <el-descriptions-item label="License Key" :span="2">
          {{ trial.licenseKey || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="产品" :span="2">
          {{ trial.product || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="版本号" :span="2">
          {{ trial.version || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ trial.remarks || '-' }}
        </el-descriptions-item>
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
import { ref } from 'vue'
import { StatusTag } from '@/components/StatusTag'

// ─── Props ──────────────────────────────────────────────────────

interface Trial {
  customerName: string
  phone: string
  bindDate: string
  authStartDate: string
  authEndDate: string
  status: string
  licenseKey?: string
  product?: string
  version?: string
  remarks?: string
}

interface Props {
  modelValue: boolean
  trial?: Trial | null
}

const props = defineProps<Props>()

// ─── Emits ──────────────────────────────────────────────────────

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// ─── Reactive Data ─────────────────────────────────────────────

const dialogVisible = ref(props.modelValue)
const trial = ref(props.trial)

// ─── Status Tag Type ──────────────────────────────────────────────────

const statusMap = {
  '已激活': 'warning',
  '未激活': 'info',
  '已过期': 'info',
  '已冻结': 'danger'
}

// ─── Watch ─────────────────────────────────────────────────────

import { watch } from 'vue'

watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
})

watch(() => props.trial, (newValue) => {
  trial.value = newValue
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