export interface ColumnConfig {
  key: string
  label: string
  prop: string
  width?: string
  minWidth?: string
  align?: 'left' | 'center' | 'right'
  visible?: boolean
  hasTemplate?: boolean
  sortable?: boolean
  showOverflowTooltip?: boolean
}

export interface ActionButton {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  link?: boolean
  icon?: any
  condition?: (row: any) => boolean
}

export interface DataTableProps {
  columns: ColumnConfig[]
  data: any[]
  loading?: boolean
  total?: number
  currentPage?: number
  pageSize?: number
  pageSizes?: number[]
  title?: string
  storageKey?: string
  showColumnSettings?: boolean
  showSelection?: boolean
  actions?: ActionButton[]
  rowKey?: string
  treeProps?: any
  defaultExpandAll?: boolean
  onPageChange?: (page: number, pageSize: number) => void
  onSelectionChange?: (selection: any[]) => void
  onColumnSettings?: () => void
  onAction?: (action: string, row: any) => void
}

export interface DataTableEmits {
  (e: 'page-change', page: number, pageSize: number): void
  (e: 'selection-change', selection: any[]): void
  (e: 'column-settings'): void
  (e: 'action', action: string, row: any): void
}