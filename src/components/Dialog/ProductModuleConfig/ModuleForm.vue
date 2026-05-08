<template>
  <BaseDialog
    v-model="dialogVisible"
    :title="isEditMode ? '编辑模块' : '新增模块'"
    width="680px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="modal-header">
      <span class="modal-header-title">基本设置</span>
      <div class="divider" />
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="110px"
      label-position="right"
      class="module-form"
    >
      <el-form-item label="*模块类型:" prop="type">
        <el-radio-group v-model="form.type" @change="handleTypeChange">
          <el-radio-button label="产品" value="产品" />
          <el-radio-button label="版本" value="版本" />
          <el-radio-button label="模块" value="模块" />
        </el-radio-group>
      </el-form-item>

      <el-form-item label="*产品名称:" prop="name" v-if="form.type === '产品'">
        <el-input v-model="form.name" placeholder="请输入菜单名称" />
      </el-form-item>

      <el-form-item label="*版本名称:" prop="name" v-if="form.type === '版本'">
        <el-input v-model="form.name" placeholder="请输入版本名称" />
      </el-form-item>

      <el-form-item label="*上级菜单:" prop="parentId" v-if="form.type !== '产品'">
        <el-select v-model="form.parentId" placeholder="请选择上级菜单" filterable style="width: 100%">
          <el-option
            v-for="option in parentMenuOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="*功能设置:" prop="functionSettings" v-if="form.type === '模块'">
        <div class="function-grid">
          <div v-for="func in functionSettingsList" :key="func.id" class="function-item">
            <el-checkbox v-model="func.checked" @change="handleFunctionToggle">
              <span class="function-name">功能名称</span>
              <el-switch v-model="func.enabled" size="small" :width="24" @click.stop @change="handleFunctionToggle" />
            </el-checkbox>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="*状态:" prop="status" v-if="form.type === '产品'">
        <el-switch v-model="form.statusEnabled" active-text="启用" inactive-text="停用" inline-prompt />
      </el-form-item>
      <el-form-item label="*状态:" prop="status" v-else>
        <el-radio-group v-model="form.statusEnabled">
          <el-radio-button :label="true">启用</el-radio-button>
          <el-radio-button :label="false">停用</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="说明:">
        <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入说明" resize="none" />
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
  import type { ProductModule } from '@/types/index'
  import { useForm } from '@/composables/useForm'

  interface FunctionSetting {
    id: number
    name: string
    checked: boolean
    enabled: boolean
  }

  interface ModuleForm {
    name: string
    type: ProductModule['type']
    parentId: number
    statusEnabled: boolean
    description: string
  }

  const props = defineProps<{
    modelValue: boolean
    isEditMode: boolean
    module: ProductModule | null
    parentMenuOptions: Array<{ label: string; value: number }>
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: [module: ProductModule, isEdit: boolean]
    close: []
  }>()

  const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
  })

  const submitLoading = vueRef(false)

  const defaultValues: ModuleForm = {
    name: '',
    type: '产品',
    parentId: 0,
    statusEnabled: true,
    description: '',
  }

  const rules: FormRules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择模块类型', trigger: 'change' }],
    parentId: [
      {
        required: true,
        message: '请选择上级菜单',
        trigger: 'change',
        validator: (_rule: unknown, value: unknown, callback: (error?: Error) => void) => {
          if (form.type !== '产品' && !value) {
            callback(new Error('请选择上级菜单'))
          } else {
            callback()
          }
        },
      },
    ],
    statusEnabled: [{ required: true, message: '请选择状态', trigger: 'change' }],
  }

  const { form, formRef, resetForm, validateForm, setFormValue } = useForm<ModuleForm>(defaultValues, rules)

  const functionSettingsList = vueRef<FunctionSetting[]>(
    Array.from({ length: 16 }, (_, index) => ({
      id: index + 1,
      name: `功能名称${index + 1}`,
      checked: false,
      enabled: false,
    }))
  )

  const resetFunctionSettings = () => {
    functionSettingsList.value.forEach((f) => {
      f.checked = false
      f.enabled = false
    })
  }

  const handleFunctionToggle = () => {
  }

  const handleTypeChange = () => {
    if (form.type === '产品') {
      form.parentId = 0
    }
    formRef.value?.clearValidate()
  }

  const handleSubmit = async () => {
    try {
      const isValid = await validateForm()
      if (!isValid) return

      submitLoading.value = true

      const module: ProductModule = {
        id: props.module?.id || Date.now(),
        name: form.name,
        type: form.type,
        parentId: form.parentId,
        status: form.statusEnabled ? '启用' : '停用',
        description: form.description,
        children: props.module?.children || [],
      }

      emit('submit', module, props.isEditMode)
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
    resetFunctionSettings()
    emit('close')
  }

  watch(
    () => props.module,
    (newModule) => {
      if (newModule) {
        setFormValue({
          name: newModule.name,
          type: newModule.type,
          statusEnabled: newModule.status === '启用',
          description: newModule.description || '',
        })
        if (newModule.type === '版本' || newModule.type === '模块') {
          form.parentId = newModule.parentId || 0
        }
      } else {
        resetForm()
        resetFunctionSettings()
      }
    },
    { immediate: true }
  )
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
      white-space: nowrap;
    }
  }

  .divider {
    flex: 1;
    height: 1px;
    background-color: #ebeef5;
  }

  .module-form {
    padding: 8px 0;

    :deep(.el-radio-group) {
      display: inline-flex;

      .el-radio-button {
        .el-radio-button__inner {
          padding: 8px 20px;

          &.is-active {
            background-color: #409eff;
            border-color: #409eff;
            color: #fff;
          }
        }
      }
    }

    :deep(.el-radio-button) {
      .el-radio-button__inner {
        padding: 8px 20px;

        &.is-active {
          background-color: #409eff;
          border-color: #409eff;
          color: #fff;
        }
      }
    }
  }

  .function-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 8px 0;
  }

  .function-item {
    display: flex;
    align-items: center;

    :deep(.el-checkbox) {
      .el-checkbox__label {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
    }

    .function-name {
      font-size: 13px;
      color: #606266;
      margin-right: 4px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  @media (max-width: 992px) {
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