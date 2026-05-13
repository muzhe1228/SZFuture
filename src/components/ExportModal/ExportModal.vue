<template>
  <el-dialog
    v-model="localVisible"
    title="导出数据"
    width="640px"
    :before-close="handleClose"
  >
    <div class="export-modal">
      <div class="field-section">
        <span class="section-title">选择导出字段</span>
        <el-checkbox
          :indeterminate="isIndeterminate"
          v-model="checkAll"
        >
          全选
        </el-checkbox>
        <el-checkbox-group
          v-model="selectedFields"
          class="field-list"
        >
          <el-checkbox
            v-for="field in fields"
            :key="field.key"
            :value="field.key"
          >
            {{ field.label }}
          </el-checkbox>
        </el-checkbox-group>
      </div>

      <div class="format-section">
        <span class="section-title">导出格式</span>
        <el-radio-group v-model="exportFormat">
          <el-radio value="xlsx">Excel (.xlsx)</el-radio>
          <el-radio value="csv">CSV (.csv)</el-radio>
        </el-radio-group>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleExport" :loading="exportLoading">
        导出
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface ExportField {
  key: string
  label: string
}

const props = defineProps<{
  modelValue: boolean
  fields: ExportField[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'export', params: { fields: string[]; format: string }): void
}>()
const localVisible = ref(props.modelValue)
const selectedFields = ref<string[]>([])
const exportFormat = ref('xlsx')
const exportLoading = ref(false)

watch(() => props.modelValue, (val) => {
  localVisible.value = val
  if (val) {
    selectedFields.value = props.fields.map(f => f.key)
  }
})

const checkAll = computed({
  get: () => {
    return props.fields.length > 0 && selectedFields.value.length === props.fields.length
  },
  set: (val) => {
    selectedFields.value = val ? props.fields.map(f => f.key) : []
  }
})

const isIndeterminate = computed(() => {
  return selectedFields.value.length > 0 && selectedFields.value.length < props.fields.length
})

const handleClose = () => {
  localVisible.value = false
  emit('update:modelValue', false)
}

const handleExport = async () => {
  if (selectedFields.value.length === 0) {
    return
  }
  exportLoading.value = true
  try {
    emit('export', {
      fields: selectedFields.value,
      format: exportFormat.value
    })
  } finally {
    exportLoading.value = false
    localVisible.value = false
    emit('update:modelValue', false)
  }
}
</script>

<style lang="scss" scoped>
.export-modal {
  .field-section,
  .format-section {
    margin-bottom: 20px;
  }

  .section-title {
    display: block;
    margin-bottom: 12px;
    font-weight: 500;
    color: #303133;
  }

  .field-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
  }
}
</style>