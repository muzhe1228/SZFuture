import { ref } from 'vue'
import type { ColumnConfig, ActionButton } from '@/components/DataTable/types'

export interface UseTableOptions<T> {
  fetchData: (
    params?: Record<string, any>,
    page?: number,
    pageSize?: number
  ) => Promise<{ list: T[]; total: number }>
  columns?: ColumnConfig[]
  actions?: ActionButton[]
  storageKey?: string
  initialPage?: number
  initialPageSize?: number
}

export interface UseTableReturn {
  data: { value: any[] }
  loading: { value: boolean }
  total: { value: number }
  currentPage: { value: number }
  pageSize: { value: number }
  selectedRows: { value: any[] }
  columns: { value: ColumnConfig[] }
  actions: { value: ActionButton[] }
  fetchData: (params?: Record<string, any>) => Promise<void>
  handlePageChange: (page: number, size: number) => void
  handleSelectionChange: (selection: any[]) => void
  refresh: () => void
}

export function useTable<T extends { id?: number }>(
  options: UseTableOptions<T>
): UseTableReturn {
  const {
    fetchData: fetchDataFn,
    columns = [],
    actions = [],
    initialPage = 1,
    initialPageSize = 20,
  } = options

  const data = ref<any[]>([])
  const loading = ref(false)
  const total = ref(0)
  const currentPage = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const selectedRows = ref<any[]>([])
  const localColumns = ref<ColumnConfig[]>(columns)
  const localActions = ref<ActionButton[]>(actions)

  const fetchData = async (params: Record<string, any> = {}) => {
    loading.value = true
    try {
      const result = await fetchDataFn(params, currentPage.value, pageSize.value)
      data.value = result.list
      total.value = result.total
    } finally {
      loading.value = false
    }
  }

  const handlePageChange = (page: number, size: number) => {
    currentPage.value = page
    pageSize.value = size
    void fetchData()
  }

  const handleSelectionChange = (selection: any[]) => {
    selectedRows.value = selection
  }

  const refresh = () => {
    void fetchData()
  }

  return {
    data: {
      get value() { return data.value },
      set value(val: any[]) { data.value = val }
    },
    loading: {
      get value() { return loading.value },
      set value(val: boolean) { loading.value = val }
    },
    total: {
      get value() { return total.value },
      set value(val: number) { total.value = val }
    },
    currentPage: {
      get value() { return currentPage.value },
      set value(val: number) { currentPage.value = val }
    },
    pageSize: {
      get value() { return pageSize.value },
      set value(val: number) { pageSize.value = val }
    },
    selectedRows: {
      get value() { return selectedRows.value },
      set value(val: any[]) { selectedRows.value = val }
    },
    columns: {
      get value() { return localColumns.value },
      set value(val: ColumnConfig[]) { localColumns.value = val }
    },
    actions: {
      get value() { return localActions.value },
      set value(val: ActionButton[]) { localActions.value = val }
    },
    fetchData,
    handlePageChange,
    handleSelectionChange,
    refresh,
  }
}