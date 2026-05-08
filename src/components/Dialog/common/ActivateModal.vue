<template>
  <BaseDialog
    :model-value="modelValue"
    :title="title"
    width="520px"
    :close-on-click-modal="false"
    confirm-text="生成激活码"
    confirm-type="success"
    :confirm-loading="loading"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @confirm="handleSubmit"
    @cancel="handleCancel"
  >
    <div class="activate-modal">
      <el-form label-width="100px" label-position="right">
        <el-form-item :label="firstLabel">
          <el-input v-model="form.key" placeholder="请输入密钥" clearable />
        </el-form-item>
        <el-form-item label="设备指纹">
          <el-input v-model="form.deviceFingerprint" placeholder="请输入设备指纹" clearable />
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

  interface Props {
    modelValue: boolean
    title?: string
    firstLabel?: string
    initialKey?: string
    apiUrl?: string
    itemId?: number | null
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '授权激活',
    firstLabel: '授权编号',
    apiUrl: '/api/trial/activate',
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'activate', key: string, deviceFingerprint: string, id: number): void
  }>()

  const form = reactive({
    key: props.initialKey || '',
    deviceFingerprint: '',
  })
  const loading = ref(false)

  const firstLabel = computed(() => props.firstLabel)

  watch(
    () => props.modelValue,
    (newValue) => {
      if (newValue) {
        form.key = props.initialKey || ''
        form.deviceFingerprint = ''
      }
    }
  )

  watch(
    () => props.initialKey,
    (newValue) => {
      form.key = newValue || ''
    }
  )

  const handleSubmit = async () => {
    if (!form.key.trim()) {
      ElMessage.warning('请输入密钥')
      return
    }
    if (!form.deviceFingerprint.trim()) {
      ElMessage.warning('请输入设备指纹')
      return
    }
    loading.value = true
    try {
      const result = await request.post(props.apiUrl, {
        id: props.itemId,
        licenseKey: form.key,
        deviceFingerprint: form.deviceFingerprint,
      })
      if (result.code === 200) {
        ElMessage.success('激活码生成成功，授权已激活')
        if (props.itemId) {
          emit('activate', form.key, form.deviceFingerprint, props.itemId)
        }
      } else {
        ElMessage.error(result.message || '激活失败')
      }
    } catch {
      ElMessage.error('操作失败')
    } finally {
      loading.value = false
    }
  }

  const handleCancel = () => {
    form.key = ''
    form.deviceFingerprint = ''
  }
</script>

<style lang="scss" scoped>
  .activate-modal {
    padding: 20px 0;
  }
</style>
