<template>
  <el-dialog v-model="dialogVisible" title="产品授权信息" width="600px" :close-on-click-modal="false">
    <div class="view-modal" v-if="auth">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="客户名称">
          {{ auth.customerName }}
        </el-descriptions-item>
        <el-descriptions-item label="授权编号">
          {{ auth.authNo }}
        </el-descriptions-item>
        <el-descriptions-item label="绑定日期">
          {{ auth.bindDate }}
        </el-descriptions-item>
        <el-descriptions-item label="授权起始日期">
          {{ auth.authStartDate }}
        </el-descriptions-item>
        <el-descriptions-item label="授权结束日期">
          {{ auth.authEndDate }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <StatusTag :status="auth.status" size="small" />
        </el-descriptions-item>
        <el-descriptions-item label="产品" :span="2">
          {{ auth.product || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="版本号" :span="2">
          {{ auth.version || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="许可类型" :span="2">
          {{ auth.licenseType || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">
          {{ auth.remarks || '-' }}
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

interface Auth {
  customerName: string
  authNo: string
  bindDate: string
  authStartDate: string
  authEndDate: string
  status: string
  product?: string
  version?: string
  licenseType?: string
  remarks?: string
}

interface Props {
  modelValue: boolean
  auth?: Auth
}

const props = defineProps<Props>()

// ─── Emits ──────────────────────────────────────────────────────

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// ─── Reactive Data ─────────────────────────────────────────────

const dialogVisible = ref(props.modelValue)
const auth = ref(props.auth)

// ─── Watch ─────────────────────────────────────────────────────

import { watch } from 'vue'

watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
})

watch(() => props.auth, (newValue) => {
  auth.value = newValue
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