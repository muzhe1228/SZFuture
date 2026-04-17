<template>
  <Dialog v-model="dialogVisible" :title="isEditMode ? '修改客户' : '新增客户'" width="520px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="customerFormRef" :model="customerForm" :rules="customerFormRules" label-width="100px" label-position="right" class="customer-form">
      <el-form-item label="客户名称" prop="name">
        <el-input v-model="customerForm.name" placeholder="请输入账号" clearable />
      </el-form-item>
      <el-form-item label="联系人" prop="contact">
        <el-input v-model="customerForm.contact" placeholder="请输入姓名" clearable />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="customerForm.phone" placeholder="请输入手机号" clearable />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="customerForm.email" placeholder="请输入邮箱" clearable />
      </el-form-item>
      <el-form-item label="销售负责人" prop="salesOwner">
        <el-input v-model="customerForm.salesOwner" placeholder="请输入姓名" clearable />
      </el-form-item>
      <el-form-item label="账户状态" prop="accountStatus">
        <el-radio-group v-model="customerForm.accountStatus">
          <el-radio label="正常" />
          <el-radio label="冻结" />
          <el-radio label="关闭" />
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { Dialog } from '@/components/Dialog'
import type { FormInstance, FormRules } from 'element-plus'
import type { Customer } from '@/types/index'

const props = defineProps<{
  modelValue: boolean
  isEditMode: boolean
  customer: Customer | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [customer: Customer, isEdit: boolean]
  'close': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const customerFormRef = ref<FormInstance>()
const submitLoading = ref(false)

const customerForm = reactive({
  name: '',
  contact: '',
  phone: '',
  email: '',
  salesOwner: '',
  accountStatus: '正常' as '正常' | '冻结' | '关闭'
})

const customerFormRules: FormRules = {
  name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  salesOwner: [{ required: true, message: '请输入销售负责人', trigger: 'blur' }],
  accountStatus: [{ required: true, message: '请选择账户状态', trigger: 'change' }]
}

const resetCustomerForm = () => {
  customerForm.name = ''
  customerForm.contact = ''
  customerForm.phone = ''
  customerForm.email = ''
  customerForm.salesOwner = ''
  customerForm.accountStatus = '正常'
  customerFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!customerFormRef.value) return
  try {
    await customerFormRef.value.validate()
    submitLoading.value = true

    const customer: Customer = {
      id: props.customer?.id || Date.now(),
      name: customerForm.name,
      contact: customerForm.contact,
      phone: customerForm.phone,
      email: customerForm.email,
      salesOwner: customerForm.salesOwner,
      accountStatus: customerForm.accountStatus,
      createDate: props.customer?.createDate || new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-')
    }

    emit('submit', customer, props.isEditMode)
    dialogVisible.value = false
  } catch {
    // Form validation failed
  } finally {
    submitLoading.value = false
  }
}

const handleCancel = () => {
  dialogVisible.value = false
}

const handleClose = () => {
  resetCustomerForm()
  emit('close')
}

// Watch for customer changes to update form
watch(() => props.customer, (newCustomer) => {
  if (newCustomer) {
    customerForm.name = newCustomer.name
    customerForm.contact = newCustomer.contact
    customerForm.phone = newCustomer.phone
    customerForm.email = newCustomer.email || ''
    customerForm.salesOwner = newCustomer.salesOwner || ''
    customerForm.accountStatus = newCustomer.accountStatus
  } else {
    resetCustomerForm()
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.customer-form {
  .el-form-item {
    margin-bottom: 20px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>