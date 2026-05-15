<template>
  <BaseDialog :model-value="modelValue" :title="title" width="520px" :close-on-click-modal="false" confirm-text="确定"
    :confirm-loading="loading" :show-cancel-button="false" @update:model-value="(val) => emit('update:modelValue', val)" @confirm="handleSubmit"
    @cancel="handleCancel">
    <div class="void-modal">
      <el-form label-width="90px" label-position="right" class="modal-form">
        <el-form-item label="审批人员">
          <el-select v-model="form.approver" placeholder="请选择审批人员" style="width: 100%">
            <el-option label="张经理" value="张经理" />
            <el-option label="李主管" value="李主管" />
            <el-option label="王总监" value="王总监" />
          </el-select>
        </el-form-item>
        <el-form-item label="作废原因">
          <el-input v-model="form.reason" type="textarea" :rows="3" placeholder="请输入作废原因" />
          <span class="tip-text">
            <img :src="IconError" />
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
import IconError from '@/assets/icons/iconError.png'

interface Props {
  modelValue: boolean
  title?: string
  alertTitle?: string
  apiUrl?: string
  selectedIds?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  title: '授权作废',
  alertTitle: '作废后该授权无法使用，无法恢复该操作',
  apiUrl: '/api/trial/void',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'void', reason: string, approver: string, ids: number[]): void
}>()

const form = reactive({ reason: '', approver: '' })
const loading = ref(false)

const alertTitle = computed(() => props.alertTitle)

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      form.reason = ''
      form.approver = ''
    }
  }
)

const handleSubmit = async () => {
  if (!form.reason.trim()) {
    ElMessage.warning('请填写作废原因')
    return
  }
  if (!form.approver) {
    ElMessage.warning('请选择审批人员')
    return
  }
  loading.value = true
  try {
    const result = await request.post(props.apiUrl, {
      ids: props.selectedIds || [],
      reason: form.reason,
      approver: form.approver,
    })
    if (result.code === 200) {
      ElMessage.success('作废成功')
      emit('void', form.reason, form.approver, props.selectedIds || [])
    } else {
      ElMessage.error(result.message || '作废失败')
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  form.reason = ''
  form.approver = ''
}
</script>

<style lang="scss" scoped>
.void-modal {
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
  color: var(--el-color-error);
  line-height: 1;

  img {
    width: 13px;
    margin-right: 4px;
  }
}
</style>
