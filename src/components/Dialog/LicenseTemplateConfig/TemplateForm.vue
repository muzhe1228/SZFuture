<template>
  <BaseDialog v-model="dialogVisible" :title="isEditMode ? '编辑模板' : '新增模板'" width="680px" :close-on-click-modal="false"
    @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" label-position="right"
      class="template-form">
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入模板名称" />
      </el-form-item>

      <el-form-item label="上级部门" prop="productModuleId">
        <el-select v-model="form.productModuleId" placeholder="请选择上级部门">
          <el-option label="订阅" value="订阅" />
          <el-option label="永久" value="永久" />
          <el-option label="试用" value="试用" />
        </el-select>
      </el-form-item>

      <el-form-item label="功能" prop="functions">
        <div class="function-grid">
          <div v-for="func in functions" :key="func.id" class="function-item">
            <el-checkbox v-model="func.checked">
              <span class="function-name">{{ func.name }}</span>
              <span class="function-limit">{{ func.limit }}</span>
            </el-checkbox>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="许可类型" prop="licenseType">
        <el-select v-model="form.licenseType" placeholder="请选择许可类型">
          <el-option label="订阅" value="订阅" />
          <el-option label="永久" value="永久" />
          <el-option label="试用" value="试用" />
        </el-select>
      </el-form-item>

      <el-form-item label="许可有效期" prop="validityPeriod">
        <el-select v-model="form.validityPeriod" placeholder="请选择许可有效期">
          <el-option label="订阅" value="订阅" />
          <el-option label="永久" value="永久" />
          <el-option label="试用" value="试用" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" required prop="statusEnabled">
        <el-radio-group v-model="form.statusEnabled">
          <el-radio-button :label="true">启用</el-radio-button>
          <el-radio-button :label="false">停用</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <!-- <el-row :gutter="20">
        <el-col :span="9"> -->
      <el-form-item label="浮动许可" prop="floatingLicense">
        <el-radio-group v-model="form.floatingLicense" style="width: 100px">
          <el-radio-button :label="true">是</el-radio-button>
          <el-radio-button :label="false">否</el-radio-button>
        </el-radio-group>
        <el-form-item required :label="false" v-if="form.floatingLicense" prop="floatingLicenseCount" class="cusItem">
          <el-input v-model.number="form.floatingLicenseCount" placeholder="请输入许可关联激活码数量" type="number" min="1" />
        </el-form-item>
      </el-form-item>
      <!-- </el-col> -->
      <!-- <el-col :span="15">
          <el-form-item required :label="false" v-if="form.floatingLicense" prop="floatingLicenseCount" class="cusItem">
            <el-input v-model.number="form.floatingLicenseCount" placeholder="请输入许可关联激活码数量" type="number" min="1" />
          </el-form-item>
        </el-col>
      </el-row> -->

      <el-form-item label="说明">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref as vueRef, computed, watch } from 'vue'
import { BaseDialog } from '@/components/BaseDialog'
import type { FormRules } from 'element-plus'
import type { LicenseTemplate } from '@/types/index'
import { useForm } from '@/composables/useForm'

interface TemplateFunction {
  id: number
  name: string
  limit: string
  checked: boolean
}

interface TemplateForm {
  name: string
  productModuleId: string
  licenseType: '订阅' | '永久' | '试用'
  validityPeriod: number | undefined
  statusEnabled: boolean
  floatingLicense: boolean
  floatingLicenseCount: number | undefined
  description: string
}

const props = defineProps<{
  modelValue: boolean
  isEditMode: boolean
  template: LicenseTemplate | null
  productModuleOptions: Array<{ value: number; label: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [template: LicenseTemplate, isEdit: boolean]
  close: []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const submitLoading = vueRef(false)

const functions = vueRef<TemplateFunction[]>([])

const defaultValues: TemplateForm = {
  name: '',
  productModuleId: '试用',
  licenseType: '订阅',
  validityPeriod: undefined,
  statusEnabled: true,
  floatingLicense: false,
  floatingLicenseCount: undefined,
  description: '',
}

const rules: FormRules = {
  name: [{ required: true, message: '请输入模版名称', trigger: 'blur' }],
  productModuleId: [{ required: true, message: '请选择上级部门', trigger: 'change' }],
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
      },
    },
  ],
  statusEnabled: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

const { form, resetForm, validateForm, setFormValue } = useForm<TemplateForm>(defaultValues, rules)

const validateFunctions = (): boolean => {
  const checkedCount = functions.value.filter((f) => f.checked).length
  return checkedCount > 0
}

const resetFunctions = () => {
  functions.value = []
}

const handleSubmit = async () => {
  try {
    if (!validateFunctions()) {
      return
    }

    const isValid = await validateForm()
    if (!isValid) return

    submitLoading.value = true

    const template: LicenseTemplate = {
      id: props.template?.id || Date.now(),
      name: form.name,
      productName: '',
      version: '',
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      productModuleId: form.productModuleId,
      functions: functions.value,
      licenseType: form.licenseType,
      validityPeriod: form.validityPeriod,
      status: form.statusEnabled ? '启用' : '停用',
      floatingLicense: form.floatingLicense,
      floatingLicenseCount: form.floatingLicenseCount,
      description: form.description,
    }

    emit('submit', template, props.isEditMode)
    dialogVisible.value = false
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleClose = () => {
  resetForm()
  resetFunctions()
  emit('close')
}

watch(
  () => props.template,
  (newTemplate) => {
    if (newTemplate) {
      setFormValue({
        name: newTemplate.name,
        productModuleId: newTemplate.productModuleId || '',
        licenseType: newTemplate.licenseType || '订阅',
        validityPeriod: newTemplate.validityPeriod,
        statusEnabled: newTemplate.status === '启用',
        floatingLicense: newTemplate.floatingLicense || false,
        floatingLicenseCount: newTemplate.floatingLicenseCount,
        description: newTemplate.description || '',
      })
      functions.value = newTemplate.functions || []
    } else {
      resetForm()
      resetFunctions()
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
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

:deep(.cusItem) {
  flex: 1;
  margin-bottom: 0 !important;

  .el-form-item__content {
    margin-left: 0 !important;
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
    color: var(--el-text-color-secondary);
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