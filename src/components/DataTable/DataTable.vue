<template>
  <div class="data-table">
    <!-- Table Header -->
    <div class="table-header">
      <div class="table-actions">
        <slot name="extra-actions"></slot>
      </div>
      <div class="table-actions">
        <slot name="extra-actions-right"></slot>
        <el-button v-if="!hideColumnSettings" link icon="Tools" @click="handleColumnSettings">
          列配置
        </el-button>
        <el-button v-if="!hideExport" type="primary" link :loading="exportLoading" :disabled="exportLoading"
          icon="Download" @click="openExportModal">
          导出
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
                :link="action.link !== false" size="small" @click="handleAction(action.key, row)"
                @mouseenter="action.icon && loadIcon(action.icon)">
                <el-tooltip :content="action.label" placement="top">
                  <img :src="iconMap[action.icon as IconType]" alt="icon" :class="['icon', action.icon]" />
                </el-tooltip>
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
    <el-drawer v-model="drawerVisible" title="列设置" direction="rtl" size="400px">
      <div class="column-settings">
        <div class="column-settings-header">
          <span class="col-name">列表</span>
          <span class="col-show">显示</span>
          <span class="col-sort">排序</span>
        </div>
        <draggable v-model="localColumns" item-key="key" handle=".drag-handle" ghost-class="ghost" @end="handleDragEnd"
          class="column-settings-body">
          <template #item="{ element: col }">
            <div class="column-item">
              <span class="col-name">{{ col.label }}</span>
              <span class="col-show">
                <el-switch v-model="col.visible" @change="handleColumnChange" />
              </span>
              <span class="col-sort drag-handle">
                <el-icon :size="16">
                  <Rank />
                </el-icon>
              </span>
            </div>
          </template>
        </draggable>
      </div>
      <template #footer>
        <el-button @click="handleResetAll">默认设置</el-button>
        <el-button @click="drawerVisible = false">关闭</el-button>
      </template>
    </el-drawer>

    <!-- Export Modal -->
    <ExportModal v-model="exportModalVisible" :fields="exportFields" @export="handleExportWithFields" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { Rank } from '@element-plus/icons-vue'
import type { DataTableProps, DataTableEmits, IconType } from './types'
import { logger } from '@/utils/logger'
import draggable from 'vuedraggable'
import ExportModal from '../ExportModal'

const iconCache = ref<Record<string, string>>({})
const iconLoading = ref<Set<string>>(new Set())

// 加载图标
const getIcon = async (iconName: string): Promise<string> => {
  if (iconCache.value[iconName]) {
    return iconCache.value[iconName]
  }

  // 如果图标正在加载中，等待加载完成
  if (iconLoading.value.has(iconName)) {
    await new Promise(resolve => {
      const check = () => {
        if (!iconLoading.value.has(iconName)) {
          resolve(undefined)
        } else {
          setTimeout(check, 50)
        }
      }
      check()
    })
    return iconCache.value[iconName] || ''
  }

  iconLoading.value.add(iconName)

  try {
    const iconModules: Record<string, () => Promise<{ default: string }>> = {
      IconActive: () => import('@/assets/icons/iconActive.png'),
      IconShow: () => import('@/assets/icons/iconShow.png'),
      IconDel: () => import('@/assets/icons/iconDel.png'),
      IconDownload: () => import('@/assets/icons/iconDownload.png'),
      IconApproval: () => import('@/assets/icons/iconApproval.png'),
      IconCopy: () => import('@/assets/icons/iconCopy.png'),
      IconDelay: () => import('@/assets/icons/iconDelay.png'),
      IconEdit: () => import('@/assets/icons/iconEdit.png'),
      IconFreeze: () => import('@/assets/icons/iconFreeze.png'),
      IconRefresh: () => import('@/assets/icons/iconRefresh.png'),
      IconUpload: () => import('@/assets/icons/iconUpload.png'),
      IconVoid: () => import('@/assets/icons/iconVoid.png'),
    }

    const loader = iconModules[iconName]
    if (loader) {
      const module = await loader()
      iconCache.value[iconName] = module.default
    }
  } catch (e) {
    logger.error(`Failed to load icon: ${iconName}`, e)
  } finally {
    iconLoading.value.delete(iconName)
  }

  return iconCache.value[iconName] || ''
}

const iconMap = reactive<Record<string, string>>({})

const loadIcon = async (iconName: string) => {
  if (!iconMap[iconName]) {
    iconMap[iconName] = await getIcon(iconName)
  }
}

// 定义组件属性
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
  hideExport: false,
  rowKey: 'id',
  actions: () => [],
  treeProps: undefined,
  defaultExpandAll: false,
})


const emit = defineEmits<DataTableEmits>()
const drawerVisible = ref(false)
const selectedRowKeys = ref<Set<any>>(new Set())
const exportLoading = ref(false)
const exportModalVisible = ref(false)
const localColumns = ref([...props.columns])

// 计算当前页码
const currentPageModel = computed({
  get: () => props.currentPage,
  set: (val) => emit('page-change', val, props.pageSize),
})

// 计算每页显示数量
const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (val) => emit('page-change', props.currentPage, val),
})

// 计算可见列
const visibleColumns = computed(() => {
  return localColumns.value.filter((col) => col.visible !== false)
})

// 计算可见操作列
const visibleActions = computed(() => {
  return props.actions || []
})

