<template>
  <div class="dashboard">
    <div class="dashboard-content">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Welcome Card -->
        <el-card class="welcome-card" shadow="never">
          <div class="welcome-content">
            <el-avatar :size="60" class="avatar">
              <el-icon :size="36"><User /></el-icon>
            </el-avatar>
            <div class="welcome-text">
              <h2>Hi, {{ currentUser.name }}, 开始您一天的工作吧!</h2>
              <p>所属部门: {{ currentUser.department }} | {{ currentUser.role }}</p>
              <p class="last-login">上次登陆时间: {{ lastLoginTime }}</p>
            </div>
          </div>
        </el-card>

        <!-- Data Statistics Card -->
        <el-card class="stats-card" shadow="never">
          <template #header>
            <div class="card-header">数据统计</div>
          </template>
          <div class="stats-grid">
            <div v-for="stat in statistics" :key="stat.label" class="stat-item">
              <div class="stat-value">
                {{ stat.value }}
                <el-icon class="stat-arrow"><ArrowUp /></el-icon>
              </div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>

        <!-- Message Notifications Card -->
        <el-card class="messages-card" shadow="never">
          <template #header>
            <div class="card-header">消息通知</div>
          </template>
          <div class="message-list">
            <div v-for="msg in messages" :key="msg.id" class="message-item">
              <div class="message-info">
                <span class="message-text">{{ msg.content }}</span>
                <span class="message-time">{{ msg.time }}</span>
              </div>
              <el-button type="primary" link @click="handleViewMessage(msg)">
                查看处理
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <div class="chart-section-title">统计报表</div>

        <!-- Activation Rate Chart -->
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">激活率统计</span>
              <div class="chart-filters">
                <el-select v-model="activationFilter" placeholder="请选择" size="small" class="filter-select">
                  <el-option label="产品1" value="product1" />
                  <el-option label="产品2" value="product2" />
                </el-select>
                <el-radio-group v-model="activationTimeRange" size="small">
                  <el-radio-button value="day">日</el-radio-button>
                  <el-radio-button value="month">月</el-radio-button>
                  <el-radio-button value="year">年</el-radio-button>
                </el-radio-group>
                <el-date-picker
                  v-model="activationDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  size="small"
                  class="date-range-picker"
                />
              </div>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-label">激活率</div>
            <v-chart class="chart" :option="activationChartOption" autoresize />
          </div>
        </el-card>

        <!-- Expiration Rate Chart -->
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="chart-header">
              <span class="chart-title">过期率统计</span>
              <div class="chart-filters">
                <el-select v-model="expirationFilter" placeholder="请选择" size="small" class="filter-select">
                  <el-option label="产品1" value="product1" />
                  <el-option label="产品2" value="product2" />
                </el-select>
                <el-radio-group v-model="expirationTimeRange" size="small">
                  <el-radio-button value="day">日</el-radio-button>
                  <el-radio-button value="month">月</el-radio-button>
                  <el-radio-button value="year">年</el-radio-button>
                </el-radio-group>
                <el-date-picker
                  v-model="expirationDateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  size="small"
                  class="date-range-picker"
                />
              </div>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-label">过期率</div>
            <v-chart class="chart" :option="expirationChartOption" autoresize />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { User, ArrowUp } from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import type { Message } from '@/types/index'

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

interface StatItem {
  label: string
  value: number
}

interface MessageItem extends Message {
  content: string
  time: string
}

// Mock current user data
const currentUser = ref({
  name: '张三',
  department: '研发部',
  role: '系统管理员',
  avatar: ''
})

const lastLoginTime = ref('2026-03-26 10:39:19')

// Mock statistics data
const statistics = ref<StatItem[]>([
  { label: '客户数量', value: 276 },
  { label: '订单数量', value: 276 },
  { label: '试用数量', value: 276 },
  { label: '授权数量', value: 276 },
  { label: '临期授权', value: 276 }
])

// Mock messages data
const messages = ref<MessageItem[]>([
  {
    id: 1,
    customerName: '张三',
    phone: '138****1234',
    expiryTime: 7,
    status: '未处理',
    startDate: '2025-04-01',
    endDate: '2026-04-01',
    content: '客户【张三】【138****1234】：授权还有7天到期',
    time: '2026-04-01 10:00:00'
  },
  {
    id: 2,
    customerName: '李四',
    phone: '139****5678',
    expiryTime: 3,
    status: '未处理',
    startDate: '2025-04-05',
    endDate: '2026-04-05',
    content: '客户【李四】【139****5678】：授权还有3天到期',
    time: '2026-04-02 14:30:00'
  },
  {
    id: 3,
    customerName: '王五',
    phone: '136****9012',
    expiryTime: 1,
    status: '未处理',
    startDate: '2025-04-10',
    endDate: '2026-04-10',
    content: '客户【王五】【136****9012】：授权还有1天到期',
    time: '2026-04-03 09:15:00'
  }
])

