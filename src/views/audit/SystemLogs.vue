<template>
  <div class="system-logs">
    <!-- Search Bar -->
    <SearchForm :fields="searchFields" storage-key="system-logs-search" @search="handleSearch" @reset="handleReset"
      :search-loading="tableLoading" :reset-loading="tableLoading" />

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
      <el-card class="chart-card" >
        <template #header>
          <span class="chart-title">总比例</span>
        </template>
        <div class="chart-container">
          <div class="chart-label">总比例</div>
          <v-chart class="chart" :option="pieChartOption" autoresize />
        </div>
      </el-card>
    </div>

    <!-- Data Table -->
    <DataTable
      :columns="columns"
      :data="tableData"
      :loading="tableLoading"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="[20, 50, 100]"
      title="系统日志"
      storage-key="system-logs-table"
      :show-column-settings="true"
      :show-selection="true"
      :actions="tableActions"
      row-key="id"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
      @action="handleTableAction"
    >
      <template #extra-actions>
        <el-button type="danger" size="small" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
          删除日志
        </el-button>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import SearchForm from '@/components/SearchForm.vue'
import { DataTable } from '@/components/DataTable'
import type { ColumnConfig, ActionButton } from '@/components/DataTable/types'
import type { SearchField } from '@/components/SearchForm/types'
import type { AccessLog } from '@/types/index'
import request from '@/utils/request'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedRows = ref<AccessLog[]>([])
const tableData = ref<AccessLog[]>([])

const columns = ref<ColumnConfig[]>([
  { key: 'operation', label: '操作', prop: 'operation', minWidth: '120', visible: true },
  { key: 'ipAddress', label: 'IP地址', prop: 'ipAddress', minWidth: '160', visible: true },
  { key: 'addressType', label: '地址类型', prop: 'addressType', minWidth: '120', visible: true },
  { key: 'user', label: '用户', prop: 'user', minWidth: '140', visible: true },
  { key: 'account', label: '账号', prop: 'account', minWidth: '160', visible: true },
  { key: 'createTime', label: '创建时间', prop: 'createTime', minWidth: '180', visible: true }
])

const tableActions: ActionButton[] = [
  { key: 'delete', label: '删除', type: 'danger' }
]

const searchFields = computed<SearchField[]>(() => [
  { prop: 'ipAddress', label: 'ip地址', type: 'input', placeholder: '请输入' },
  {
    prop: 'user',
    label: '用户',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: 'SevilinMa', value: 'SevilinMa' },
      { label: 'AdminZhang', value: 'AdminZhang' },
      { label: 'OperatorLi', value: 'OperatorLi' },
      { label: 'AdminWang', value: 'AdminWang' }
    ]
  },
  { prop: 'dateRange', label: '创建日期', type: 'daterange' }
])

const searchParams = ref<Record<string, any>>({})

// Week statistics chart (area chart with login/logout lines)
const weekChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis' as const,
    axisPointer: {
      type: 'cross' as const
    }
  },
  legend: {
    data: ['用户登录', '用户登出'],
    top: 0,
    right: '10%'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '15%',
    containLabel: true
  },
  xAxis: {
    type: 'category' as const,
    boundaryGap: false,
    data: ['2023-08-08', '2023-08-09', '2023-08-10', '2023-08-11', '2023-08-12', '2023-08-13', '2023-08-14']
  },
  yAxis: {
    type: 'value' as const,
    min: 0,
    max: 100
  },
  series: [
    {
      name: '用户登录',
      type: 'line' as const,
      smooth: true,
      symbol: 'none',
      data: [20, 35, 45, 55, 65, 75, 85],
      itemStyle: { color: '#409EFF' },
      lineStyle: { width: 3 },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ]
        }
      }
    },
    {
      name: '用户登出',
      type: 'line' as const,
      smooth: true,
      symbol: 'none',
      data: [10, 15, 25, 30, 40, 50, 60],
      itemStyle: { color: '#f56c6c' },
      lineStyle: { width: 3 },
      areaStyle: {
        color: {
          type: 'linear' as const,
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ]
        }
      }
    }
  ]
}))

// Pie chart showing login/logout ratio
const pieChartOption = computed(() => ({
  tooltip: {
    trigger: 'item' as const,
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical' as const,
    right: 10,
    top: 'center',
    data: ['用户登录', '用户登出'],
    formatter: (name: string) => {
      return `${name}`;
    }
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
        borderWidth: 2
      },
      label: {
        show: false
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        }
      },
      data: [
        { value: 80, name: '用户登录', itemStyle: { color: '#409EFF' } },
        { value: 20, name: '用户登出', itemStyle: { color: '#f56c6c' } }
      ]
    }
  ]
}))

const handleSearch = (formData: Record<string, any>) => {
  searchParams.value = { ...formData }
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  searchParams.value = {}
  currentPage.value = 1
  fetchData()
  ElMessage.success('重置成功')
}

const fetchData = async () => {
  tableLoading.value = true
  try {
    const result = await request.get('/api/log/system/list', {
      params: {
        page: String(currentPage.value),
        pageSize: String(pageSize.value),
        ...searchParams.value
      }
    })
    if (result.code === 200) {
      tableData.value = (result.data.list || []).map((item: any) => ({
        id: item.id,
        operation: item.logMessage,
        ipAddress: item.ip,
        addressType: item.logModule,
        user: item.logModule,
        account: item.logSource,
        createTime: item.createTime
      }))
      total.value = result.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    tableLoading.value = false
  }
}

const handlePageChange = (page: number, size: number) => {
  currentPage.value = page
  pageSize.value = size
  fetchData()
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
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${row.user}" 的日志记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    total.value = tableData.value.length
    ElMessage.success('删除成功')
  } catch {
    // User cancelled
  }
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) return
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条日志记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const selectedIds = selectedRows.value.map(row => row.id)
    tableData.value = tableData.value.filter(item => !selectedIds.includes(item.id))
    total.value = tableData.value.length
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  } catch {
    // User cancelled
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────

onMounted(() => {
  fetchData()
})
</script>

<style lang="scss" scoped>
.system-logs {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}

.search-form {
  margin-bottom: 16px;
  width: 100%;
}

.charts-section {
  display: grid;
  grid-template-columns: 5fr 3fr;
  gap: 16px;
  margin-bottom: 16px;

  .chart-card {
    :deep(.el-card__header) {
      padding: 12px 20px;
      border-bottom: 1px solid #ebeef5;
    }

    &.week-card {
      width: 70%;
    }

    .chart-title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
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
      color: #303133;
      z-index: 10;
    }

    .chart {
      height: 100%;
      width: 100%;
    }
  }
}


</style>