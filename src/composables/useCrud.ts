import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

export interface CrudOptions<T> {
  fetchList: () => Promise<void>
  deleteApi?: (id: number) => Promise<void>
  batchDeleteApi?: (ids: number[]) => Promise<void>
  createApi?: (data: T) => Promise<void>
  updateApi?: (data: T) => Promise<void>
  onSubmit?: (data: T, isEdit: boolean) => Promise<void>
  successMessage?: {
    create?: string
    update?: string
    delete?: string
    batchDelete?: string
  }
}

export function useCrud<T extends { id?: number; name?: string }>(
  options: CrudOptions<T> = { fetchList: async () => {} }
) {
  const modalVisible = ref(false)
  const isEditMode = ref(false)
  const editingId = ref<number | null>(null)
  const currentItem = ref<T | null>(null)

  const defaultMessages = {
    create: '新增成功',
    update: '编辑成功',
    delete: '删除成功',
    batchDelete: '批量删除成功',
    ...options.successMessage,
  }

  const handleAdd = () => {
    isEditMode.value = false
    editingId.value = null
    currentItem.value = null
    modalVisible.value = true
  }

  const handleEdit = (item: T) => {
    isEditMode.value = true
    editingId.value = item.id ?? null
    currentItem.value = { ...item }
    modalVisible.value = true
  }

  const handleView = (item: T) => {
    ElMessage.info(`查看: ${item.name || item.id}`)
  }

  const handleDelete = async (item: T) => {
    try {
      await ElMessageBox.confirm(`确定要删除 "${item.name || '该项'}" 吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      if (options.deleteApi && item.id) {
        await options.deleteApi(item.id)
      } else if (options.batchDeleteApi && item.id) {
        await options.batchDeleteApi([item.id])
      }
      ElMessage.success(defaultMessages.delete)
      await options.fetchList()
    } catch {
      // User cancelled
    }
  }

  const handleBatchDelete = async (selectedItems: T[]) => {
    if (selectedItems.length === 0) return

    const ids = selectedItems.filter((item) => item.id).map((item) => item.id!)

    if (ids.length === 0) {
      ElMessage.warning('请选择有效的项目')
      return
    }

    try {
      await ElMessageBox.confirm(`确定要删除选中的 ${selectedItems.length} 项吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      if (options.batchDeleteApi) {
        await options.batchDeleteApi(ids)
      }
      ElMessage.success(defaultMessages.batchDelete)
      await options.fetchList()
    } catch {
      // User cancelled
    }
  }

  const handleSubmit = async (data: T) => {
    try {
      if (options.onSubmit) {
        await options.onSubmit(data, isEditMode.value)
      } else if (isEditMode.value && options.updateApi) {
        await options.updateApi(data)
      } else if (!isEditMode.value && options.createApi) {
        await options.createApi(data)
      }
      modalVisible.value = false
      await options.fetchList()
      ElMessage.success(isEditMode.value ? defaultMessages.update : defaultMessages.create)
    } catch {
      ElMessage.error('操作失败')
    }
  }

  const handleClose = () => {
    modalVisible.value = false
    isEditMode.value = false
    editingId.value = null
    currentItem.value = null
  }

  const openModal = (mode: 'add' | 'edit', item?: T) => {
    isEditMode.value = mode === 'edit'
    editingId.value = mode === 'edit' && item?.id ? item.id : null
    currentItem.value = mode === 'edit' && item ? { ...item } : null
    modalVisible.value = true
  }

  const closeModal = () => {
    modalVisible.value = false
    isEditMode.value = false
    editingId.value = null
    currentItem.value = null
  }

  return {
    modalVisible,
    isEditMode,
    editingId,
    currentItem,
    handleAdd,
    handleEdit,
    handleView,
    handleDelete,
    handleBatchDelete,
    handleSubmit,
    handleClose,
    openModal,
    closeModal,
  }
}

export interface BatchActionOptions {
  apiUrl: string
  confirmMessage?: string
  successMessage?: string
  errorMessage?: string
}

export function useBatchActions() {
  const loading = ref(false)

  const executeBatchAction = async <T extends { id: number }>(
    selectedItems: T[],
    options: BatchActionOptions
  ): Promise<boolean> => {
    if (selectedItems.length === 0) {
      ElMessage.warning('请选择要操作的项目')
      return false
    }

    const ids = selectedItems.map((item) => item.id)
    const confirmMsg = options.confirmMessage || `确定要对选中的 ${selectedItems.length} 项执行此操作吗？`

    try {
      await ElMessageBox.confirm(confirmMsg, '操作确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })

      loading.value = true
      const result = await request.post(options.apiUrl, { ids })

      if (result.code === 200) {
        ElMessage.success(options.successMessage || '操作成功')
        return true
      } else {
        ElMessage.error(options.errorMessage || result.message || '操作失败')
        return false
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(options.errorMessage || '操作失败')
      }
      return false
    } finally {
      loading.value = false
    }
  }

  const freezeBatch = async <T extends { id: number }>(
    selectedItems: T[],
    reason: string,
    apiUrl: string = '/api/trial/freeze'
  ): Promise<boolean> => {
    if (selectedItems.length === 0) {
      ElMessage.warning('请选择要冻结的项目')
      return false
    }

    const ids = selectedItems.map((item) => item.id)

    try {
      loading.value = true
      const result = await request.post(apiUrl, { ids, reason })

      if (result.code === 200) {
        ElMessage.success('冻结成功')
        return true
      } else {
        ElMessage.error(result.message || '冻结失败')
        return false
      }
    } catch {
      ElMessage.error('操作失败')
      return false
    } finally {
      loading.value = false
    }
  }

  const voidBatch = async <T extends { id: number }>(
    selectedItems: T[],
    reason: string,
    approver: string,
    apiUrl: string = '/api/trial/void'
  ): Promise<boolean> => {
    if (selectedItems.length === 0) {
      ElMessage.warning('请选择要作废的项目')
      return false
    }

    const ids = selectedItems.map((item) => item.id)

    try {
      loading.value = true
      const result = await request.post(apiUrl, { ids, reason, approver })

      if (result.code === 200) {
        ElMessage.success('作废成功')
        return true
      } else {
        ElMessage.error(result.message || '作废失败')
        return false
      }
    } catch {
      ElMessage.error('操作失败')
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    executeBatchAction,
    freezeBatch,
    voidBatch,
  }
}
