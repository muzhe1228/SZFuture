import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

export interface UseFormReturn<T> {
  form: T
  formRef: { value: FormInstance | undefined }
  rules: FormRules
  resetForm: () => void
  validateForm: () => Promise<boolean>
  setFormValue: (values: Partial<T>) => void
  clearValidate: () => void
}

export function useForm<T extends Record<string, any>>(
  defaultValues: T,
  rules: FormRules = {}
): UseFormReturn<T> {
  const formRef = ref<FormInstance>()
  
  const form = reactive({ ...defaultValues }) as T

  const resetForm = () => {
    Object.keys(defaultValues).forEach((key) => {
      (form as Record<string, any>)[key] = defaultValues[key]
    })
    formRef.value?.clearValidate()
  }

  const validateForm = async (): Promise<boolean> => {
    if (!formRef.value) return true
    try {
      await formRef.value.validate()
      return true
    } catch {
      return false
    }
  }

  const setFormValue = (values: Partial<T>) => {
    Object.keys(values).forEach((key) => {
      if (key in form) {
        (form as Record<string, any>)[key] = values[key]
      }
    })
  }

  const clearValidate = () => {
    formRef.value?.clearValidate()
  }

  return {
    form,
    formRef,
    rules,
    resetForm,
    validateForm,
    setFormValue,
    clearValidate,
  }
}

export interface UseModalFormReturn<T> extends UseFormReturn<T> {
  isEditMode: { value: boolean }
  editingId: { value: number | null }
  openModal: (mode: 'add' | 'edit', item?: T) => void
  closeModal: () => void
}

export function useModalForm<T extends Record<string, any>>(
  defaultValues: T,
  rules: FormRules = {}
): UseModalFormReturn<T> {
  const { form, formRef, resetForm, validateForm, setFormValue, clearValidate } = useForm(
    defaultValues,
    rules
  )

  const isEditMode = ref(false)
  const editingId = ref<number | null>(null)

  const openModal = (mode: 'add' | 'edit', item?: T) => {
    isEditMode.value = mode === 'edit'
    editingId.value = mode === 'edit' && item?.id ? item.id : null
    
    if (mode === 'edit' && item) {
      setFormValue(item)
    } else {
      resetForm()
    }
  }

  const closeModal = () => {
    isEditMode.value = false
    editingId.value = null
    resetForm()
  }

  return {
    form,
    formRef,
    rules,
    resetForm,
    validateForm,
    setFormValue,
    clearValidate,
    isEditMode: {
      get value() { return isEditMode.value },
      set value(val: boolean) { isEditMode.value = val }
    },
    editingId: {
      get value() { return editingId.value },
      set value(val: number | null) { editingId.value = val }
    },
    openModal,
    closeModal,
  }
}