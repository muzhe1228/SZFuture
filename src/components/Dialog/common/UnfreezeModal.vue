<template>
  <BaseDialog :model-value="modelValue" :title="title" width="520px" :close-on-click-modal="false" confirm-text="确定"
    :confirm-loading="unfreezeLoading" @update:model-value="(val) => emit('update:modelValue', val)"
    @confirm="handleUnfreezeSubmit" @cancel="handleCancel" :show-cancel-button="false">
    <div class="unfreeze-modal">
      <el-form label-width="90px" label-position="right" class="modal-form">
        <el-form-item label="冻结时间">
          <el-input :value="data?.authEndDate" disabled type="text" :rows="4" :placeholder="placeholder" />
        </el-form-item>
        <el-form-item label="冻结原因">
          <el-input :value="data?.remarks" disabled type="text" :rows="4" :placeholder="placeholder" />
        </el-form-item>
        <el-form-item :label="reasonLabel">
          <el-input v-model="unfreezeForm.reason" type="textarea" :rows="4" :placeholder="placeholder" />
        </el-form-item>
      </el-form>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { BaseDialog } from '@/components/BaseDialog'
import request from '@/utils/request'

interface UnfreezeData {
  freezeTime?: string
  freezeReason?: string,
  [key: string]: any
}

interface Props {
  modelValue: boolean
  data?: UnfreezeData | null
  id?: number | null
  title?: string
  reasonLabel?: string
  placeholder?: string
  apiUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '授权解冻',
  reasonLabel: '解冻原因',
  placeholder: '请输入解冻原因',
  apiUrl: '/api/auth/unfreeze',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'unfreeze', reason: string, id?: number): void
}>()

const unfreezeForm = reactive({ reason: '' })
const unfreezeLoading = ref(false)

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      unfreezeForm.reason = ''
    }
  }
)

const handleUnfreezeSubmit = async () => {
  if (!unfreezeForm.reason.trim()) {
    ElMessage.warning('请填写' + props.reasonLabel)
    return
  }
  unfreezeLoading.value = true
  try {
    const result = await request.post(props.apiUrl, {
      id: props.id,
      reason: unfreezeForm.reason,
    })
    if (result.code === 200) {
      ElMessage.success('操作成功')
      emit('unfreeze', unfreezeForm.reason, props.id ?? undefined)
    } else {
      ElMessage.error(result.message || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    unfreezeLoading.value = false
  }
}

const handleCancel = () => {
  unfreezeForm.reason = ''
}
</script>

<style lang="scss" scoped>
.unfreeze-modal {
  .el-descriptions {
    margin-bottom: 20px;
  }
}

.modal-form {
  margin-top: 16px;
}
</style>