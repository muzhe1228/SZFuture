<template>
  <div class="system-logs">
    <!-- Search Bar -->
    <SearchForm style="margin-bottom: 16px;" :fields="searchFields" storage-key="system-logs-search"
      @search="handleSearch" @reset="handleReset" :search-loading="tableLoading" :reset-loading="tableLoading" />

    <!-- Charts Section -->
    <div class="charts-section">
      <el-card class="chart-card">
        <template #header>
          <span class="chart-title">周统计</span>
        </template>
        <div class="chart-container">
          <div class="chart-label">周统计</div>
          <v-chart class="chart" :option="weekChartOption" autoresize />
        </div>
      </el-card>
      <el-card class="chart-card">
        <template #header>
          <span class="chart-title">总比例</span>
        </template>
        <div class="chart-container">
          <div class="chart-label">总比例</div>
          <v-chart class="chart" :option="pieChartOption" autoresize />
        </div>
      </el-card>
    </div>

    <!-- Base Table Page -->
    <BaseTablePage class="table-container-log" ref="tablePageRef" :columns="columns" :actions="tableActions"
      :fetch-data="fetchData" :loading="tableLoading" title="系统日志" storage-key="system-logs"
      :show-column-settings="true" :show-selection="true" @action="handleTableAction"
      @selection-change="handleSelectionChange">
      <template #extra-actions>
        <el-button type="danger" link :disabled="selectedRows.length === 0" @click="handleBatchDelete">
          删除日志
        </el-button>
      </template>
    </BaseTablePage>

    <!-- Delete Log Modal -->
    <DeleteModal 
      v-model="deleteModalVisible" 
      :title-text="deleteModalTitle"
      :delete-api="deleteLogApi"
      :id="currentLog?.id"
      @success="handleDeleteSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import SearchForm from '@/components/SearchForm'
import { BaseTablePage } from '@/components/BaseTablePage'
import DeleteModal from '@/components/Dialog/common/DeleteModal.vue'
import type { ActionButton } from '@/components/DataTable/types'
import { systemLogColumns } from '@/config/audit/columns'
import { systemLogSearchFields } from '@/config/audit/searchFields'
import type { AccessLog } from '@/types/index'
import request from '@/utils/request'
import { createRoundedRectPath } from '@/utils/common'

use([CanvasRenderer, LineChart, PieChart, TooltipComponent, LegendComponent, GridComponent])

const tableLoading = ref(false)
const selectedRows = ref<AccessLog[]>([])
const tablePageRef = ref<any>(null)
const deleteModalVisible = ref(false)
const currentLog = ref<AccessLog | null>(null)

const deleteModalTitle = computed(() => {
  if (currentLog.value) {
    return `确定要删除用户 "${currentLog.value.user}" 的日志记录吗？`
  }
  return `确定要删除选中的 ${selectedRows.value.length} 条日志记录吗？`
})

// 表格列配置已移至 @/config/audit/columns.ts
const columns = ref(systemLogColumns)

const tableActions: ActionButton[] = [{ key: 'delete', label: '删除', type: 'danger',icon: 'IconDel' }]

// 搜索字段配置已移至 @/config/audit/searchFields.ts
const searchFields = systemLogSearchFields

const searchParams = ref<Record<string, any>>({})

const weekChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis' as const,
  },
  legend: {
    data: ['用户登录', '用户登出'],
    top: 0,
    right: '4%',
    icon: createRoundedRectPath(16, 12, 6),
    itemWidth: 16,
    itemHeight: 12,
    itemGap: 20,
    textStyle: {
      color: '#1D2129',
      fontSize: 12,
    },
    selectedMode: true,
    selected: {
      '用户登录': true,
      '用户登出': true,
    },
    inactiveColor: '#ccc',
  },
  grid: {
    left: '1%',
    right: '1%',
    top: '15%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category' as const,
    boundaryGap: false,
    data: ['2023-08-08', '2023-08-09', '2023-08-10', '2023-08-11', '2023-08-12', '2023-08-13', '2023-08-14']
  },
  yAxis: {
    type: 'value' as const,
    min: 0,
    max: 100,
  },
  series: [
    {
      name: '用户登录',
      type: 'line' as const,
      smooth: true,
      symbol: 'none',
      data: [20, 35, 45, 55, 65, 75, 85],
      itemStyle: { color: '#f59e0b' },
      lineStyle: { width: 2, shadowBlur: 4, shadowColor: 'rgba(245, 158, 11, 0.5)', shadowOffsetY: 2 },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(245, 158, 11, 0.35)' },
            { offset: 1, color: 'rgba(245, 158, 11, 0.02)' },
          ],
        },
      },
    },
    {
      name: '用户登出',
      type: 'line' as const,
      smooth: true,
      symbol: 'none',
      data: [10, 15, 25, 30, 40, 50, 60],
      itemStyle: { color: '#f56c6c' },
      lineStyle: { width: 2, shadowBlur: 4, shadowColor: 'rgba(245, 108, 108, 0.5)', shadowOffsetY: 2 },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(245, 108, 108, 0.35)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.02)' },
          ],
        },
      },
    },
  ],
}))

