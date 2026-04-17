<template>
  <Dialog v-model="dialogVisible" :title="isEditMode ? '编辑模板' : '新增模板'" width="700px" :close-on-click-modal="false" @close="handleClose">
    <div class="modal-header">
      <span class="modal-header-title">基本设置</span>
      <div class="divider" />
    </div>

    <el-form ref="templateFormRef" :model="templateForm" :rules="templateFormRules" label-width="110px" label-position="right" class="template-form">
      <el-form-item label="*模板名称" prop="name">
        <el-input v-model="templateForm.name" placeholder="请输入模板名称" />
      </el-form-item>

      <el-form-item label="*产品模块" prop="productModuleId">
        <el-select v-model="templateForm.productModuleId" placeholder="请选择产品模块" style="width: 400px">
          <el-option v-for="option in productModuleOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="*功能" prop="functions">
        <div class="function-grid">
          <div v-for="func in templateForm.functions" :key="func.id" class="function-item">
            <el-checkbox v-model="func.checked">
              <span class="function-name">{{ func.name }}</span>
              <span class="function-limit">{{ func.limit }}</span>
            </el-checkbox>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="*许可类型" prop="licenseType">
        <el-select v-model="templateForm.licenseType" placeholder="请选择许可类型" style="width: 200px">
          <el-option label="订阅" value="订阅" />
          <el-option label="永久" value="永久" />
          <el-option label="试用" value="试用" />
        </el-select>
      </el-form-item>

      <el-form-item label="*许可有效期" prop="validityPeriod">
        <el-input v-model.number="templateForm.validityPeriod" placeholder="请输入整数" type="number" min="0" style="width: 150px">
          <template #append>天</template>
        </el-input>
      </el-form-item>

      <el-form-item label="*状态" prop="statusEnabled">
        <el-switch v-model="templateForm.statusEnabled" active-text="启用" inactive-text="停用" inline-prompt />
      </el-form-item>

      <el-form-item label="浮动许可" prop="floatingLicense">
        <el-switch v-model="templateForm.floatingLicense" active-text="是" inactive-text="否" inline-prompt />
      </el-form-item>

      <el-form-item required label="激活码数量" v-if="templateForm.floatingLicense" prop="floatingLicenseCount">
        <el-input v-model.number="templateForm.floatingLicenseCount" placeholder="请输入许可关联激活码数量" type="number" min="1" style="width: 200px" />
      </el-form-item>

      <el-form-item label="描述">
        <el-input v-model="templateForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Dialog } from '@/components/Dialog'
import type { FormInstance, FormRules } from 'element-plus'
import type { LicenseTemplate } from '@/types/index'

interface TemplateFunction {
  id: number
  name: string
  limit: string
  checked: boolean
}

const props = defineProps<{
  modelValue: boolean
  isEditMode: boolean
  template: LicenseTemplate | null
  productModuleOptions: Array<{ value: number; label: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [template: LicenseTemplate, isEdit: boolean]
  'close': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const templateFormRef = ref<FormInstance>()
const submitLoading = ref(false)

const templateForm = reactive({
  name: '',
  productModuleId: 0,
  functions: [] as TemplateFunction[],
  licenseType: '' as '订阅' | '永久' | '试用',
  validityPeriod: undefined as number | undefined,
  statusEnabled: true,
  floatingLicense: false as boolean | undefined,
  floatingLicenseCount: undefined as number | undefined,
  description: ''
})

const templateFormRules: FormRules = {
  name: [{ required: true, message: '请输入模版名称', trigger: 'blur' }],
  productModuleId: [
    {
      required: true,
      message: '请选择产品模块',
      trigger: 'change',
      validator: (_rule: unknown, value: unknown, callback: (error?: Error) => void) => {
        if (!value) {
          callback(new Error('请选择对应产品'))
        } else {
          callback()
        }
      }
    }
  ],
  functions: [
    {
      required: true,
      message: '请选择功能',
      trigger: 'change',
      validator: (_rule: unknown, _value: unknown, callback: (error?: Error) => void) => {
        const checkedCount = templateForm.functions.filter((f) => f.checked).length
        if (checkedCount === 0) {
          callback(new Error('请至少选择一个功能'))
        } else {
          callback()
        }
      }
    }
  ],
  licenseType: [{ required: true, message: '请选择许可类型', trigger: 'change' }],
  validityPeriod: [
    {
      required: true,
      message: '请输入许可有效期',
      trigger: 'blur',
      validator: (_rule: unknown, value: unknown, callback: (error?: Error) => void) => {
        if (value === undefined || value === null || value === '') {
          callback(new Error('请输入许可有效期'))
        } else if (!Number.isInteger(Number(value)) || Number(value) < 0) {
          callback(new Error('请输入有效的整数'))
        } else {
          callback()
        }
      }
    }
  ],
  statusEnabled: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const resetTemplateForm = () => {
  templateForm.name = ''
  templateForm.productModuleId = 0
  templateForm.functions = []
  templateForm.licenseType = '订阅'
  templateForm.validityPeriod = undefined
  templateForm.statusEnabled = true
  templateForm.floatingLicense = false
  templateForm.floatingLicenseCount = undefined
  templateForm.description = ''
  templateFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!templateFormRef.value) return
  try {
    await templateFormRef.value.validate()
    submitLoading.value = true

    const template: LicenseTemplate = {
      id: props.template?.id || Date.now(),
      name: templateForm.name,
      productName: '',
      version: '',
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      productModuleId: templateForm.productModuleId,
      functions: templateForm.functions,
      licenseType: templateForm.licenseType,
      validityPeriod: templateForm.validityPeriod,
      status: templateForm.statusEnabled ? '启用' : '停用',
      floatingLicense: templateForm.floatingLicense,
      floatingLicenseCount: templateForm.floatingLicenseCount,
      description: templateForm.description
    }

    emit('submit', template, props.isEditMode)
    dialogVisible.value = false
  } catch {
    // Form validation failed
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleClose = () => {
  resetTemplateForm()
  emit('close')
}

// Watch for template changes to update form
watch(() => props.template, (newTemplate) => {
  if (newTemplate) {
    templateForm.name = newTemplate.name
    templateForm.productModuleId = newTemplate.productModuleId || 0
    templateForm.functions = newTemplate.functions || []
    templateForm.licenseType = newTemplate.licenseType || '订阅'
    templateForm.validityPeriod = newTemplate.validityPeriod
    templateForm.statusEnabled = newTemplate.status === '启用'
    templateForm.floatingLicense = newTemplate.floatingLicense
    templateForm.floatingLicenseCount = newTemplate.floatingLicenseCount
    templateForm.description = newTemplate.description || ''
  } else {
    resetTemplateForm()
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

  &-title {
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    white-space: nowrap;
  }
}

.divider {
  flex: 1;
  height: 1px;
  background-color: #ebeef5;
}

.template-form {
  padding: 8px 0;

  .el-form-item {
    margin-bottom: 16px;
  }
}

.function-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 8px 0;
}

.function-item {
  display: flex;
  align-items: center;

  :deep(.el-checkbox) {
    .el-checkbox__label {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
  }

  .function-name {
    font-size: 13px;
    color: #606266;
    margin-right: 4px;
  }

  .function-limit {
    font-size: 12px;
    color: #909399;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .function-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .function-grid {
    grid-template-columns: 1fr;
  }
}
</style>