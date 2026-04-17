<template>
  <el-form
    ref="formRef"
    :model="formData"
    :inline="inline"
    :label-width="labelWidth"
    class="search-form"
    @submit.prevent="handleSearch"
    @reset.prevent="handleReset"
    @keyup.enter="handleSearch"
  >
    <template v-for="field in visibleFields" :key="field.prop">
      <el-form-item :label="field.label" :prop="field.prop">
        <!-- Input -->
        <el-input
          v-if="field.type === 'input'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请输入${field.label}`"
          :clearable="field.clearable !== false"
          :style="{ width: field.width || '200px' }"
        />

        <!-- Select -->
        <el-select
          v-else-if="field.type === 'select'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          :multiple="field.multiple"
          :loading="loadingOptions[field.prop]"
          :style="{ width: field.width || '200px' }"
        >
          <el-option
            v-for="opt in fieldOptions[field.prop]"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>

        <!-- Date -->
        <el-date-picker
          v-else-if="field.type === 'date'"
          v-model="formData[field.prop]"
          type="date"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          value-format="YYYY-MM-DD"
          :style="{ width: field.width || '200px' }"
        />

        <!-- Date Range -->
        <el-date-picker
          v-else-if="field.type === 'daterange'"
          v-model="formData[field.prop]"
          type="daterange"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :style="{ width: field.width || '320px' }"
        />

        <!-- DateTime -->
        <el-date-picker
          v-else-if="field.type === 'datetime'"
          v-model="formData[field.prop]"
          type="datetime"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          value-format="YYYY-MM-DD HH:mm:ss"
          :style="{ width: field.width || '200px' }"
        />

        <!-- DateTime Range -->
        <el-date-picker
          v-else-if="field.type === 'datetimerange'"
          v-model="formData[field.prop]"
          type="datetimerange"
          :placeholder="field.placeholder || `请选择${field.label}`"
          :clearable="field.clearable !== false"
          value-format="YYYY-MM-DD HH:mm:ss"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          :style="{ width: field.width || '320px' }"
        />

        <!-- Number -->
        <el-input-number
          v-else-if="field.type === 'number'"
          v-model="formData[field.prop]"
          :placeholder="field.placeholder"
          :clearable="field.clearable"
          :min="field.min"
          :max="field.max"
          :style="{ width: field.width || '200px' }"
        />

        <!-- Custom slot -->
        <slot
          v-else-if="field.type === 'custom'"
          :name="field.prop"
          :field="field"
          :form-data="formData"
        />
      </el-form-item>
    </template>

    <el-form-item class="search-form-actions">
      <el-button
        type="primary"
        :icon="Search"
        :loading="searchLoading"
        :disabled="searchLoading"
        @click="handleSearch"
        v-if="showSearch"
      >
        查询
      </el-button>
      <el-button
        :icon="Refresh"
        :loading="resetLoading"
        :disabled="resetLoading"
        @click="handleReset"
        v-if="showReset"
      >
        重置
      </el-button>
      <el-button
        :icon="Setting"
        @click="drawerVisible = true"
        v-if="showColumnSettings"
      >
        列设置
      </el-button>
    </el-form-item>

    <!-- Column Settings Drawer -->
    <el-drawer
      v-model="drawerVisible"
      title="列设置"
      direction="rtl"
      size="320px"
    >
      <div class="column-settings">
        <el-switch
          v-for="field in fields"
          :key="field.prop"
          v-model="fieldVisibility[field.prop]"
          :disabled="field.hidden"
          :active-text="field.label"
          class="column-toggle"
          @change="handleColumnChange"
        />
      </div>
      <template #footer>
        <el-button @click="drawerVisible = false">关闭</el-button>
      </template>
    </el-drawer>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { Search, Refresh, Setting } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import type { SearchField, SearchFieldOption } from './SearchForm/types'

interface Props {
  fields: SearchField[]
  storageKey?: string
  showColumnSettings?: boolean
  showReset?: boolean
  showSearch?: boolean
  labelWidth?: string
  inline?: boolean
  defaultValues?: Record<string, any>
  searchLoading?: boolean
  resetLoading?: boolean
  debounce?: number
}

const props = withDefaults(defineProps<Props>(), {
  storageKey: 'search-form-columns',
  showColumnSettings: true,
  showReset: true,
  showSearch: true,
  labelWidth: 'auto',
  inline: true,
  defaultValues: () => ({}),
  searchLoading: false,
  resetLoading: false,
  debounce: 300
})

