<template>
  <div class="license-template-config">
    <!-- Base Table Page -->
    <BaseTablePage :search-fields="searchFields" :columns="columns" :actions="tableActions" :fetch-data="fetchData"
      title="许可模版配置" storage-key="license-template-config" :show-column-settings="true" :show-selection="true"
      @action="handleTableAction" @selection-change="handleSelectionChange">
      <template #cell-status="{ row }">
        <StatusTag :status="row.status" mode="dot" />
      </template>
      <template #extra-actions>
        <el-button type="primary" link @click="handleAdd" :icon="Plus"> 新增模版 </el-button>
        <el-button type="danger" link plain :icon="Delete" :disabled="selectedRows.length === 0"
          @click="handleBatchDelete">
          删除模版
        </el-button>
      </template>
    </BaseTablePage>

    <!-- Add/Edit Template Modal -->
    <TemplateForm v-model="templateModalVisible" :is-edit-mode="isEditMode" :template="currentTemplate"
      :product-module-options="productModuleOptions" @submit="handleTemplateSubmit" @close="handleModalClose" />

    <!-- View Detail Dialog -->
    <ViewModal v-model="viewDialogVisible" :data="viewingTemplate" :title="'许可模版详情'" :columns="columns" />

    <!-- Delete Modal -->
    <DeleteModal v-model="deleteModalVisible" :title-text="currentDeleteTemplate?.name" @confirm="confirmDelete" />

    <!-- Batch Delete Modal -->
    <DeleteModal mode="batch" v-model="batchDeleteModalVisible" :title-text="selectedRows.length"
      @confirm="confirmBatchDelete" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { LicenseTemplate } from '@/types/index'
import { ElMessage } from 'element-plus'
import { BaseTablePage } from '@/components/BaseTablePage'
import { StatusTag } from '@/components/StatusTag'
import TemplateForm from '@/components/Dialog/LicenseTemplateConfig/TemplateForm.vue'
import ViewModal from '@/components/Dialog/common/ViewModal.vue'
import DeleteModal from '@/components/Dialog/common/DeleteModal.vue'
import type { ActionButton } from '@/components/DataTable/types'
import { licenseTemplateColumns } from '@/config/product/columns'
import { licenseTemplateSearchFields } from '@/config/product/searchFields'
import request from '@/utils/request'

// ─── Search Form ──────────────────────────────────────────────────────

// 搜索字段配置已移至 @/config/product/searchFields.ts
const searchFields = licenseTemplateSearchFields

// ─── Table Config ─────────────────────────────────────────────────────

// 表格列配置已移至 @/config/product/columns.ts
const columns = ref(licenseTemplateColumns)

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary', icon: 'IconShow' },
  { key: 'edit', label: '修改', type: 'success', icon: 'IconEdit' },
  { key: 'delete', label: '删除', type: 'danger', icon: 'IconDel' },
]

// ─── Selection ────────────────────────────────────────────────────────

const selectedRows = ref<LicenseTemplate[]>([])

const handleSelectionChange = (selection: LicenseTemplate[]) => {
  selectedRows.value = selection
}

const handleTableAction = (action: string, row: LicenseTemplate) => {
  if (action === 'view') {
    handleView(row)
  } else if (action === 'edit') {
    handleEdit(row)
  } else if (action === 'delete') {
    handleDelete(row)
  }
}

// ─── Product Module Options ───────────────────────────────────────────

const productModuleOptions = ref([
  { label: '产品名称 / 版本号', value: 1 },
  { label: '产品名称1 / 版本号1', value: 2 },
  { label: '产品名称2 / 版本号2', value: 3 },
])

// ─── Fetch Data ───────────────────────────────────────────────────────