// Pie chart showing login/logout ratio
const pieChartOption = computed(() => ({
  tooltip: {
    trigger: 'item' as const,
    formatter: '{a} <br/>{b}: {c} ({d}%)',
  },
  legend: {
    orient: 'vertical' as const,
    right: 10,
    top: 'center',
    data: ['用户登录', '用户登出'],
    formatter: (name: string) => {
      return `${name}`
    },
  },
  series: [
    {
      name: '访问统计',
      type: 'pie' as const,
      radius: '60%',
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      data: [
        { value: 80, name: '用户登录', itemStyle: { color: '#f59e0b' } },
        { value: 20, name: '用户登出', itemStyle: { color: '#f56c6c' } },
      ],
    },
  ],
}))

const handleSearch = async (formData: Record<string, any>) => {
  searchParams.value = { ...formData }
  if (tablePageRef.value) {
    tableLoading.value = true
    try {
      await tablePageRef.value.reload(formData)
    } finally {
      tableLoading.value = false
    }
  }
}

const handleReset = async () => {
  searchParams.value = {}
  if (tablePageRef.value) {
    tableLoading.value = true
    try {
      await tablePageRef.value.reload({})
      ElMessage.success('重置成功')
    } finally {
      tableLoading.value = false
    }
  }
}

const fetchData = async (formData?: Record<string, any>, page: number = 1, pageSize: number = 10) => {
  tableLoading.value = true
  try {
    const result = await request.get('/api/log/system/list', {
      params: {
        page: String(page),
        pageSize: String(pageSize),
        ...formData,
      },
    })
    if (result.code === 200) {
      const list = (result.data.list || []).map((item: any) => ({
        id: item.id,
        operation: item.logMessage,
        ipAddress: item.ip,
        addressType: item.logModule,
        user: item.logModule,
        account: item.logSource,
        createTime: item.createTime,
      }))
      return { list, total: result.data.total || 0 }
    }
    return { list: [], total: 0 }
  } catch {
    ElMessage.error('加载数据失败')
    return { list: [], total: 0 }
  } finally {
    tableLoading.value = false
  }
}

const handleSelectionChange = (selection: AccessLog[]) => {
  selectedRows.value = selection
}

const handleTableAction = (action: string, row: AccessLog) => {
  if (action === 'delete') {
    handleDelete(row)
  }
}

const handleDelete = async (row: AccessLog) => {
  currentLog.value = row
  deleteModalVisible.value = true
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  currentLog.value = null
  deleteModalVisible.value = true
}

const deleteLogApi = async () => {
  if (currentLog.value) {
    await request.delete('/api/log/access/delete', { params: { id: currentLog.value.id } })
  } else {
    const ids = selectedRows.value.map(r => r.id)
    await request.delete('/api/log/access/delete', { params: { ids: ids.join(',') } })
  }
}

const handleDeleteSuccess = () => {
  currentLog.value = null
  selectedRows.value = []
}
</script>

<style lang="scss" scoped>
.system-logs {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
  box-sizing: border-box;
  padding: 16px;
}

.charts-section {
  display: grid;
  grid-template-columns: 5fr 3fr;
  gap: 16px;

  .chart-card {
    :deep(.el-card__header) {
      padding: 12px 20px;
      border-bottom: 1px solid #ebeef5;
    }

    .chart-title {
      font-size: 16px;
      font-weight: 500;
    }

    .chart-container {
      position: relative;
      height: 240px;
    }

    .chart-label {
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10;
    }

    .chart {
      height: 100%;
      width: 100%;
    }
  }
}

@media (max-width: 1200px) {
  .system-logs {
    height: auto;
    display: block;
  }

  .table-container-log {
    height: 500px;
  }

  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .system-logs {
    padding: 12px;
  }

  .charts-section {
    gap: 12px;
  }

  .chart-card {
    .chart-container {
      height: 200px;
    }
  }

  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>
