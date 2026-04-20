<template>
  <div class="base-table-page">
    <!-- Search Bar -->
    <SearchForm
      v-if="searchFields.length > 0"
      :fields="searchFields"
      :storage-key="storageKey ? `${storageKey}-search` : undefined"
      :search-loading="loading"
      :reset-loading="loading"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- Data Table -->
    <DataTable
      :columns="columns"
      :data="data"
      :loading="loading"
      :total="pagination.total"
      :current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      :page-sizes="pageSizes"
      :title="title"
      :storage-key="storageKey ? `${storageKey}-table` : undefined"
      :show-column-settings="showColumnSettings"
      :show-selection="showSelection"
      :actions="actions"
      :row-key="rowKey"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
      @action="handleAction"
    >
      <template #extra-actions>
        <slot name="extra-actions"></slot>
      </template>
      <template #cell="{ row, column }">
        <slot :name="`cell-${column.key}`" v-if="column.hasTemplate" v-bind="{ row, column }"></slot>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import SearchForm from '../SearchForm.vue'
import { DataTable } from '../DataTable'
import type { ColumnConfig, ActionButton } from '../DataTable/types'
import type { SearchField } from '../SearchForm/types'

// Props
const props = defineProps<{
  // 搜索字段配置
  searchFields: SearchField[]
  // 表格列配置
  columns: ColumnConfig[]
  // 表格操作配置
  actions: ActionButton[]
  // 数据获取方法
  fetchData: (params?: Record<string, any>, page?: number, pageSize?: number) => Promise<{ list: any[]; total: number }>
  // 标题
  title: string
  // 存储键
  storageKey?: string
  // 是否显示列设置
  showColumnSettings?: boolean
  // 是否显示选择框
  showSelection?: boolean
  // 行键
  rowKey?: string
  // 分页大小选项
  pageSizes?: number[]
}>()

// Emits
const emit = defineEmits<{
  // 操作事件
  (e: 'action', action: string, row: any): void
  // 选择变化事件
  (e: 'selection-change', selection: any[]): void
  // 搜索事件
  (e: 'search', formData: Record<string, any>): void
  // 重置事件
  (e: 'reset'): void
  // 分页变化事件
  (e: 'page-change', page: number, size: number): void
}>()

// Reactive data
const loading = ref(false)
const data = ref<any[]>([])
const selectedRows = ref<any[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// Defaults
const pageSizes = props.pageSizes || [10, 20, 50, 100]
const rowKey = props.rowKey || 'id'
const showColumnSettings = props.showColumnSettings !== false
const showSelection = props.showSelection || false

// Methods
const handleSearch = async (formData: Record<string, any>) => {
  pagination.currentPage = 1
  await loadData(formData)
  emit('search', formData)
}

const handleReset = async () => {
  pagination.currentPage = 1
  await loadData()
  emit('reset')
}

const handlePageChange = (page: number, size: number) => {
  pagination.currentPage = page
  pagination.pageSize = size
  loadData()
  emit('page-change', page, size)
}

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

const handleAction = (action: string, row: any) => {
  emit('action', action, row)
}

const loadData = async (formData?: Record<string, any>) => {
  loading.value = true
  try {
    const result = await props.fetchData(formData, pagination.currentPage, pagination.pageSize)
    data.value = result.list
    pagination.total = result.total
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
const init = async () => {
  await loadData()
}

init()
</script>

<style lang="scss" scoped>
.base-table-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}
</style>