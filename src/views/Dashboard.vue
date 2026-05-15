<template>
  <div class="dashboard">
    <div class="dashboard-content">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Welcome Card -->
        <el-card class="welcome-card" shadow="never">
          <div class="welcome-content">
            <h2 class="welcome-content-title">Hi, {{ currentUser.name }}, 开始您一天的工作吧!</h2>
            <p class="welcome-content-department">所属部门: {{ currentUser.department }} | {{ currentUser.role }}</p>
            <p class="welcome-content-last-login">上次登陆时间: {{ lastLoginTime }}</p>
          </div>
        </el-card>

        <!-- Data Statistics Card -->
        <div class="stats-card">
          <div class="stats-card-header">数据统计</div>
          <div class="stats-grid">
            <div v-for="stat in statistics" :key="stat.label" class="stat-item">
              <div class="stat-label">{{ stat.label }}</div>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
          </div>
        </div>

        <!-- Message Notifications Card -->
        <div class="message-card">
          <div class="message-card-header">消息通知</div>
          <ul class="message-table-header">
            <li>发生时间</li>
            <li>客户</li>
            <li>事件</li>
            <li>操作</li>
          </ul>
        </div>
        <div class="message-table-body">
          <ul v-for="msg in messages" :key="msg.id" class="message-table-item">
            <li>{{ msg.time }}</li>
            <li>{{ msg.customerName }}</li>
            <li>授权还有<span class="expiry-days">{{ msg.expiryDays }}</span>天到期</li>
            <li><el-button type="primary" link @click="handleViewMessage(msg)"> 处理 </el-button></li>
          </ul>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <div class="chart-header">
          <div class="chart-section-title">统计报表</div>
          <div class="chart-filters">
            <el-select v-model="expirationFilter" border-radius="var(--el-border-radius-circle)" placeholder="请选择"
              class="filter-select">
              <el-option label="产品1" value="product1" />
              <el-option label="产品2" value="product2" />
            </el-select>

            <el-date-picker v-model="expirationDateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
              end-placeholder="结束日期" class="date-range-picker" />

            <el-button type="primary" link>导出</el-button>
          </div>
        </div>


        <div class="chart-wrapper">
          <div class="chart-container">
            <div class="chart-label">激活率统计</div>
            <v-chart class="chart" :option="activationChartOption" autoresize />
          </div>
          <div class="chart-container">
            <div class="chart-label">过期率统计</div>
            <v-chart class="chart" :option="expirationChartOption" autoresize />
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import type { Message } from '@/types/index'
import { useUserStore } from '@/stores/user'
import { createRoundedRectPath } from '@/utils/common'

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent])

interface StatItem {
  label: string
  value: number
}

interface MessageItem extends Message {
  expiryDays: number
  time: string
}

// Get user info from store
const userStore = useUserStore()

// Mock current user data as fallback
const currentUser = ref({
  name: userStore.userInfo?.userName || '张三',
  department: '研发部',
  role: userStore.userInfo?.role || '系统管理员',
  avatar: userStore.userInfo?.avatar || '',
})

const lastLoginTime = ref(userStore.userInfo?.lastLoginTime || '2026-03-26 10:39:19')

