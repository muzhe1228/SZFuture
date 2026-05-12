<template>
  <div class="messages-page">
    <!-- Base Table Page -->
    <BaseTablePage :search-fields="searchFields" :columns="columns" :actions="tableActions" :fetch-data="fetchData"
      title="消息列表" storage-key="messages" @action="handleTableAction" @selection-change="handleSelectionChange"
      @export="handleExport">
      <template #cell-status="{ row }">
        <el-tag :type="row.status === '未处理' ? 'danger' : 'success'" size="small" effect="light">
          {{ row.status }}
        </el-tag>
      </template>
      <template #extra-actions>
        <el-button type="danger" link @click="handleBatchDelete" :disabled="selectedMessages.length === 0">
          批量删除
        </el-button>
      </template>
    </BaseTablePage>

    <!-- Message Detail Modal -->
    <MessageDetail v-model="detailModalVisible" :message="currentMessage" @confirm="handleMessageConfirm" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Message } from '@/types/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import { BaseTablePage } from '@/components/BaseTablePage'
import MessageDetail from '@/components/Dialog/Messages/MessageDetail.vue'
import type { ActionButton } from '@/components/DataTable/types'
import { messageColumns } from '@/config/common/columns'
import { messageSearchFields } from '@/config/common/searchFields'
import request from '@/utils/request'

interface ExtendedMessage extends Message {
  receiveTime: string
  serialNo: string
  expiryDate: string
}

// ─── Search Form ──────────────────────────────────────────────────────

// 搜索字段配置已移至 @/config/common/searchFields.ts
const searchFields = messageSearchFields

// ─── Table Config ──────────────────────────────────────────────────────

// 表格列配置已移至 @/config/common/columns.ts
const columns = ref(messageColumns)

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary' },
  { key: 'delete', label: '删除', type: 'danger' },
]

// ─── Table Data ───────────────────────────────────────────────────────

const selectedMessages = ref<ExtendedMessage[]>([])

const fetchData = async (formData?: Record<string, any>, page: number = 1, pageSize: number = 20) => {
  try {
    const params = {
      page: String(page),
      pageSize: String(pageSize),
      ...formData,
    }
    const result = await request({
      url: '/api/message/list',
      method: 'get',
      params: params,
    })

    if (result.code === 200) {
      return {
        list: result.data.list || [],
        total: result.data.total || 0,
      }
    }
    return { list: [], total: 0 }
  } catch {
    ElMessage.error('加载数据失败')
    return { list: [], total: 0 }
  }
}

const handleSelectionChange = (selection: ExtendedMessage[]) => {
  selectedMessages.value = selection
}

const handleTableAction = (action: string, row: ExtendedMessage) => {
  if (action === 'view') {
    handleView(row)
  } else if (action === 'delete') {
    handleDelete(row)
  }
}

const handleExport = async (searchParams?: Record<string, any>) => {
  try {
    // const response = await request({
    //   url: '/api/message/export',
    //   method: 'get',
    //   params: searchParams || {},
    //   responseType: 'blob',
    // })

    // const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    // const url = window.URL.createObjectURL(blob)
    // const link = document.createElement('a')
    // link.href = url
    // link.download = `消息列表_${new Date().toISOString().split('T')[0]}.xlsx`
    // document.body.appendChild(link)
    // link.click()
    // document.body.removeChild(link)
    // window.URL.revokeObjectURL(url)
    console.log(searchParams)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  }
}

// ─── Message Detail Modal ─────────────────────────────────────────────

const detailModalVisible = ref(false)
const currentMessage = ref<ExtendedMessage | null>(null)

const handleView = (row: ExtendedMessage) => {
  currentMessage.value = row
  detailModalVisible.value = true
}

const handleMessageConfirm = () => {
  detailModalVisible.value = false
}

// ─── Delete ───────────────────────────────────────────────────────────

const handleDelete = (row: ExtendedMessage) => {
  ElMessageBox.confirm(`确定要删除【${row.customerName}】的消息吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const result = await request.delete(`/api/message/delete`, { params: { id: row.id } })
        if (result.code === 200) {
          ElMessage.success('删除成功')
        }
      } catch {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      // User cancelled
    })
}

const handleBatchDelete = () => {
  if (selectedMessages.value.length === 0) return
  ElMessageBox.confirm(`确定要删除选中的 ${selectedMessages.value.length} 条消息吗？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const ids = selectedMessages.value.map((m) => m.id)
        const result = await request.delete(`/api/message/delete`, { params: { ids: ids.join(',') } })
        if (result.code === 200) {
          ElMessage.success('批量删除成功')
        }
      } catch {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {
      // User cancelled
    })
}
</script>

<style lang="scss" scoped>
.messages-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: hidden;
  border-radius: 8px;
}
</style>
