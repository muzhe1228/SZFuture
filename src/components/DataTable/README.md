# DataTable 组件使用文档

## 概述

DataTable 是一个基于 Element Plus 封装的高性能表格组件，提供了丰富的功能，包括：
- 数据展示与分页
- 列配置（显示/隐藏、排序）
- 行选择功能
- 操作按钮列
- 导出功能
- 拖拽排序

## 基本用法

```vue
<template>
  <DataTable
    :columns="columns"
    :data="tableData"
    :total="total"
    :current-page="currentPage"
    :page-size="pageSize"
    :loading="loading"
    @page-change="handlePageChange"
    @action="handleAction"
    @export="handleExport"
  >
    <template #cell-status="{ row }">
      <span :class="row.status === 'active' ? 'text-success' : 'text-danger'">
        {{ row.status === 'active' ? '活跃' : '禁用' }}
      </span>
    </template>
  </DataTable>
</template>

<script setup lang="ts">
import DataTable from '@/components/DataTable'
import type { ColumnConfig, ActionButton } from '@/components/DataTable/types'

const columns: ColumnConfig[] = [
  { key: 'name', label: '姓名', prop: 'name', align: 'center' },
  { key: 'email', label: '邮箱', prop: 'email' },
  { key: 'status', label: '状态', prop: 'status', hasTemplate: true },
]

const actions: ActionButton[] = [
  { key: 'edit', label: '编辑', icon: 'IconEdit' },
  { key: 'delete', label: '删除', icon: 'IconDel', type: 'danger' },
]

const tableData = [
  { id: 1, name: '张三', email: 'zhangsan@example.com', status: 'active' },
  { id: 2, name: '李四', email: 'lisi@example.com', status: 'disabled' },
]

const handlePageChange = (page: number, pageSize: number) => {
  console.log('Page changed:', page, pageSize)
}

const handleAction = (action: string, row: any) => {
  console.log('Action:', action, row)
}

const handleExport = (params: { fields: string[]; format: string }) => {
  console.log('Export:', params)
}
</script>
```

## Props

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| columns | `ColumnConfig[]` | - | 列配置数组，必填 |
| data | `any[]` | - | 表格数据数组，必填 |
| loading | `boolean` | `false` | 加载状态 |
| total | `number` | `0` | 总记录数 |
| currentPage | `number` | `1` | 当前页码 |
| pageSize | `number` | `20` | 每页条数 |
| pageSizes | `number[]` | `[10, 20, 50, 100]` | 每页条数选项 |
| title | `string` | `''` | 表格标题 |
| storageKey | `string` | `'data-table-columns'` | 本地存储键名，用于保存列配置 |
| hideColumnSettings | `boolean` | `false` | 是否隐藏列配置按钮 |
| hideSelection | `boolean` | `true` | 是否隐藏选择列 |
| hideExport | `boolean` | `false` | 是否隐藏导出按钮 |
| actions | `ActionButton[]` | `[]` | 操作按钮配置 |
| rowKey | `string` | `'id'` | 行唯一标识字段 |
| treeProps | `any` | `undefined` | 树形表格配置 |
| defaultExpandAll | `boolean` | `false` | 是否默认展开所有树形节点 |

## ColumnConfig 列配置

| 参数名 | 类型 | 说明 |
|--------|------|------|
| key | `string` | 列唯一标识，必填 |
| label | `string` | 列显示名称，必填 |
| prop | `string` | 数据字段名，必填 |
| width | `string` | 列宽度 |
| minWidth | `string` | 列最小宽度 |
| align | `'left' \| 'center' \| 'right'` | 对齐方式 |
| visible | `boolean` | 是否可见，默认为 `true` |
| hasTemplate | `boolean` | 是否使用自定义模板 |
| sortable | `boolean` | 是否可排序 |
| showOverflowTooltip | `boolean` | 内容溢出时是否显示 tooltip |
| formatter | `(row: any, column: ColumnConfig) => string` | 格式化函数 |

## ActionButton 操作按钮

| 参数名 | 类型 | 说明 |
|--------|------|------|
| key | `string` | 按钮标识，必填 |
| label | `string` | 按钮显示文本，必填 |
| type | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | 按钮类型 |
| link | `boolean` | 是否为链接样式 |
| icon | `IconType` | 图标类型 |
| condition | `(row: any) => boolean` | 显示条件函数 |

## IconType 图标类型

支持以下图标：
- `IconActive`
- `IconShow`
- `IconDel`
- `IconDownload`
- `IconApproval`
- `IconCopy`
- `IconDelay`
- `IconEdit`
- `IconFreeze`
- `IconRefresh`
- `IconUpload`
- `IconVoid`

## Emits 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| page-change | `(page: number, pageSize: number)` | 分页变更时触发 |
| selection-change | `(selection: any[])` | 选择项变更时触发 |
| column-settings | `()` | 点击列配置按钮时触发 |
| action | `(action: string, row: any)` | 点击操作按钮时触发 |
| export | `(params: { fields: string[]; format: string })` | 导出时触发 |

## Slots 插槽

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| extra-actions | - | 头部左侧额外操作按钮 |
| extra-actions-right | - | 头部右侧额外操作按钮 |
| cell-{key} | `{ row }` | 自定义单元格内容，`{key}` 为列的 key 值 |

## 功能特性

### 1. 列配置

点击"列配置"按钮可打开列设置抽屉，支持：
- 显示/隐藏列
- 拖拽调整列顺序
- 恢复默认排序

### 2. 导出功能

点击"导出"按钮可打开导出弹窗，支持：
- 选择导出字段
- 选择导出格式

### 3. 行选择

设置 `hideSelection` 为 `false` 可显示选择列，支持：
- 单选/多选
- 全选
- 选中行高亮显示（背景色：`#007EFF0D`）

### 4. 操作按钮

通过 `actions` prop 配置操作按钮，支持：
- 自定义按钮类型和图标
- 条件显示

### 5. 树形表格

设置 `treeProps` 可启用树形表格功能：

```vue
<DataTable
  :columns="columns"
  :data="treeData"
  :tree-props="{ children: 'children', label: 'name' }"
  :default-expand-all="true"
/>
```

## 样式定制

### 自定义 checkbox 样式

组件已内置自定义 checkbox 样式，包括：
- 方形 checkbox（圆角 5px）
- 自定义选中图标

### 行高

表格行最小高度为 60px，表头高度为 60px。

### 选中行背景色

选中行背景色为 `#007EFF0D`。

## 本地存储

组件会自动保存以下配置到 localStorage：
- 列可见性（`{storageKey}-visibility`）
- 列排序顺序（`{storageKey}-order`）

## 注意事项

1. 确保 `columns` 数组中每个列都有唯一的 `key` 值
2. 使用自定义模板时，需设置 `hasTemplate: true`，并在插槽中使用 `cell-{key}` 命名
3. `storageKey` 用于区分不同表格的配置，建议每个页面使用唯一值
4. 导出功能需要在父组件中监听 `export` 事件并实现具体导出逻辑