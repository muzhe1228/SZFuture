<template>
  <el-drawer v-model="dialogVisible" :size="600" :title="drawerTitle" direction="rtl" :close-on-click-modal="false">
    <el-tabs v-model="activeTab" class="approval-tabs">
      <!-- 审批详情 Tab -->
      <el-tab-pane label="审批详情" name="detail">
        <div class="tab-content" v-if="approval">
          <!-- 产品授权信息 -->
          <section class="detail-section">
            <h3 class="section-title">产品授权信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">客户名称</span>
                <span class="info-value">{{ approval.authInfo.customerName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">产品模块</span>
                <span class="info-value">{{ approval.authInfo.productModule }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">订阅功能</span>
                <span class="info-value">{{ approval.authInfo.subscribeFunction }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">授权类型</span>
                <span class="info-value">{{ approval.authInfo.authType }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">订单编号</span>
                <span class="info-value">{{ approval.authInfo.orderNo }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">授权编号</span>
                <span class="info-value">{{ approval.authInfo.authNo }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">硬件绑定</span>
                <span class="info-value">{{ approval.authInfo.hardwareBind }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">绑定日期</span>
                <span class="info-value">{{ approval.authInfo.bindDate }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">授权开始日期</span>
                <span class="info-value">{{ approval.authInfo.authStartDate }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">授权结束日期</span>
                <span class="info-value">{{ approval.authInfo.authEndDate }}</span>
              </div>
            </div>
          </section>

          <!-- 审批信息 -->
          <section class="detail-section">
            <h3 class="section-title">审批信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">审批事项</span>
                <span class="info-value">{{ approval.item }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">操作原因</span>
                <span class="info-value">{{ approval.reason }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">操作时间</span>
                <span class="info-value">{{ approval.operateTime }}</span>
              </div>
            </div>
          </section>

          <!-- 审批操作 -->
          <section class="detail-section">
            <h3 class="section-title">审批操作</h3>
            <div class="approval-action">
              <el-form label-position="top">
                <el-form-item label="操作原因">
                  <el-input v-model="approvalForm.reason" type="textarea" :rows="4" placeholder="请输入操作原因" />
                </el-form-item>
              </el-form>
              <div class="approval-buttons">
                <el-button type="danger" @click="handleReject" :loading="rejectLoading"> 审批不通过 </el-button>
                <el-button type="primary" @click="handlePass" :loading="passLoading"> 审批通过 </el-button>
              </div>
            </div>
          </section>
        </div>
      </el-tab-pane>

      <!-- 操作记录 Tab -->
      <el-tab-pane label="操作记录" name="records">
        <div class="tab-content" v-if="approval">
          <el-timeline>
            <el-timeline-item
              v-for="(record, index) in approval.records"
              :key="index"
              :timestamp="record.time"
              placement="top"
              :type="record.type"
              :color="record.color"
            >
              <div class="timeline-content">
                <span class="timeline-operator">{{ record.operator }}</span>
                <span class="timeline-action">{{ record.action }}</span>
                <el-tag v-if="record.result" :type="record.resultType" size="small" class="result-tag">
                  {{ record.result }}
                </el-tag>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import request from '@/utils/request'

  // ─── Props ──────────────────────────────────────────────────────

  interface Props {
    modelValue: boolean
    approval: any
    title: string
  }

  const props = defineProps<Props>()

  // ─── Emits ──────────────────────────────────────────────────────

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'pass', approval: any): void
    (e: 'reject', approval: any): void
  }>()

  // ─── Reactive Data ─────────────────────────────────────────────

  const dialogVisible = ref(props.modelValue)
  const drawerTitle = ref(props.title)
  const activeTab = ref('detail')
  const approval = ref(props.approval)
  const approvalForm = reactive({ reason: '' })
  const passLoading = ref(false)
  const rejectLoading = ref(false)

  // ─── Watch ─────────────────────────────────────────────────────

  watch(
    () => props.modelValue,
    (newValue) => {
      dialogVisible.value = newValue
    }
  )

  watch(
    () => props.title,
    (newValue) => {
      drawerTitle.value = newValue
    }
  )

  watch(
    () => props.approval,
    (newValue) => {
      approval.value = newValue
      approvalForm.reason = ''
    }
  )

  watch(dialogVisible, (newValue) => {
    emit('update:modelValue', newValue)
  })

  // ─── Methods ───────────────────────────────────────────────────

  const handlePass = async () => {
    if (!approvalForm.reason.trim()) {
      ElMessage.warning('请填写操作原因')
      return
    }
    if (!approval.value) return

    try {
      await ElMessageBox.confirm('确认审批通过？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
    } catch {
      return
    }

    passLoading.value = true
    try {
      const result = await request.post('/api/approval/pass', {
        id: approval.value.id,
        reason: approvalForm.reason,
      })
      if (result.code === 200) {
        approval.value.status = '已通过'
        const now = new Date()
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        approval.value.records.push({
          operator: '当前用户',
          action: '审批通过',
          time: timeStr,
          type: 'success',
          result: '已通过',
          resultType: 'success',
        })
        ElMessage.success('审批通过')
        emit('update:modelValue', false)
        emit('pass', approval.value)
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
    if (!approval.value) return

    try {
      await ElMessageBox.confirm('确认审批不通过？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
    } catch {
      return
    }

    rejectLoading.value = true
    try {
      const result = await request.post('/api/approval/reject', {
        id: approval.value.id,
        reason: approvalForm.reason,
      })
      if (result.code === 200) {
        approval.value.status = '已拒绝'
        const now = new Date()
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        approval.value.records.push({
          operator: '当前用户',
          action: '审批拒绝',
          time: timeStr,
          type: 'danger',
          result: '已拒绝',
          resultType: 'danger',
        })
        ElMessage.success('已拒绝该审批')
        emit('update:modelValue', false)
        emit('reject', approval.value)
      }
    } catch {
      ElMessage.error('操作失败')
    } finally {
      rejectLoading.value = false
    }
  }
</script>

<style lang="scss" scoped>
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