// 计算导出字段
const exportFields = computed(() => {
  return visibleColumns.value
    .filter(col => col.key !== 'actions' && col.key !== 'selection')
    .map(col => ({
      key: col.prop || col.key,
      label: col.label
    }))
})

// 计算操作列宽度
const actionsWidth = computed(() => {
  // const count = visibleActions.value.length > 4 ? 4 : visibleActions.value.length
  const count = visibleActions.value.length > 4 ? 4 : visibleActions.value.length
  return Math.max(80, count * 50)
})

// 处理行点击事件
const rowClassName = ({ row }: { row: any }) => {
  const rowKey = props.rowKey || 'id'
  if (selectedRowKeys.value.has(row[rowKey])) {
    return 'table-row-selected'
  }
  return ''
}

// 处理选择改变改变事件
const handleSelectionChange = (selection: any[]) => {
  selectedRowKeys.value.clear()
  selection.forEach((item: any) => {
    const rowKey = props.rowKey || 'id'
    selectedRowKeys.value.add(item[rowKey])
  })
  emit('selection-change', selection)
}

// 打开导出弹窗
const openExportModal = () => {
  exportModalVisible.value = true
}

// 处理导出点击事件
const handleExportWithFields = (params: { fields: string[]; format: string }) => {
  exportLoading.value = true
  emit('export', params)
}

// 监听导出弹窗关闭事件
watch(exportModalVisible, (val) => {
  if (!val) {
    exportLoading.value = false
  }
})

// 处理每页显示改变事件
const handleSizeChange = (size: number) => {
  emit('page-change', props.currentPage, size)
}

// 处理当前页码改变事件
const handleCurrentChange = (page: number) => {
  emit('page-change', page, props.pageSize)
}

// 处理列设置点击事件
const handleColumnSettings = () => {
  drawerVisible.value = true
  emit('column-settings')
}

// 处理列显示状态改变事件
const handleColumnChange = () => {
  saveColumnVisibility()
}

// 处理列排序结束事件
const handleDragEnd = () => {
  const orderMap: Record<string, number> = {}
  localColumns.value.forEach((col, index) => {
    orderMap[col.key] = index
  })
  localStorage.setItem(`${props.storageKey}-order`, JSON.stringify(orderMap))
  saveColumnVisibility()
}

// 处理操作列点击事件
const handleAction = (action: string, row: any) => {
  emit('action', action, row)
}

// 获取当前列显示状态
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

// 获取当前列排序顺序
const loadColumnOrder = () => {
  if (!props.storageKey) return
  const saved = localStorage.getItem(`${props.storageKey}-order`)
  if (saved) {
    try {
      const orderMap = JSON.parse(saved) as Record<string, number>
      localColumns.value.sort((a, b) => {
        const orderA = orderMap[a.key] ?? Number.MAX_SAFE_INTEGER
        const orderB = orderMap[b.key] ?? Number.MAX_SAFE_INTEGER
        return orderA - orderB
      })
    } catch (e) {
      logger.error('Failed to load column order:', e)
    }
  }
}

// 重置所有设置
const handleResetAll = () => {
  if (!props.storageKey) return
  localStorage.removeItem(`${props.storageKey}-order`)
  localStorage.removeItem(`${props.storageKey}-visibility`)
  localColumns.value = props.columns.map(col => ({
    ...col,
    visible: true
  }))
  saveColumnVisibility()
}

// 保存列显示状态
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

// 预加载操作列图标
const preloadIcons = async () => {
  const actionIcons = props.actions?.map(action => action.icon).filter(Boolean) as string[]
  if (actionIcons.length > 0) {
    await Promise.all(actionIcons.map(icon => loadIcon(icon)))
  }
}

onMounted(() => {
  loadColumnVisibility()
  loadColumnOrder()
  preloadIcons()
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
  border-radius: 12px 12px 0 0;

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
        top: 6px;
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

    .el-checkbox__inner {
      width: 16px;
      height: 16px;
      &::after {
        box-sizing: content-box;
        content: "";
        width: 22px;
        height: 22px;
        position: absolute;
        left: -3px;
        top: -6px;
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

  .icon {
    width: 22px;
    transition: transform 0.3s ease-in-out;

    &.IconApproval {
      width: 19px;
    }

    &:hover {
      transform: scale(1.1);
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  border-radius: 0 0 12px 12px;
}

.column-settings {
  padding: 0;

  .column-settings-header {
    display: grid;
    grid-template-columns: 1fr 100px 100px;
    align-items: center;
    padding: 12px 16px;
    background-color: #007EFF0D;
    font-weight: 500;
    color: #606266;
    font-size: 14px;

    .col-show,
    .col-sort {
      text-align: center;
    }
  }

  .column-settings-body {
    padding: 0;

    .column-item {
      display: grid;
      grid-template-columns: 1fr 100px 100px;
      align-items: center;
      padding: 12px 16px;

      &:hover {
        background-color: #f5f7fa;
      }

      .col-name {
        font-size: 14px;
        color: #303133;
      }

      .col-show {
        display: flex;
        justify-content: center;
      }

      .col-sort {
        display: flex;
        justify-content: center;
        cursor: grab;
        color: #c0c4cc;

        &:hover {
          color: #409eff;
        }
      }
    }

    .ghost {
      opacity: 0.5;
      background-color: #409eff20;
    }

    .drag {
      background-color: #409eff10;
    }
  }
}
</style>
