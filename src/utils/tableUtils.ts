/**
 * 表格相关工具函数
 */

import type { ColumnConfig } from '@/components/DataTable/types'

/**
 * 处理表格列配置
 * @param columns 原始列配置
 * @returns 处理后的列配置
 */
export const processColumns = (columns: ColumnConfig[]): ColumnConfig[] => {
  return columns.map(column => ({
    ...column,
    minWidth: column.minWidth || '100',
    align: column.align || 'left',
    visible: column.visible !== false
  }))
}

/**
 * 按列键获取列配置
 * @param columns 列配置数组
 * @param key 列键
 * @returns 列配置
 */
export const getColumnByKey = (columns: ColumnConfig[], key: string): ColumnConfig | undefined => {
  return columns.find(column => column.key === key)
}

/**
 * 过滤可见列
 * @param columns 列配置数组
 * @returns 可见列配置数组
 */
export const getVisibleColumns = (columns: ColumnConfig[]): ColumnConfig[] => {
  return columns.filter(column => column.visible !== false)
}

/**
 * 计算表格总宽度
 * @param columns 列配置数组
 * @returns 总宽度
 */
export const calculateTableWidth = (columns: ColumnConfig[]): string => {
  const visibleColumns = getVisibleColumns(columns)
  const totalWidth = visibleColumns.reduce((sum, column) => {
    if (column.width) {
      return sum + parseInt(column.width as string)
    }
    if (column.minWidth) {
      return sum + parseInt(column.minWidth as string)
    }
    return sum + 100
  }, 0)
  return `${totalWidth}px`
}

/**
 * 处理表格数据
 * @param data 原始数据
 * @param columns 列配置
 * @returns 处理后的数据
 */
export const processTableData = (data: any[], columns: ColumnConfig[]): any[] => {
  return data.map(item => {
    const processedItem: any = { ...item }
    columns.forEach(column => {
      if (column.formatter && typeof column.formatter === 'function') {
        processedItem[column.prop as string] = column.formatter(item, column)
      }
    })
    return processedItem
  })
}