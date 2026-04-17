<template>
  <Dialog v-model="dialogVisible" :title="isEditMode ? '编辑模块' : '新增模块'" width="600px" :close-on-click-modal="false" @close="handleClose">
    <div class="modal-header">
      <span class="modal-header-title">基本设置</span>
      <div class="divider" />
    </div>

    <el-form ref="moduleFormRef" :model="moduleForm" :rules="moduleFormRules" label-width="110px" label-position="right" class="module-form">
      <!-- Module Type Tabs -->
      <el-form-item label="*模块类型:" prop="type">
        <el-radio-group v-model="moduleForm.type" @change="handleTypeChange">
          <el-radio-button label="产品" value="产品" />
          <el-radio-button label="版本" value="版本" />
          <el-radio-button label="模块" value="模块" />
        </el-radio-group>
      </el-form-item>

      <!-- Product Name (shown when type is '产品') -->
      <el-form-item label="*产品名称:" prop="name" v-if="moduleForm.type === '产品'">
        <el-input v-model="moduleForm.name" placeholder="请输入菜单名称" />
      </el-form-item>

      <!-- Version Name (shown when type is '版本') -->
      <el-form-item label="*版本名称:" prop="name" v-if="moduleForm.type === '版本'">
        <el-input v-model="moduleForm.name" placeholder="请输入版本名称" />
      </el-form-item>

      <!-- Parent Menu (shown when type is '版本' or '模块') -->
      <el-form-item label="*上级菜单:" prop="parentId" v-if="moduleForm.type !== '产品'">
        <el-select v-model="moduleForm.parentId" placeholder="请选择上级菜单" filterable style="width: 100%">
          <el-option v-for="option in parentMenuOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </el-form-item>

      <!-- Function Settings (shown when type is '模块') -->
      <el-form-item label="*功能设置:" prop="functionSettings" v-if="moduleForm.type === '模块'">
        <div class="function-grid">
          <div v-for="func in functionSettingsList" :key="func.id" class="function-item">
            <el-checkbox v-model="func.checked" @change="handleFunctionToggle">
              <span class="function-name">功能名称</span>
              <el-switch v-model="func.enabled" size="small" :width="24" @click.stop @change="handleFunctionToggle" />
            </el-checkbox>
          </div>
        </div>
      </el-form-item>

      <!-- Status (Product type uses switch, Version/Module use toggle buttons) -->
      <el-form-item label="*状态:" prop="status" v-if="moduleForm.type === '产品'">
        <el-switch v-model="moduleForm.statusEnabled" active-text="启用" inactive-text="停用" inline-prompt />
      </el-form-item>
      <el-form-item label="*状态:" prop="status" v-else>
        <el-radio-group v-model="moduleForm.statusEnabled">
          <el-radio-button :label="true">启用</el-radio-button>
          <el-radio-button :label="false">停用</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <!-- Description -->
      <el-form-item label="说明:">
        <el-input v-model="moduleForm.description" type="textarea" :rows="4" placeholder="请输入说明" resize="none" />
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
import type { ProductModule } from '@/types/index'

interface FunctionSetting {
  id: number
  name: string
  checked: boolean
  enabled: boolean
}

const props = defineProps<{
  modelValue: boolean
  isEditMode: boolean
  module: ProductModule | null
  parentMenuOptions: Array<{ label: string; value: number }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [module: ProductModule, isEdit: boolean]
  'close': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const moduleFormRef = ref<FormInstance>()
const submitLoading = ref(false)

const moduleForm = reactive({
  name: '',
  type: '产品' as ProductModule['type'],
  parentId: 0,
  statusEnabled: true,
  description: ''
})

const moduleFormRules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择模块类型', trigger: 'change' }],
  parentId: [
    {
      required: true,
      message: '请选择上级菜单',
      trigger: 'change',
      validator: (_rule: unknown, value: unknown, callback: (error?: Error) => void) => {
        if (moduleForm.type !== '产品' && !value) {
          callback(new Error('请选择上级菜单'))
        } else {
          callback()
        }
      }
    }
  ],
  statusEnabled: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const functionSettingsList = ref<FunctionSetting[]>(
  Array.from({ length: 16 }, (_, index) => ({
    id: index + 1,
    name: `功能名称${index + 1}`,
    checked: false,
    enabled: false
  }))
)

const handleFunctionToggle = () => {
  // Sync checked and enabled states
}

const resetModuleForm = () => {
  moduleForm.name = ''
  moduleForm.type = '产品'
  moduleForm.parentId = 0
  moduleForm.statusEnabled = true
  moduleForm.description = ''
  functionSettingsList.value.forEach(f => {
    f.checked = false
    f.enabled = false
  })
  moduleFormRef.value?.clearValidate()
}

const handleTypeChange = () => {
  // Reset parent selection when type changes
  if (moduleForm.type === '产品') {
    moduleForm.parentId = 0
  }
  moduleFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!moduleFormRef.value) return
  try {
    await moduleFormRef.value.validate()
    submitLoading.value = true

    const module: ProductModule = {
      id: props.module?.id || Date.now(),
      name: moduleForm.name,
      type: moduleForm.type,
      parentId: moduleForm.parentId,
      status: moduleForm.statusEnabled ? '启用' : '停用',
      description: moduleForm.description,
      children: props.module?.children || []
    }

    emit('submit', module, props.isEditMode)
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
  resetModuleForm()
  emit('close')
}

// Watch for module changes to update form
watch(() => props.module, (newModule) => {
  if (newModule) {
    moduleForm.name = newModule.name
    moduleForm.type = newModule.type
    moduleForm.statusEnabled = newModule.status === '启用'
    moduleForm.description = newModule.description || ''

    // For version/module, set parent id
    if (newModule.type === '版本' || newModule.type === '模块') {
      moduleForm.parentId = newModule.parentId || 0
    }
  } else {
    resetModuleForm()
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

.module-form {
  padding: 8px 0;

  // Type tabs as radio buttons
  :deep(.el-radio-group) {
    display: inline-flex;

    .el-radio-button {
      .el-radio-button__inner {
        padding: 8px 20px;
        border-radius: 4px;

        &.is-active {
          background-color: #409eff;
          border-color: #409eff;
          color: #fff;
        }
      }
    }
  }

  // Radio button for status (version/module types)
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

// ─── Function Grid ───────────────────────────────────────────────────

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

// ─── Responsive ──────────────────────────────────────────────────────

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