<template>
  <div class="approval-list">
    <!-- Base Table Page -->
    <BaseTablePage
      :search-fields="searchFields"
      :columns="columns"
      :actions="tableActions"
      :fetch-data="fetchData"
      title="审批列表"
      storage-key="approval-list"
      :show-column-settings="true"
      :show-selection="true"
      @action="handleTableAction"
      @selection-change="handleSelectionChange"
    >
      <template #cell-status="{ row }">
        <StatusTag :status="row.status" :status-map="statusMap" size="small" />
      </template>
    </BaseTablePage>

    <!-- Approval Drawer -->
    <el-drawer
      v-model="drawerVisible"
      :size="600"
      :title="drawerTitle"
      direction="rtl"
      :close-on-click-modal="false"
    >
      <el-tabs v-model="activeTab" class="approval-tabs">
        <!-- 审批详情 Tab -->
        <el-tab-pane label="审批详情" name="detail">
          <div class="tab-content" v-if="currentApproval">
            <!-- 产品授权信息 -->
            <section class="detail-section">
              <h3 class="section-title">产品授权信息</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">客户名称</span>
                  <span class="info-value">{{ currentApproval.authInfo.customerName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">产品模块</span>
                  <span class="info-value">{{ currentApproval.authInfo.productModule }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">订阅功能</span>
                  <span class="info-value">{{ currentApproval.authInfo.subscribeFunction }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">授权类型</span>
                  <span class="info-value">{{ currentApproval.authInfo.authType }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">订单编号</span>
                  <span class="info-value">{{ currentApproval.authInfo.orderNo }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">授权编号</span>
                  <span class="info-value">{{ currentApproval.authInfo.authNo }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">硬件绑定</span>
                  <span class="info-value">{{ currentApproval.authInfo.hardwareBind }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">绑定日期</span>
                  <span class="info-value">{{ currentApproval.authInfo.bindDate }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">授权开始日期</span>
                  <span class="info-value">{{ currentApproval.authInfo.authStartDate }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">授权结束日期</span>
                  <span class="info-value">{{ currentApproval.authInfo.authEndDate }}</span>
                </div>
              </div>
            </section>

            <!-- 审批信息 -->
            <section class="detail-section">
              <h3 class="section-title">审批信息</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">审批事项</span>
                  <span class="info-value">{{ currentApproval.item }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">操作原因</span>
                  <span class="info-value">{{ currentApproval.reason }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">操作时间</span>
                  <span class="info-value">{{ currentApproval.operateTime }}</span>
                </div>
              </div>
            </section>

            <!-- 审批操作 -->
            <section class="detail-section">
              <h3 class="section-title">审批操作</h3>
              <div class="approval-action">
                <el-form label-position="top">
                  <el-form-item label="操作原因">
                    <el-input
                      v-model="approvalForm.reason"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入操作原因"
                    />
                  </el-form-item>
                </el-form>
                <div class="approval-buttons">
                  <el-button type="danger" @click="handleReject" :loading="rejectLoading">
                    审批不通过
                  </el-button>
                  <el-button type="primary" @click="handlePass" :loading="passLoading">
                    审批通过
                  </el-button>
                </div>
              </div>
            </section>
          </div>
        </el-tab-pane>

        <!-- 操作记录 Tab -->
        <el-tab-pane label="操作记录" name="records">
          <div class="tab-content" v-if="currentApproval">
            <el-timeline>
              <el-timeline-item
                v-for="(record, index) in currentApproval.records"
                :key="index"
                :timestamp="record.time"
                placement="top"
                :type="record.type"
                :color="record.color"
              >
                <div class="timeline-content">
                  <span class="timeline-operator">{{ record.operator }}</span>
                  <span class="timeline-action">{{ record.action }}</span>
                  <el-tag
                    v-if="record.result"
                    :type="record.resultType"
                    size="small"
                    class="result-tag"
                  >
                    {{ record.result }}
                  </el-tag>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Approval } from '@/types/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import { BaseTablePage } from '@/components/BaseTablePage'
import { StatusTag } from '@/components/StatusTag'
import type { ActionButton } from '@/components/DataTable/types'
import { approvalColumns } from '@/config/approval/columns'
import { approvalSearchFields } from '@/config/approval/searchFields'
import request from '@/utils/request'

// ─── Extended Types ──────────────────────────────────────────────────────

interface AuthInfo {
  customerName: string
  productModule: string
  subscribeFunction: string
  authType: string
  orderNo: string
  authNo: string
  hardwareBind: string
  bindDate: string
  authStartDate: string
  authEndDate: string
}

interface TimelineRecord {
  operator: string
  action: string
  time: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  color?: string
  result?: string
  resultType?: 'success' | 'danger' | 'warning' | 'info'
}

interface ExtendedApproval extends Approval {
  reason: string
  authInfo: AuthInfo
  records: TimelineRecord[]
}

// ─── Table Config ─────────────────────────────────────────────────────

// 表格列配置已移至 @/config/approval/columns.ts
const columns = ref(approvalColumns)

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary' },
  { key: 'approve', label: '审批', type: 'danger', condition: (row: ExtendedApproval) => row.status === '待审核' }
]

// ─── Search Form ──────────────────────────────────────────────────────

// 搜索字段配置已移至 @/config/approval/searchFields.ts
const searchFields = approvalSearchFields

// ─── Status Tag Type ──────────────────────────────────────────────────

const statusMap = {
  '待审核': 'success',
  '已通过': 'primary',
  '已拒绝': 'danger'
}

// ─── Table Data ───────────────────────────────────────────────────────

const selectedApprovals = ref<Approval[]>([])

const fetchData = async (formData?: Record<string, any>, page: number = 1, pageSize: number = 20) => {
  try {
    const result = await request.get('/api/approval/list', {
      params: {
        page: String(page),
        pageSize: String(pageSize),
        ...formData
      }
    })
    if (result.code === 200) {
      return { list: result.data.list || [], total: result.data.total || 0 }
    }
    return { list: [], total: 0 }
  } catch (error) {
    ElMessage.error('加载数据失败')
    return { list: [], total: 0 }
  }
}

const handleSelectionChange = (selection: Approval[]) => {
  selectedApprovals.value = selection
}

const handleTableAction = (action: string, row: ExtendedApproval) => {
  if (action === 'view') {
    handleView(row)
  } else if (action === 'approve') {
    handleApprove(row)
  }
}

// ─── Drawer ───────────────────────────────────────────────────────────

const drawerVisible = ref(false)
const drawerTitle = ref('')
const activeTab = ref('detail')
const currentApproval = ref<ExtendedApproval | null>(null)
const approvalForm = reactive({ reason: '' })
const passLoading = ref(false)
const rejectLoading = ref(false)

const handleView = (row: ExtendedApproval) => {
  currentApproval.value = row
  drawerTitle.value = `审批详情 - ${row.authNo}`
  activeTab.value = 'detail'
  approvalForm.reason = ''
  drawerVisible.value = true
}

const handleApprove = (row: ExtendedApproval) => {
  currentApproval.value = row
  drawerTitle.value = `审批 - ${row.authNo}`
  activeTab.value = 'detail'
  approvalForm.reason = ''
  drawerVisible.value = true
}

const handlePass = async () => {
  if (!approvalForm.reason.trim()) {
    ElMessage.warning('请填写操作原因')
    return
  }
  if (!currentApproval.value) return

  try {
    await ElMessageBox.confirm('确认审批通过？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  passLoading.value = true
  try {
    const result = await request.post('/api/approval/pass', {
      id: currentApproval.value.id,
      reason: approvalForm.reason
    })
    if (result.code === 200) {
      currentApproval.value.status = '已通过'
      const now = new Date()
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      currentApproval.value.records.push({
        operator: '当前用户',
        action: '审批通过',
        time: timeStr,
        type: 'success',
        result: '已通过',
        resultType: 'success'
      })
      ElMessage.success('审批通过')
      drawerVisible.value = false
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    passLoading.value = false
  }
}

const handleReject = async () => {
  if (!approvalForm.reason.trim()) {
    ElMessage.warning('请填写操作原因')
    return
  }
  if (!currentApproval.value) return

  try {
    await ElMessageBox.confirm('确认审批不通过？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  } catch {
    return
  }

  rejectLoading.value = true
  try {
    const result = await request.post('/api/approval/reject', {
      id: currentApproval.value.id,
      reason: approvalForm.reason
    })
    if (result.code === 200) {
      currentApproval.value.status = '已拒绝'
      const now = new Date()
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      currentApproval.value.records.push({
        operator: '当前用户',
        action: '审批拒绝',
        time: timeStr,
        type: 'danger',
        result: '已拒绝',
        resultType: 'danger'
      })
      ElMessage.success('已拒绝该审批')
      drawerVisible.value = false
    }
  } catch {
    ElMessage.error('操作失败')
  } finally {
    rejectLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.approval-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}

// ─── Drawer ─────────────────────────────────────────────────────────

.approval-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 20px;
  }
}

.tab-content {
  padding-bottom: 20px;
}

.detail-section {
  margin-bottom: 24px;

  .section-title {
    font-size: 15px;
    font-weight: 600;
    
    margin: 0 0 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #ebeef5;
  }

  .info-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .info-item {
      display: flex;
      align-items: flex-start;
      font-size: 14px;
      line-height: 1.6;

      .info-label {
        width: 120px;
        flex-shrink: 0;
        color: var(--el-text-color-secondary);
      }

      .info-value {
        flex: 1;
        
        word-break: break-all;
      }
    }
  }
}

// ─── Approval Action ────────────────────────────────────────────────

.approval-action {
  .approval-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 16px;
  }
}

// ─── Timeline ───────────────────────────────────────────────────────

.timeline-content {
  display: flex;
  align-items: center;
  gap: 8px;

  .timeline-operator {
    font-weight: 500;
    
  }

  .timeline-action {
    color: #606266;
  }

  .result-tag {
    margin-left: 4px;
  }
}
</style>