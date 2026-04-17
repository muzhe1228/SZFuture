<template>
  <Dialog v-model="dialogVisible" :title="isEditMode ? '修改订单' : '新增订单'" width="720px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="orderFormRef" :model="orderForm" :rules="orderFormRules" label-width="110px" label-position="right" class="order-form">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开户账户" prop="account">
            <el-select v-model="orderForm.account" placeholder="请选择" style="width: 100%">
              <el-option label="xx科技有限公司" value="xx科技有限公司" />
              <el-option label="测试客户A" value="测试客户A" />
              <el-option label="测试客户B" value="测试客户B" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订单编号" prop="orderNo">
            <el-input v-model="orderForm.orderNo" placeholder="编号规则" clearable />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="授权数量" prop="authCount">
            <el-input-number
              v-model="orderForm.authCount"
              :min="1"
              :max="9999"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产品名称" prop="productName">
            <el-select
              v-model="orderForm.productName"
              placeholder="请选择"
              style="width: 100%"
              @change="handleProductChange"
            >
              <el-option label="产品A" value="产品A" />
              <el-option label="产品B" value="产品B" />
              <el-option label="产品C" value="产品C" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="产品版本" prop="productVersion">
            <el-select v-model="orderForm.productVersion" placeholder="请选择" style="width: 100%">
              <el-option v-for="version in availableVersions" :key="version" :label="version" :value="version" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="许可模板" prop="licenseTemplate">
            <el-select
              v-model="orderForm.licenseTemplate"
              placeholder="请选择"
              style="width: 100%"
              @change="handleLicenseTemplateChange"
            >
              <el-option label="模版A" value="模版A" />
              <el-option label="模版B" value="模版B" />
              <el-option label="模版C" value="模版C" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="许可类型" prop="licenseType">
            <el-select v-model="orderForm.licenseType" placeholder="请选择" style="width: 100%">
              <el-option label="永久许可" value="永久许可" />
              <el-option label="订阅许可" value="订阅许可" />
              <el-option label="试用许可" value="试用许可" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="授权起始日期" prop="authStartDate">
            <el-date-picker
              v-model="orderForm.authStartDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="授权结束日期" prop="authEndDate">
            <el-date-picker
              v-model="orderForm.authEndDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="浮动许可" prop="floatingEnabled">
            <el-switch
              v-model="orderForm.floatingEnabled"
              active-text="是"
              inactive-text="否"
              inline-prompt
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="orderForm.floatingEnabled" :gutter="20">
        <el-col :span="12">
          <el-form-item label="浮动许可数量" prop="floatingLicense">
            <el-input-number
              v-model="orderForm.floatingLicense"
              :min="1"
              :max="9999"
              controls-position="right"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="订单备注">
        <el-input
          v-model="orderForm.remarks"
          type="textarea"
          :rows="3"
          placeholder="请输入订单备注"
          style="width: 100%"
        />
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
import type { Order } from '@/types/index'

const props = defineProps<{
  modelValue: boolean
  isEditMode: boolean
  order: Order | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [order: Order, isEdit: boolean]
  'close': []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const orderFormRef = ref<FormInstance>()
const submitLoading = ref(false)

const orderForm = reactive({
  account: '',
  orderNo: '',
  authCount: 1,
  productName: '',
  productVersion: '',
  licenseTemplate: '',
  licenseType: '',
  authStartDate: '',
  authEndDate: '',
  floatingEnabled: false,
  floatingLicense: '1',
  remarks: ''
})

const orderFormRules: FormRules = {
  account: [{ required: true, message: '请选择开户账户', trigger: 'change' }],
  orderNo: [{ required: true, message: '请输入订单编号', trigger: 'blur' }],
  authCount: [{ required: true, message: '请输入授权数量', trigger: 'blur' }],
  productName: [{ required: true, message: '请选择产品名称', trigger: 'change' }],
  productVersion: [{ required: true, message: '请选择产品版本', trigger: 'change' }],
  licenseTemplate: [{ required: true, message: '请选择许可模板', trigger: 'change' }],
  licenseType: [{ required: true, message: '请选择许可类型', trigger: 'change' }],
  authStartDate: [{ required: true, message: '请选择授权起始日期', trigger: 'change' }],
  authEndDate: [{ required: true, message: '请选择授权结束日期', trigger: 'change' }]
}

// Product & Version Mapping
const versionMap: Record<string, string[]> = {
  '产品A': ['V1.0', 'V2.0', 'V3.0'],
  '产品B': ['V1.0', 'V2.0'],
  '产品C': ['V1.0', 'V3.0']
}

const availableVersions = computed(() => {
  if (!orderForm.productName) return []
  return versionMap[orderForm.productName] || []
})

const handleProductChange = () => {
  orderForm.productVersion = ''
}

// License Template -> Default License Type
const licenseTemplateDefaultMap: Record<string, string> = {
  '模版A': '永久许可',
  '模版B': '订阅许可',
  '模版C': '试用许可'
}

const handleLicenseTemplateChange = () => {
  const tpl = orderForm.licenseTemplate
  if (tpl && licenseTemplateDefaultMap[tpl]) {
    orderForm.licenseType = licenseTemplateDefaultMap[tpl]
  }
}

const resetOrderForm = () => {
  orderForm.account = ''
  orderForm.orderNo = ''
  orderForm.authCount = 1
  orderForm.productName = ''
  orderForm.productVersion = ''
  orderForm.licenseTemplate = ''
  orderForm.licenseType = ''
  orderForm.authStartDate = ''
  orderForm.authEndDate = ''
  orderForm.floatingEnabled = false
  orderForm.floatingLicense = '1'
  orderForm.remarks = ''
  orderFormRef.value?.clearValidate()
}

const handleSubmit = async () => {
  if (!orderFormRef.value) return
  try {
    await orderFormRef.value.validate()
    submitLoading.value = true

    const order: Order = {
      id: props.order?.id || Date.now(),
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      customerName: orderForm.account,
      account: orderForm.account,
      orderNo: orderForm.orderNo,
      authCount: orderForm.authCount,
      productName: orderForm.productName,
      productVersion: orderForm.productVersion,
      licenseTemplate: orderForm.licenseTemplate,
      licenseType: orderForm.licenseType,
      authStartDate: orderForm.authStartDate,
      authEndDate: orderForm.authEndDate,
      floatingEnabled: orderForm.floatingEnabled,
      floatingLicense: orderForm.floatingLicense,
      remarks: orderForm.remarks
    }

    emit('submit', order, props.isEditMode)
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
  resetOrderForm()
  emit('close')
}

// Watch for order changes to update form
watch(() => props.order, (newOrder) => {
  if (newOrder) {
    orderForm.account = newOrder.account || ''
    orderForm.orderNo = newOrder.orderNo || ''
    orderForm.authCount = newOrder.authCount || 1
    orderForm.productName = newOrder.productName || ''
    orderForm.productVersion = newOrder.productVersion || ''
    orderForm.licenseTemplate = newOrder.licenseTemplate || ''
    orderForm.licenseType = newOrder.licenseType || ''
    orderForm.authStartDate = newOrder.authStartDate || ''
    orderForm.authEndDate = newOrder.authEndDate || ''
    orderForm.floatingEnabled = newOrder.floatingEnabled || false
    orderForm.floatingLicense = newOrder.floatingLicense || '1'
    orderForm.remarks = newOrder.remarks || ''
  } else {
    resetOrderForm()
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.order-form {
  .el-form-item {
    margin-bottom: 16px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>