const emit = defineEmits<{
  search: [formData: Record<string, any>]
  reset: []
  'column-settings': [visibleFields: string[]]
}>()

const formRef = ref<FormInstance>()
const drawerVisible = ref(false)
const fieldOptions = ref<Record<string, SearchFieldOption[]>>({})
const loadingOptions = ref<Record<string, boolean>>({})
const fieldVisibility = reactive<Record<string, boolean>>({})

const formData = reactive<Record<string, any>>({})

let searchTimer: ReturnType<typeof setTimeout> | null = null

const visibleFields = computed(() => {
  return props.fields.filter(field => fieldVisibility[field.prop] !== false)
})

// Initialize form data and field visibility
onMounted(async () => {
  // Initialize form data with default values
  props.fields.forEach(field => {
    formData[field.prop] = props.defaultValues?.[field.prop] ?? ''
  })

  // Load column visibility from localStorage
  loadColumnVisibility()

  // Load async options for select fields
  await loadAsyncOptions()
})

// Cancel debounce timer on component unmount
onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
    searchTimer = null
  }
})

// Load async options for select fields
async function loadAsyncOptions() {
  for (const field of props.fields) {
    if (field.type === 'select' && field.loadOptions) {
      loadingOptions.value[field.prop] = true
      try {
        const options = await field.loadOptions()
        fieldOptions.value[field.prop] = options
      } catch (error) {
        console.error(`Failed to load options for ${field.prop}:`, error)
        fieldOptions.value[field.prop] = []
      } finally {
        loadingOptions.value[field.prop] = false
      }
    } else if (field.type === 'select' && field.options) {
      fieldOptions.value[field.prop] = field.options
    }
  }
}

// Load column visibility from localStorage
function loadColumnVisibility() {
  // Initialize all fields as visible (unless hidden in config)
  props.fields.forEach(field => {
    fieldVisibility[field.prop] = !field.hidden
  })

  if (!props.storageKey) return

  try {
    const stored = localStorage.getItem(props.storageKey)
    if (stored) {
      const config = JSON.parse(stored)
      props.fields.forEach(field => {
        if (field.prop in config && !field.hidden) {
          fieldVisibility[field.prop] = config[field.prop]
        }
      })
    }
  } catch (error) {
    console.error('Failed to load column config from localStorage:', error)
  }

  emitVisibleFields()
}

// Save column visibility to localStorage
function saveColumnVisibility() {
  if (!props.storageKey) return

  try {
    localStorage.setItem(props.storageKey, JSON.stringify(fieldVisibility))
  } catch (error) {
    console.error('Failed to save column config to localStorage:', error)
  }

  emitVisibleFields()
}

// Emit visible fields list
function emitVisibleFields() {
  const visible = props.fields
    .filter(field => fieldVisibility[field.prop] !== false)
    .map(field => field.prop)
  emit('column-settings', visible)
}

// Handle column toggle change
function handleColumnChange() {
  saveColumnVisibility()
}

// Handle search with debounce
function handleSearch() {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    emit('search', { ...formData })
  }, props.debounce)
}

// Handle reset
function handleReset() {
  props.fields.forEach(field => {
    formData[field.prop] = props.defaultValues?.[field.prop] ?? ''
  })
  formRef.value?.resetFields()
  emit('reset')
}

// Watch for fields prop changes to reload options
watch(
  () => props.fields,
  async () => {
    // Reinitialize form data
    props.fields.forEach(field => {
      if (!(field.prop in formData)) {
        formData[field.prop] = props.defaultValues?.[field.prop] ?? ''
      }
    })
    await loadAsyncOptions()
  },
  { deep: true }
)

// Expose formRef for parent component access
defineExpose({
  formRef,
  formData
})
</script>

<style lang="scss" scoped>
.search-form {
  background: #fff;
  padding: 18px 18px 0;
  margin-bottom: 16px;
  border-radius: 4px;

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }

  :deep(.el-input__wrapper) {
    border-radius: 4px;
  }

  :deep(.el-select .el-input__wrapper) {
    border-radius: 4px;
  }
}

.search-form-actions {
  margin-left: auto;
  padding-left: 16px;

  :deep(.el-form-item__content) {
    justify-content: flex-end;
  }
}

.column-settings {
  padding: 16px;

  .column-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    :deep(.el-switch__label) {
      font-size: 14px;
      color: #333;
    }
  }
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

:deep(.el-drawer__footer) {
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