// Mock statistics data
const statistics = ref<StatItem[]>([
  { label: '客户量', value: 276 },
  { label: '订单量', value: 146 },
  { label: '试用量', value: 976 },
  { label: '授权量', value: 855 },
  { label: '临期授权', value: 342 },
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
    expiryDays: 2,
    time: '2026-04-01 10:00:00',
  },
  {
    id: 2,
    customerName: '李四',
    phone: '139****5678',
    expiryTime: 3,
    status: '未处理',
    startDate: '2025-04-05',
    endDate: '2026-04-05',
    expiryDays: 2,
    time: '2026-04-02 14:30:00',
  },
  {
    id: 3,
    customerName: '王五',
    phone: '136****9012',
    expiryTime: 1,
    status: '未处理',
    startDate: '2025-04-10',
    endDate: '2026-04-10',
    expiryDays: 3,
    time: '2026-04-03 09:15:00',
  },
  {
    id: 4,
    customerName: '王五',
    phone: '136****9012',
    expiryTime: 1,
    status: '未处理',
    startDate: '2025-04-10',
    endDate: '2026-04-10',
    expiryDays: 3,
    time: '2026-04-03 09:15:00',
  },
  {
    id: 5,
    customerName: '王五',
    phone: '136****9012',
    expiryTime: 1,
    status: '未处理',
    startDate: '2025-04-10',
    endDate: '2026-04-10',
    expiryDays: 3,
    time: '2026-04-03 09:15:00',
  },
])

// Chart filters
const expirationFilter = ref('product1')
const expirationDateRange = ref<[Date, Date] | null>(null)

// Mock chart data
const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const activationChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis' as const,
  },
  legend: {
    data: ['产品1', '产品2'],
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
      '产品1': true,
      '产品2': true,
    },
    inactiveColor: '#ccc',
  },
  grid: {
    left: '3%',
    right: '4%',
    top: '15%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category' as const,
    boundaryGap: false,
    data: months,
  },
  yAxis: {
    type: 'value' as const,
    axisLabel: {
      formatter: '{value}%',
    },
  },
  series: [
    {
      name: '产品1',
      type: 'line' as const,
      smooth: true,
      data: [30, 35, 42, 48, 55, 62, 68, 75, 80, 85, 88, 92],
      symbol: 'none',
      itemStyle: { color: '#165DFF' },
      lineStyle: { width: 2, shadowBlur: 4, shadowColor: 'rgba(64, 158, 255, 0.5)', shadowOffsetY: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.35)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.02)' },
          ],
        },
      },
    },
    {
      name: '产品2',
      type: 'line' as const,
      smooth: true,
      data: [20, 25, 30, 38, 45, 52, 58, 65, 72, 78, 82, 86],
      symbol: 'none',
      itemStyle: { color: '#14C9C9' },
      lineStyle: { width: 2, shadowBlur: 4, shadowColor: 'rgba(0, 180, 160, 0.5)', shadowOffsetY: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 180, 160, 0.35)' },
            { offset: 1, color: 'rgba(0, 180, 160, 0.02)' },
          ],
        },
      },
    },
  ],
}))

const expirationChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis' as const,
  },
  legend: {
    data: ['产品1', '产品2'],
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
      '产品1': true,
      '产品2': true,
    },
    inactiveColor: '#ccc',
  },
  grid: {
    left: '3%',
    right: '4%',
    top: '15%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category' as const,
    boundaryGap: false,
    data: months,
  },
  yAxis: {
    type: 'value' as const,
    axisLabel: {
      formatter: '{value}%',
    },
  },
  series: [
    {
      name: '产品1',
      type: 'line' as const,
      smooth: true,
      data: [15, 12, 10, 8, 12, 10, 7, 5, 8, 6, 4, 3],
      symbol: 'none',
      itemStyle: { color: '#165DFF' },
      lineStyle: { width: 2, shadowBlur: 4, shadowColor: 'rgba(64, 158, 255, 0.5)', shadowOffsetY: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(64, 158, 255, 0.35)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.02)' },
          ],
        },
      },
    },
    {
      name: '产品2',
      type: 'line' as const,
      smooth: true,
      data: [18, 15, 12, 10, 14, 11, 9, 6, 10, 7, 5, 4],
      symbol: 'none',
      itemStyle: { color: '#14C9C9' },
      lineStyle: { width: 2, shadowBlur: 4, shadowColor: 'rgba(0, 180, 160, 0.5)', shadowOffsetY: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0, 180, 160, 0.35)' },
            { offset: 1, color: 'rgba(0, 180, 160, 0.02)' },
          ],
        },
      },
    },
  ],
}))