// Chart filters
const activationFilter = ref('product1')
const activationTimeRange = ref<'day' | 'month' | 'year'>('month')
const activationDateRange = ref<[Date, Date] | null>(null)

const expirationFilter = ref('product1')
const expirationTimeRange = ref<'day' | 'month' | 'year'>('month')
const expirationDateRange = ref<[Date, Date] | null>(null)

// Mock chart data
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const activationChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis' as const
  },
  legend: {
    data: ['产品1', '产品2'],
    top: 0,
    right: '4%'
  },
  grid: {
    left: '3%',
    right: '4%',
    top: '15%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category' as const,
    boundaryGap: false,
    data: months
  },
  yAxis: {
    type: 'value' as const,
    axisLabel: {
      formatter: '{value}%'
    }
  },
  series: [
    {
      name: '产品1',
      type: 'line' as const,
      smooth: true,
      data: [30, 35, 42, 48, 55, 62, 68, 75, 80, 85, 88, 92],
      symbol: 'none',
      itemStyle: { color: '#409EFF' },
      lineStyle: { width: 3 }
    },
    {
      name: '产品2',
      type: 'line' as const,
      smooth: true,
      data: [20, 25, 30, 38, 45, 52, 58, 65, 72, 78, 82, 86],
      symbol: 'none',
      itemStyle: { color: '#00B4A0' },
      lineStyle: { width: 3 }
    }
  ]
}))

const expirationChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis' as const
  },
  legend: {
    data: ['产品1', '产品2'],
    top: 0,
    right: '10%'
  },
  grid: {
    left: '3%',
    right: '4%',
    top: '15%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category' as const,
    boundaryGap: false,
    data: months
  },
  yAxis: {
    type: 'value' as const,
    axisLabel: {
      formatter: '{value}%'
    }
  },
  series: [
    {
      name: '产品1',
      type: 'line' as const,
      smooth: true,
      data: [15, 12, 10, 8, 12, 10, 7, 5, 8, 6, 4, 3],
      symbol: 'none',
      itemStyle: { color: '#409EFF' },
      lineStyle: { width: 3 }
    },
    {
      name: '产品2',
      type: 'line' as const,
      smooth: true,
      data: [18, 15, 12, 10, 14, 11, 9, 6, 10, 7, 5, 4],
      symbol: 'none',
      itemStyle: { color: '#00B4A0' },
      lineStyle: { width: 3 }
    }
  ]
}))

const handleViewMessage = (msg: MessageItem) => {
  console.log('Viewing message:', msg)
  // Navigate to message detail or open dialog
}
</script>

<style lang="scss" scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}

.dashboard-content {
  display: flex;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.right-column {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

// Welcome Card
.welcome-card {
  :deep(.el-card__body) {
    padding: 24px;
  }

  .welcome-content {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .avatar {
    background-color: #409eff;
    flex-shrink: 0;
  }

  .welcome-text {
    h2 {
      font-size: 20px;
      font-weight: 500;
      color: #303133;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: #606266;
      margin-bottom: 4px;

      &.last-login {
        color: #909399;
        margin-top: 4px;
      }
    }
  }
}

// Stats Card
.stats-card {
  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .card-header {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    padding: 20px;
  }

  .stat-item {
    text-align: center;
    padding: 16px 8px;
    background-color: #f9fafb;
    border-radius: 8px;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: #409eff;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .stat-arrow {
    color: #67c23a;
    font-size: 16px;
  }

  .stat-label {
    font-size: 14px;
    color: #606266;
  }
}

// Messages Card
.messages-card {
  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .card-header {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }

  .message-list {
    padding: 0 20px 20px;
  }

  .message-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: none;
    }
  }

  .message-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
  }

  .message-text {
    font-size: 14px;
    color: #303133;
  }

  .message-time {
    font-size: 12px;
    color: #909399;
  }
}

// Right Column Charts
.chart-section-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  padding: 4px 0;
}

.chart-card {
  :deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #ebeef5;
  }

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .chart-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }

  .chart-filters {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .filter-select {
    width: 120px;
  }

  .date-range-picker {
    width: 260px;
  }

  .chart-container {
    position: relative;
    height: 300px;
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

// Responsive adjustments
@media (max-width: 1200px) {
  .dashboard-content {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 12px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }

  .chart-filters {
    flex-direction: column;
    align-items: flex-start !important;
  }
}
</style>