const fetchData = async (formData?: Record<string, any>, page: number = 1, pageSize: number = 20) => {
  try {
    const result = await request.get('/api/license-template/list', {
      params: {
        page: String(page),
        pageSize: String(pageSize),
        ...formData,
      },
    })
    if (result.code === 200) {
      // 映射mock数据中的字段名称到LicenseTemplate类型的字段名称
      const list = (result.data.list || []).map((item: any) => ({
        id: item.id,
        name: item.templateName,
        productName: item.productName || '未设置',
        version: item.version || '未设置',
        licenseType: item.templateType,
        status: item.templateStatus,
        createTime: item.createTime,
      }))
      return {
        list,
        total: result.data.total || 0,
      }
    }
    return { list: [], total: 0 }
  } catch {
    ElMessage.error('加载数据失败')
    return { list: [], total: 0 }
  }
}

// ─── Action Handlers ──────────────────────────────────────────────────

const handleAdd = () => {
  isEditMode.value = false
  currentTemplate.value = null
  templateModalVisible.value = true
}

const handleView = (row: LicenseTemplate) => {
  viewingTemplate.value = row
  viewDialogVisible.value = true
}

const handleEdit = (row: LicenseTemplate) => {
  isEditMode.value = true
  editingTemplateId.value = row.id
  currentTemplate.value = row
  templateModalVisible.value = true
}

const handleDelete = (row: LicenseTemplate) => {
  currentDeleteTemplate.value = row
  deleteModalVisible.value = true
}

const confirmDelete = () => {
  currentDeleteTemplate.value = null
  deleteModalVisible.value = false
  ElMessage.success('删除成功')
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的模版')
    return
  }
  batchDeleteModalVisible.value = true
}

const confirmBatchDelete = () => {
  batchDeleteModalVisible.value = false
  ElMessage.success('批量删除成功')
}

// ─── Template Modal ───────────────────────────────────────────────────

const templateModalVisible = ref(false)
const deleteModalVisible = ref(false)
const batchDeleteModalVisible = ref(false)
const isEditMode = ref(false)
const editingTemplateId = ref<number | null>(null)
const viewDialogVisible = ref(false)
const viewingTemplate = ref<LicenseTemplate | null>(null)
const currentTemplate = ref<LicenseTemplate | null>(null)
const currentDeleteTemplate = ref<LicenseTemplate | null>(null)

const handleTemplateSubmit = async (_template: LicenseTemplate, isEdit: boolean) => {
  try {
    templateModalVisible.value = false
    await new Promise((resolve) => setTimeout(resolve, 800))

    ElMessage.success(isEdit ? '编辑成功' : '新增成功')
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleModalClose = () => {
  isEditMode.value = false
  editingTemplateId.value = null
}
</script>

<style lang="scss" scoped>
.license-template-config {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
}

// ─── Status Cell ─────────────────────────────────────────────────────

.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-enabled {
  background-color: #67c23a;
  color: #67c23a;
}

.status-disabled {
  background-color: var(--el-text-color-secondary);
}

// ─── Modal ───────────────────────────────────────────────────────────

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;

  &-title {
    font-size: 14px;
    font-weight: 500;

    white-space: nowrap;
  }
}

.divider {
  flex: 1;
  height: 1px;
  background-color: #ebeef5;
}

.template-form {
  padding: 8px 0;
}

// ─── Function Grid ───────────────────────────────────────────────────

.function-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 6px 0;
  width: 100%;
}

.function-item {
  display: flex;
  align-items: center;

  :deep(.el-checkbox) {
    .el-checkbox__label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      border-radius: 4px;
      width: 100%;
      justify-content: center;
      transition: border-color 0.2s;
    }

    &.is-checked .el-checkbox__label {
      background-color: #ecf5ff;
    }
  }

  .function-name {
    font-size: 13px;
    font-weight: 500;
  }
}

// ─── Dialog Footer ───────────────────────────────────────────────────

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// ─── Responsive ──────────────────────────────────────────────────────

@media (max-width: 992px) {
  .function-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 576px) {
  .function-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
