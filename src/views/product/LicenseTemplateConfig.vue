<template>
  <div class="license-template-config">
    <!-- Search Bar -->
    <SearchForm
      :fields="searchFields"
      storage-key="license-template-config-search"
      @search="handleSearch"
      @reset="handleReset"
      :search-loading="tableLoading"
      :reset-loading="tableLoading"
    />

    <!-- Data Table -->
    <DataTable
      :columns="columns"
      :data="filteredTableData"
      :loading="tableLoading"
      :total="pagination.total"
      :current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      :page-sizes="[10, 20, 50, 100]"
      title="许可模版配置"
      storage-key="license-template-config-table"
      :show-column-settings="true"
      :show-selection="true"
      :actions="tableActions"
      row-key="id"
      @page-change="handlePageChange"
      @selection-change="handleSelectionChange"
      @action="handleTableAction"
    >
      <template #cell-status="{ row }">
        <span class="status-cell">
          <span class="status-dot" :class="row.status === '启用' ? 'status-enabled' : 'status-disabled'"></span>
          {{ row.status }}
        </span>
      </template>
      <template #extra-actions>
        <el-button type="primary" size="small" @click="handleAdd" :icon="Plus">
          新增模版
        </el-button>
        <el-button type="danger" size="small" plain :icon="Delete" :disabled="selectedRows.length === 0" @click="handleBatchDelete">
          删除模版
        </el-button>
      </template>
    </DataTable>

    <!-- Add/Edit Template Modal -->
    <TemplateForm 
      v-model="templateModalVisible" 
      :is-edit-mode="isEditMode" 
      :template="currentTemplate" 
      :product-module-options="productModuleOptions" 
      @submit="handleTemplateSubmit" 
      @close="handleModalClose" 
    />

    <!-- View Detail Dialog -->
    <el-dialog
      v-model="viewDialogVisible"
      title="许可模版详情"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border v-if="viewingTemplate">
        <el-descriptions-item label="模版名称">{{ viewingTemplate.name }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{ viewingTemplate.productName }}</el-descriptions-item>
        <el-descriptions-item label="版本号">{{ viewingTemplate.version }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <span class="status-cell">
            <span class="status-dot" :class="viewingTemplate.status === '启用' ? 'status-enabled' : 'status-disabled'"></span>
            {{ viewingTemplate.status }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ viewingTemplate.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { LicenseTemplate } from '@/types/index'
import { ElMessage, ElMessageBox } from 'element-plus'
import SearchForm from '@/components/SearchForm.vue'
import { DataTable } from '@/components/DataTable'
import TemplateForm from '@/components/Dialog/LicenseTemplateConfig/TemplateForm.vue'
import type { ColumnConfig, ActionButton } from '@/components/DataTable/types'
import type { SearchField } from '@/components/SearchForm/types'
import request from '@/utils/request'

// ─── Search Form ──────────────────────────────────────────────────────

const searchFields = computed<SearchField[]>(() => [
  { prop: 'name', label: '名称', type: 'input', placeholder: '请输入' },
  { prop: 'productName', label: '产品名称', type: 'input', placeholder: '请输入' },
  { prop: 'version', label: '版本号', type: 'input', placeholder: '请输入' },
  { prop: 'licenseType', label: '许可类型', type: 'input', placeholder: '请输入' },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择',
    options: [
      { label: '启用', value: '启用' },
      { label: '停用', value: '停用' }
    ]
  }
])

const currentFilters = ref<Record<string, any>>({})

const handleSearch = (formData: Record<string, any>) => {
  currentFilters.value = { ...formData }
  pagination.currentPage = 1
  fetchData()
}

const handleReset = () => {
  currentFilters.value = {}
  pagination.currentPage = 1
  fetchData()
  ElMessage.success('重置成功')
}

// ─── Table Config ─────────────────────────────────────────────────────

const columns = ref<ColumnConfig[]>([
  { key: 'name', label: '许可模版名称', prop: 'name', minWidth: '160', visible: true },
  { key: 'productName', label: '产品名称', prop: 'productName', minWidth: '140', visible: true },
  { key: 'licenseType', label: '许可类型', prop: 'licenseType', minWidth: '120', visible: true },
  { key: 'status', label: '状态', prop: 'status', width: '100', align: 'center', visible: true, hasTemplate: true },
  { key: 'createTime', label: '创建时间', prop: 'createTime', minWidth: '180', visible: true }
])

const tableActions: ActionButton[] = [
  { key: 'view', label: '查看', type: 'primary' },
  { key: 'edit', label: '修改', type: 'success' },
  { key: 'delete', label: '删除', type: 'danger' }
]

// ─── Table Data ───────────────────────────────────────────────────────

const tableLoading = ref(false)
const tableData = ref<LicenseTemplate[]>([])

// ─── Filtered Data ────────────────────────────────────────────────────

const filteredTableData = computed(() => {
  return tableData.value.filter((row) => {
    const nameMatch = !currentFilters.value.name || row.name.includes(currentFilters.value.name)
    const productNameMatch = !currentFilters.value.productName || row.productName.includes(currentFilters.value.productName)
    const versionMatch = !currentFilters.value.version || (row.version && row.version.includes(currentFilters.value.version))
    const licenseTypeMatch = !currentFilters.value.licenseType || (row.licenseType && row.licenseType === currentFilters.value.licenseType)
    const statusMatch = !currentFilters.value.status || row.status === currentFilters.value.status
    return nameMatch && productNameMatch && versionMatch && licenseTypeMatch && statusMatch
  })
})

// ─── Pagination ───────────────────────────────────────────────────────

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

const handlePageChange = (page: number, size: number) => {
  pagination.currentPage = page
  pagination.pageSize = size
  fetchData()
}

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
  { label: '产品名称2 / 版本号2', value: 3 }
])

