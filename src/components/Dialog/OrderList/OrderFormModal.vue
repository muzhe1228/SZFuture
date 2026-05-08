<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditMode ? '修改订单' : '新增订单'"
    width="720px"
    :close-on-click-modal="false"
    @close="resetModal"
  >
    <el-form
      ref="orderFormRef"
      :model="orderForm"
      :rules="orderFormRules"
      label-width="110px"
      label-position="right"
      class="order-form"
    >
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
              :controls="false"
              align="left"
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
            <el-select
              v-model="orderForm.productVersion"
              placeholder="请先选择产品名称"
              style="width: 100%"
              :disabled="!orderForm.productName"
            >
              <el-option v-for="v in availableVersions" :key="v" :label="v" :value="v" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="许可模版" prop="licenseTemplate">
            <el-select
              v-model="orderForm.licenseTemplate"
              placeholder="请选择"
              style="width: 100%"
              @change="handleLicenseTemplateChange"
            >
              <el-option label="模版A - 标准版" value="模版A" />
              <el-option label="模版B - 企业版" value="模版B" />
              <el-option label="模版C - 试用版" value="模版C" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="许可类型" prop="licenseType">
            <el-select v-model="orderForm.licenseType" placeholder="根据许可模版显示默认值" style="width: 100%">
              <el-option label="永久许可" value="永久许可" />
              <el-option label="订阅许可" value="订阅许可" />
              <el-option label="试用许可" value="试用许可" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="浮动许可" prop="floatingLicense">
            <div class="floating-license-field">
              <el-switch v-model="orderForm.floatingEnabled" />
              <el-input-number
                v-if="orderForm.floatingEnabled"
                v-model="orderForm.floatingLicense"
                placeholder="请输入浮动许可数量"
                :controls="false"
                align="left"
                :min="0"
                style="width: 120px; margin-left: 8px"
              />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="授权起始" prop="authStartDate">
            <el-date-picker
              v-model="orderForm.authStartDate"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="授权结束" prop="authEndDate">
            <el-date-picker
              v-model="orderForm.authEndDate"
              type="datetime"
              placeholder="选择日期时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="功能权限" prop="permissions">
        <div class="permission-grid">
          <div v-for="perm in permissionsList" :key="perm.name" class="permission-item">
            <el-checkbox v-model="perm.checked" @change="handlePermissionChange">
              {{ perm.name }}
            </el-checkbox>
            <el-input-number
              v-model="perm.limit"
              :min="0"
              :max="9999"
              :disabled="!perm.checked"
              :controls="false"
              align="left"
              size="small"
              style="width: 90px"
            />
          </div>
        </div>
      </el-form-item>
      <el-form-item label="订单备注" prop="remarks">
        <el-input v-model="orderForm.remarks" type="textarea" :rows="3" placeholder="请输入订单备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  // ─── Props ──────────────────────────────────────────────────────

  interface Order {
    id: number
    orderNo: string
    createTime: string
    customerName: string
    authCount: number
    authStartDate: string
    authEndDate: string
  }

  interface Props {
    modelValue: boolean
    isEditMode: boolean
    order?: Order | null
  }

  const props = defineProps<Props>()

  // ─── Emits ──────────────────────────────────────────────────────

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'submit', order: any): void
  }>()

  // ─── Reactive Data ─────────────────────────────────────────────

  const dialogVisible = ref(props.modelValue)
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
    floatingLicense: '',
    remarks: '',
  })

  const orderFormRules: FormRules = {
    account: [{ required: true, message: '请选择开户账户', trigger: 'change' }],
    orderNo: [{ required: true, message: '请输入订单编号', trigger: 'blur' }],
    authCount: [{ required: true, message: '请输入授权数量', trigger: 'blur' }],
    productName: [{ required: true, message: '请选择产品名称', trigger: 'change' }],
    productVersion: [{ required: true, message: '请选择产品版本', trigger: 'change' }],
    licenseTemplate: [{ required: true, message: '请选择许可模版', trigger: 'change' }],
    licenseType: [{ required: true, message: '请选择许可类型', trigger: 'change' }],
    authStartDate: [{ required: true, message: '请选择授权起始日期', trigger: 'change' }],
    authEndDate: [{ required: true, message: '请选择授权结束日期', trigger: 'change' }],
  }

  // ─── Permission Grid ─────────────────────────────────────────────────

  interface PermissionItem {
    name: string
    checked: boolean
    limit: number
  }

  const defaultPermissions: PermissionItem[] = [
    { name: '功能模块A', checked: false, limit: 0 },
    { name: '功能模块B', checked: false, limit: 0 },
    { name: '功能模块C', checked: false, limit: 0 },
    { name: '功能模块D', checked: false, limit: 0 },
    { name: '功能模块E', checked: false, limit: 0 },
    { name: '功能模块F', checked: false, limit: 0 },
    { name: '功能模块G', checked: false, limit: 0 },
    { name: '功能模块H', checked: false, limit: 0 },
    { name: '功能模块I', checked: false, limit: 0 },
    { name: '功能模块J', checked: false, limit: 0 },
    { name: '功能模块K', checked: false, limit: 0 },
    { name: '功能模块L', checked: false, limit: 0 },
  ]

  const permissionsList = ref<PermissionItem[]>(defaultPermissions.map((p) => ({ ...p })))

  const resetPermissions = () => {
    permissionsList.value = defaultPermissions.map((p) => ({ ...p }))
  }

  const handlePermissionChange = () => {
    // Optional: react to permission changes
  }

  // ─── Product & Version Mapping ───────────────────────────────────────

  const versionMap: Record<string, string[]> = {
    产品A: ['V1.0', 'V2.0', 'V3.0'],
    产品B: ['V1.0', 'V2.0'],
    产品C: ['V1.0', 'V3.0'],
  }

  const availableVersions = computed(() => {
    if (!orderForm.productName) return []
    return versionMap[orderForm.productName] || []
  })

  const handleProductChange = () => {
    orderForm.productVersion = ''
  }

  // ─── License Template -> Default License Type ────────────────────────

  const licenseTemplateDefaultMap: Record<string, string> = {
    模版A: '永久许可',
    模版B: '订阅许可',
    模版C: '试用许可',
  }

  const handleLicenseTemplateChange = () => {
    const tpl = orderForm.licenseTemplate
    if (tpl && licenseTemplateDefaultMap[tpl]) {
      orderForm.licenseType = licenseTemplateDefaultMap[tpl]
    }
  }

  // ─── Watch ─────────────────────────────────────────────────────

  import { watch } from 'vue'

  watch(
    () => props.modelValue,
    (newValue) => {
      dialogVisible.value = newValue
      if (newValue) {
        if (props.order) {
          orderForm.account = props.order.customerName
          orderForm.orderNo = props.order.orderNo
          orderForm.authCount = props.order.authCount
          orderForm.authStartDate = props.order.authStartDate
          orderForm.authEndDate = props.order.authEndDate
        } else {
          resetForm()
        }
      }
    }
  )

  watch(
    () => props.order,
    (newValue) => {
      if (newValue) {
        orderForm.account = newValue.customerName
        orderForm.orderNo = newValue.orderNo
        orderForm.authCount = newValue.authCount
        orderForm.authStartDate = newValue.authStartDate
        orderForm.authEndDate = newValue.authEndDate
      }
    }
  )

  watch(dialogVisible, (newValue) => {
    emit('update:modelValue', newValue)
  })

  // ─── Methods ───────────────────────────────────────────────────

  const resetForm = () => {
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
    orderForm.floatingLicense = ''
    orderForm.remarks = ''
    resetPermissions()
    orderFormRef.value?.clearValidate()
  }

  const resetModal = () => {
    resetForm()
  }

  const handleSubmit = async () => {
    if (!orderFormRef.value) return
    await orderFormRef.value.validate(async (valid) => {
      if (!valid) return

      submitLoading.value = true
      await new Promise((resolve) => setTimeout(resolve, 600))

      ElMessage.success(props.isEditMode ? '订单修改成功' : '订单新增成功')
      emit('submit', orderForm)
      emit('update:modelValue', false)
      submitLoading.value = false
    })
  }
</script>

<style lang="scss" scoped>
  .order-form {
    .floating-license-field {
      display: flex;
      align-items: center;
    }
  }

  .permission-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px 16px;
    width: 100%;
  }

  .permission-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;

    .el-checkbox {
      flex-shrink: 0;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
</style>
