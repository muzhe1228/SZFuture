<template>
  <el-dialog v-model="dialogVisible" title="删除试用" width="480px" :close-on-click-modal="false">
    <div class="delete-modal">
      <el-alert :title="`确定要删除选中的 ${selectedCount} 条试用记录吗？此操作不可恢复`" type="error" :closable="false"
        show-icon />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="danger" @click="handleDeleteSubmit" :loading="deleteLoading">
          确定删除
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// ─── Props ──────────────────────────────────────────────────────

interface Props {
  modelValue: boolean
  selectedCount: number
  selectedIds?: number[]
}

const props = defineProps<Props>()

// ─── Emits ──────────────────────────────────────────────────────

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'delete', ids: number[]): void
}>()

// ─── Reactive Data ─────────────────────────────────────────────

const dialogVisible = ref(props.modelValue)
const deleteLoading = ref(false)

// ─── Watch ─────────────────────────────────────────────────────

import { watch } from 'vue'

watch(() => props.modelValue, (newValue) => {
  dialogVisible.value = newValue
})

// ─── Methods ───────────────────────────────────────────────────

const handleDeleteSubmit = async () => {
  deleteLoading.value = true
  try {
    const response = await fetch('/api/trial/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: props.selectedIds || [] })
    })
    const result = await response.json()
    if (result.code === 200) {
      ElMessage.success(`已成功删除 ${props.selectedCount} 条试用记录`)
      emit('delete', props.selectedIds || [])
    }
  } catch {
    ElMessage.error('删除失败')
  } finally {
    emit('update:modelValue', false)
    deleteLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.delete-modal {
  .el-alert {
    margin-bottom: 0;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>