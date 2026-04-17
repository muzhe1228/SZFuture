<template>
  <div class="data-table">
    <!-- Table Header -->
    <div class="table-header">
      <div class="table-title">
        <h3>{{ title }}</h3>

        <span v-if="total" class="total-count">{{ total }}</span>
      </div>
      <div class="table-actions">
        <slot name="extra-actions"></slot>
        <el-button v-if="showColumnSettings" type="primary" size="small" @click="handleColumnSettings">
          <el-icon>
            <Setting />
          </el-icon>
          列配置
        </el-button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="table-container">
      <el-table :data="data" border stripe highlight-current-row style="width: 100%; height: 100%" v-loading="loading"
        @selection-change="handleSelectionChange" :row-key="rowKey" :tree-props="treeProps">
        <el-table-column v-if="showSelection" type="selection" width="50" fixed="left" />

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
import { Setting } from '@element-plus/icons-vue'
import type { DataTableProps, DataTableEmits } from './types'

const props = withDefaults(defineProps<DataTableProps>(), {
  loading: false,
  total: 0,
  currentPage: 1,
  pageSize: 20,
  pageSizes: () => [10, 20, 50, 100],
  title: '',
  storageKey: 'data-table-columns',
  showColumnSettings: true,
  showSelection: true,
  rowKey: 'id',
  actions: () => [],
  treeProps: undefined,
  defaultExpandAll: false
})

const emit = defineEmits<DataTableEmits>()

const drawerVisible = ref(false)

const currentPageModel = computed({
  get: () => props.currentPage,
  set: (val) => emit('page-change', val, props.pageSize)
})

const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (val) => emit('page-change', props.currentPage, val)
})

const visibleColumns = computed(() => {
  return props.columns.filter(col => col.visible !== false)
})

const visibleActions = computed(() => {
  return props.actions || []
})

const actionsWidth = computed(() => {
  const count = visibleActions.value.length
  return Math.max(120, count * 80)
})

const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
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
      props.columns.forEach(col => {
        if (parsed[col.key] !== undefined) {
          col.visible = parsed[col.key]
        }
      })
    } catch (e) {
      console.error('Failed to load column visibility:', e)
    }
  }
}

const saveColumnVisibility = () => {
  if (!props.storageKey) return
  const visibility = props.columns.reduce((acc, col) => {
    acc[col.key] = col.visible ?? true
    return acc
  }, {} as Record<string, boolean>)
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
  background-color: #fff;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;

  .table-title {
    display: flex;
    align-items: center;
    gap: 12px;

    h3 {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      margin: 0;
    }

    .total-count {
      font-size: 14px;
      color: #909399;
    }
  }

  .table-actions {
    display: flex;
    gap: 8px;
  }
}

.table-container {
  flex: 1;
  padding: 0 16px;
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

:deep(.el-table) {
  .el-table__header th {
    background-color: #fafafa;
    color: #303133;
    font-weight: 500;
    font-size: 14px;
  }

  .el-table__body td {
    font-size: 13px;
    color: #606266;
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