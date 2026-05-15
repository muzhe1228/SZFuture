<template>
  <BaseDialog :model-value="modelValue" :title="title" width="520px" :close-on-click-modal="false" :show-cancel-button="false" confirm-text="确定"
    :confirm-loading="loading" @update:model-value="(val) => emit('update:modelValue', val)" @confirm="handleSubmit"
    @cancel="handleCancel">
    <div class="freeze-modal">
      <el-form label-width="90px" label-position="right" class="modal-form">
        <el-form-item label="冻结原因">
          <el-input v-model="form.reason" type="textarea" :rows="4" placeholder="请输入冻结原因" />
          <span class="tip-text">
            <img :src="IconWarn" />
            {{ alertTitle }}
          </span>
        </el-form-item>
      </el-form>
    </div>
  </BaseDialog>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { BaseDialog } from '@/components/BaseDialog'
import request from '@/utils/request'
import IconWarn from '@/assets/icons/iconWarn.png'

interface Props {
  modelValue: boolean
  title?: string
  alertTitle?: string
  alertType?: 'warning' | 'error' | 'info' | 'success'
  apiUrl?: string
  singleId?: number | null
  selectedIds?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '授权冻结',
  alertTitle: '冻结后该授权暂时无法使用，可解冻',
  alertType: 'warning',
  apiUrl: '/api/trial/freeze',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'freeze', reason: string, ids: number[]): void
}>()

const form = reactive({ reason: '' })
const loading = ref(false)

const alertTitle = computed(() => props.alertTitle)

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      form.reason = ''
    }
  }
)

const handleSubmit = async () => {
  if (!form.reason.trim()) {
    ElMessage.warning('请填写冻结原因')
    return
  }
  loading.value = true
  try {
    const ids = props.singleId ? [props.singleId] : props.selectedIds || []
    const result = await request.post(props.apiUrl, {
      ids,
      reason: form.reason,
    })
    if (result.code === 200) {
      ElMessage.success('冻结成功')
      emit('freeze', form.reason, ids)
    } else {
      ElMessage.error(result.message || '冻结失败')
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  form.reason = ''
}
</script>

<style lang="scss" scoped>
.freeze-modal {
  .el-alert {
    margin-bottom: 20px;
  }
}

.modal-form {
  margin-top: 16px;
}

.tip-text {
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  line-height: 1;

  img {
    width: 13px;
    margin-right: 4px;
  }
}
</style>