const handleViewMessage = (_msg: MessageItem) => {
  // Navigate to message detail or open dialog
}
</script>

<style lang="scss" scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}

.dashboard-content {
  display: flex;
  height: 100%;
  gap: 16px;
}

.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 520px;

  // Welcome Card
  .welcome-card {
    background-color: var(--bg-main-color);
    color: var(--el-color-white);
    padding: 22px;
    border-radius: 24px;
    position: relative;
    min-height: 148px;

    &::after {
      content: '';
      position: absolute;
      top: -120px;
      right: -50px;
      width: 235px;
      height: 235px;
      background: rgba(255, 255, 255, 0.16);
      border-radius: 120px;
    }

    :deep(.el-card__body) {
      padding: 0;
    }

    .welcome-content {
      line-height: 1;
      font-size: 18px;

      &-title {
        font-size: 22px;
        font-weight: 500;
        margin-bottom: 28px;
      }

      p {
        font-weight: 300;
      }

      &-department {
        margin-bottom: 16px;
      }
    }

  }

  // Stats Card
  .stats-card {
    min-height: 226px;
    transition: transform .5s linear;

    &-header {
      font-size: 20px;
      font-weight: 500;
      padding: 16px 18px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
    }

    .stat-item {
      cursor: pointer;
      text-align: center;
      padding: 16px 8px;
      border-radius: 24px;
      transition: transform 0.2s;
      background: linear-gradient(180deg, rgba(65, 107, 203, 0.3) 0%, rgba(65, 107, 203, 0) 100%);

      .stat-label {
        font-size: 18px;
        height: 40px;
        line-height: 40px;
        color: var(--el-color-primary);
      }

      .stat-value {
        font-size: 32px;
        padding: 24px 0;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: var(--el-color-primary);
      }

      &:nth-child(even) {
        background: linear-gradient(180deg, rgba(20, 201, 201, 0.3) 0%, rgba(20, 201, 201, 0) 100%);

        .stat-label,
        .stat-value {
          color: #14A8A8;
        }
      }

      &:hover {
        transform: translateY(-4px);
      }
    }
  }

  // Messages Card
  .message-card {
    min-height: 104px;

    &-header {
      font-size: 20px;
      font-weight: 500;
      padding: 16px 18px;
    }

    .message-table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 2fr 1fr;
      height: 44px;
      border-radius: 22px;
      text-align: center;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      background-color: #475E8C1A;
      color: var(--bg-main-color);
      font-size: 18px;
    }
  }

  .message-table-body {
    flex: 1;
    position: relative;
    padding: 16px;
    background-color: var(--el-bg-color);
    border-radius: 22px;
    overflow-y: auto;
    font-size: 14px;

    .expiry-days {
      padding: 0 4px;
      color: #FF4D4F;
    }
  }

  .message-table-item {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr 1fr;
    align-items: center;
    text-align: center;
    min-height: 40px;
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.right-column {
  flex: 1.8;
  display: flex;
  flex-direction: column;
  padding: 16px 0 0 16px;
  gap: 12px;
  min-width: 560px;
  border-radius: 4px;

.chart-section-title {
  font-size: 18px;
  font-weight: 500;
  padding: 4px 0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .chart-filters {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    padding-right: 16px;
  }

  .filter-select {
    width: 136px;
  }

  .date-range-picker {
    width: 348px;
  }
}

.chart-wrapper {
  flex: 1;
  background-color: var(--el-bg-color);
  border-radius: 22px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 12px;
  overflow-y: auto;

  .chart-container {
    flex: 1;
    position: relative;
    min-height: 240px;
    margin-top: 14px;

    &:last-child {
      margin-top: 30px;
    }
  }

  .chart-label {
    position: absolute;
    top: 4px;
    left: 10px;
    font-size: 18px;
    z-index: 10;
  }

  .chart {
    height: 100%;
    width: 100%;
  }
}
}

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
