export type SearchFieldType =
  | 'input'
  | 'select'
  | 'date'
  | 'daterange'
  | 'datetime'
  | 'datetimerange'
  | 'number'
  | 'custom'

export interface SearchFieldOption {
  label: string
  value: any
}

export interface SearchField {
  prop: string
  label: string
  type: SearchFieldType
  placeholder?: string
  clearable?: boolean
  options?: SearchFieldOption[]
  loadOptions?: () => Promise<SearchFieldOption[]>
  width?: string
  multiple?: boolean
  min?: number
  max?: number
  suffix?: string
  hidden?: boolean
}

export interface SearchFormProps {
  fields: SearchField[]
  storageKey?: string
  showColumnSettings?: boolean
  showReset?: boolean
  showSearch?: boolean
  labelWidth?: string
  inline?: boolean
  defaultValues?: Record<string, any>
}

export interface SearchFormEmits {
  (e: 'search', formData: Record<string, any>): void
  (e: 'reset'): void
  (e: 'column-settings', visibleFields: string[]): void
}
