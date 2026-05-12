<template>
  <div class="data-table">
    <!-- Table Header -->
    <div class="table-header">
      <div class="table-actions">
        <slot name="extra-actions"></slot>
      </div>
      <div class="table-actions">
        <slot name="extra-actions-right"></slot>
        <el-button v-if="!hideExport" type="primary" link :loading="exportLoading" :disabled="exportLoading"
          icon="Download" @click="handleExport">
          导出
        </el-button>
        <el-button v-if="!hideColumnSettings" link icon="Tools" @click="handleColumnSettings">
          列配置
        </el-button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <!-- border
      stripe
      highlight-current-row -->
      <el-table :data="data" style="width: 100%; height: 100%" v-loading="loading"
        @selection-change="handleSelectionChange" :row-key="rowKey" :tree-props="treeProps"
        :row-class-name="rowClassName">
        <el-table-column v-if="!hideSelection" type="selection" width="50" fixed="left" align="center"
          :header-align="'center'" />

        <el-table-column v-for="col in visibleColumns" :key="col.key" :prop="col.prop" :label="col.label"
          :width="col.width" :min-width="col.minWidth" :align="col.align" :sortable="col.sortable"
          :show-overflow-tooltip="col.showOverflowTooltip">
          <template #default="{ row }" v-if="col.hasTemplate">
            <slot :name="`cell-${col.key}`" :row="row"></slot>
          </template>
        </el-table-column>

        <el-table-column v-if="actions && actions.length > 0" label="操作" :width="actionsWidth" fixed="right">
          <template #default="{ row }">
            <template v-for="action in visibleActions" :key="action.key">
              <el-button v-if="!action.condition || action.condition(row)" :type="action.type || 'primary'"
                :link="action.link !== false" size="small" @click="handleAction(action.key, row)">
                {{ action.label }}
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Pagination -->
    <div class="pagination-container">
      <el-pagination v-model:current-page="currentPageModel" v-model:page-size="pageSizeModel" :page-sizes="pageSizes"
        :total="total" layout="total, sizes, prev, pager, next, jumper" background @size-change="handleSizeChange"
        @current-change="handleCurrentChange" />
    </div>

    <!-- Column Settings Drawer -->
    <el-drawer v-model="drawerVisible" title="列设置" direction="rtl" size="320px">
      <div class="column-settings">
        <el-switch v-for="col in columns" :key="col.key" v-model="col.visible" :active-text="col.label"
          class="column-toggle" @change="handleColumnChange" />
      </div>
      <template #footer>
        <el-button @click="drawerVisible = false">关闭</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { DataTableProps, DataTableEmits } from './types'
import { logger } from '@/utils/logger'

const props = withDefaults(defineProps<DataTableProps>(), {
  loading: false,
  total: 0,
  currentPage: 1,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100],
  title: '',
  storageKey: 'data-table-columns',
  hideColumnSettings: false,
  hideSelection: true,
  hideExport: true,
  rowKey: 'id',
  actions: () => [],
  treeProps: undefined,
  defaultExpandAll: false,
})


const emit = defineEmits<DataTableEmits>()

const drawerVisible = ref(false)
const selectedRowKeys = ref<Set<any>>(new Set())
const exportLoading = ref(false)

const currentPageModel = computed({
  get: () => props.currentPage,
  set: (val) => emit('page-change', val, props.pageSize),
})

const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (val) => emit('page-change', props.currentPage, val),
})

const visibleColumns = computed(() => {
  return props.columns.filter((col) => col.visible !== false)
})

const visibleActions = computed(() => {
  return props.actions || []
})

const actionsWidth = computed(() => {
  const count = visibleActions.value.length > 4 ? 4 : visibleActions.value.length
  return Math.max(80, count * 50)
})

const rowClassName = ({ row }: { row: any }) => {
  const rowKey = props.rowKey || 'id'
  if (selectedRowKeys.value.has(row[rowKey])) {
    return 'table-row-selected'
  }
  return ''
}

const handleSelectionChange = (selection: any[]) => {
  selectedRowKeys.value.clear()
  selection.forEach((item: any) => {
    const rowKey = props.rowKey || 'id'
    selectedRowKeys.value.add(item[rowKey])
  })
  emit('selection-change', selection)
}

const handleExport = async () => {
  exportLoading.value = true
  try {
    await emit('export')
  } finally {
    exportLoading.value = false
  }
}

const handleSizeChange = (size: number) => {
  emit('page-change', props.currentPage, size)
}

const handleCurrentChange = (page: number) => {
  emit('page-change', page, props.pageSize)
}

const handleColumnSettings = () => {
  drawerVisible.value = true
  emit('column-settings')
}

const handleColumnChange = () => {
  saveColumnVisibility()
}

const handleAction = (action: string, row: any) => {
  emit('action', action, row)
}

const loadColumnVisibility = () => {
  if (!props.storageKey) return
  const saved = localStorage.getItem(`${props.storageKey}-visibility`)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      props.columns.forEach((col) => {
        if (parsed[col.key] !== undefined) {
          col.visible = parsed[col.key]
        }
      })
    } catch (e) {
      logger.error('Failed to load column visibility:', e)
    }
  }
}

const saveColumnVisibility = () => {
  if (!props.storageKey) return
  const visibility = props.columns.reduce(
    (acc, col) => {
      acc[col.key] = col.visible ?? true
      return acc
    },
    {} as Record<string, boolean>
  )
  localStorage.setItem(`${props.storageKey}-visibility`, JSON.stringify(visibility))
}

onMounted(() => {
  loadColumnVisibility()
})
</script>

<style lang="scss" scoped>
.data-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
  background-color: var(--el-card-bg-color);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  height: 64px;

  .table-title {
    display: flex;
    align-items: center;
    gap: 12px;

    h3 {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin: 0;
    }

    .total-count {
      font-size: 14px;
      color: var(--el-text-color-secondary);
    }
  }

  .table-actions {
    display: flex;
    gap: 8px;
  }
}

.table-container {
  flex: 1;

  :deep(.table_1_column_1) {
    text-align: center;
  }

  :deep(.el-table__header th.el-table__cell:first-child),
  :deep(.el-table__header .el-checkbox) {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :deep(.el-table .el-checkbox__input) {
    width: 18px !important;
    height: 18px !important;

    .el-checkbox__inner {
      border-radius: 5px;
      border: 1px solid var(--el-text-color-secondary);
    }

    &.is-indeterminate .el-checkbox__inner {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);

      &::before {
        content: "";
        position: absolute;
        display: block;
        background-color: var(--el-checkbox-checked-icon-color);
        height: 2px;
        transform: scale(0.5);
        left: 0;
        right: 0;
        top: 5px;
      }
    }

    &.is-checked .el-checkbox__inner {
      background-color: transparent;
      border-color: var(--el-color-primary);

    }

    &.is-checked .el-checkbox__inner::after {
      transform: scaleY(1);
      border-color: var(--el-checkbox-checked-icon-color);
    }

    .el-checkbox__inner::after {
      box-sizing: content-box;
      content: "";
      width: 20px;
      height: 20px;
      position: absolute;
      left: -3px;
      top: -7px;
      border: none;
      background-image: url('@/assets/check.png');
      background-size: 100% 100%;
      background-position: center;
      transform: none;
      transform-origin: center;
      transform: scaleY(0);
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;

}

.column-settings {
  padding: 16px 0;

  .column-toggle {
    margin-bottom: 16px;
    display: block;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