// ─── Fetch Data ───────────────────────────────────────────────────────

const fetchData = async () => {
  tableLoading.value = true
  try {
    const result = await request.get('/api/license-template/list', {
      params: {
        page: String(pagination.currentPage),
        pageSize: String(pagination.pageSize),
        ...currentFilters.value
      }
    })
    if (result.code === 200) {
      // 映射mock数据中的字段名称到LicenseTemplate类型的字段名称
      tableData.value = (result.data.list || []).map((item: any) => ({
        id: item.id,
        name: item.templateName,
        productName: item.productName || '未设置',
        version: item.version || '未设置',
        licenseType: item.templateType,
        status: item.templateStatus,
        createTime: item.createTime
      }))
      pagination.total = result.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    tableLoading.value = false
  }
}

// ─── Action Handlers ──────────────────────────────────────────────────

const handleAdd = () => {
  isEditMode.value = false
  currentTemplate.value = null
  templateModalVisible.value = true
}

const handleView = (row: LicenseTemplate) => {
  viewingTemplate.value = {
    id: row.id,
    name: row.name,
    productName: row.productName || '未设置',
    version: row.version || '未设置',
    status: row.status,
    createTime: row.createTime
  }
  viewDialogVisible.value = true
}

const handleEdit = (row: LicenseTemplate) => {
  isEditMode.value = true
  editingTemplateId.value = row.id
  currentTemplate.value = row
  templateModalVisible.value = true
}

const handleDelete = async (row: LicenseTemplate) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模版 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const index = tableData.value.findIndex((t) => t.id === row.id)
    if (index !== -1) {
      tableData.value.splice(index, 1)
      pagination.total = tableData.value.length
    }
    ElMessage.success('删除成功')
  } catch {
    // User cancelled
  }
}

const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的模版')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个模版吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    const idsToDelete = new Set(selectedRows.value.map((r) => r.id))
    tableData.value = tableData.value.filter((t) => !idsToDelete.has(t.id))
    pagination.total = tableData.value.length
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  } catch {
    // User cancelled
  }
}

// ─── Template Modal ───────────────────────────────────────────────────

const templateModalVisible = ref(false)
const isEditMode = ref(false)
const editingTemplateId = ref<number | null>(null)
const viewDialogVisible = ref(false)
const viewingTemplate = ref<LicenseTemplate | null>(null)
const currentTemplate = ref<LicenseTemplate | null>(null)



const handleTemplateSubmit = async (template: LicenseTemplate, isEdit: boolean) => {
  try {
    templateModalVisible.value = false
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const now = new Date()
    const createTime = now.toISOString().replace('T', ' ').substring(0, 19)

    if (isEdit && editingTemplateId.value !== null) {
      const tpl = tableData.value.find((t) => t.id === editingTemplateId.value)
      if (tpl) {
        tpl.name = template.name
        tpl.status = template.status
      }
      ElMessage.success('编辑成功')
    } else {
      const newTemplate: LicenseTemplate = {
        id: Date.now(),
        name: template.name,
        productName: productModuleOptions.value.find((o) => o.value === template.productModuleId)?.label.split(' / ')[0] || '',
        version: productModuleOptions.value.find((o) => o.value === template.productModuleId)?.label.split(' / ')[1] || '',
        status: template.status,
        createTime
      }
      tableData.value.push(newTemplate)
      pagination.total = tableData.value.length
      ElMessage.success('新增成功')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

const handleModalClose = () => {
  isEditMode.value = false
  editingTemplateId.value = null
}

// ─── Lifecycle ────────────────────────────────────────────────────────

onMounted(() => {
  fetchData()
})
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
}

.status-disabled {
  background-color: #909399;
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
    color: #303133;
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
      // border: 1px solid #dcdfe6;
      border-radius: 4px;
      width: 100%;
      justify-content: center;
      transition: border-color 0.2s;

      // &:hover {
      //   border-color: #409eff;
      // }
    }

    &.is-checked .el-checkbox__label {
      // border-color: #409eff;
      background-color: #ecf5ff;
    }
  }

  .function-name {
    font-size: 13px;
    color: #303133;
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