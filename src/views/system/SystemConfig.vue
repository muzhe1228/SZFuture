<template>
  <div class="system-config">
    <!-- Header with Save Button -->
    <div class="page-header">
      <el-button type="primary" @click="handleSave" :loading="saveLoading">
        保存
      </el-button>
    </div>

    <!-- Form Content -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      label-width="200px"
      label-position="right"
      class="config-form"
    >
      <!-- Section 1: System Config -->
      <div class="section-card">
        <div class="section-title">系统配置</div>
        <el-form-item label="系统名称" prop="systemName">
          <el-input v-model="form.systemName" placeholder="请输入系统名称" />
        </el-form-item>

        <el-form-item label="系统 logo">
          <el-upload
            class="logo-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleLogoChange"
            accept="image/*"
          >
            <img v-if="form.logoUrl" :src="form.logoUrl" class="logo-preview" />
            <div v-else class="logo-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <span>上传 logo</span>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="登录页背景图">
          <el-upload
            class="bg-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleBgChange"
            accept="image/*"
          >
            <img v-if="form.bgImageUrl" :src="form.bgImageUrl" class="bg-preview" />
            <div v-else class="bg-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <span>上传背景图</span>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="会话超时时间" prop="sessionTimeout">
          <el-input v-model="form.sessionTimeout" placeholder="请输入会话超时时间">
            <template #append>分钟</template>
          </el-input>
        </el-form-item>

        <el-form-item label="密码复杂度要求">
          <div class="password-complexity">
            <div class="complexity-row">
              <span class="complexity-label">字符限制:</span>
              <el-input-number
                v-model="form.passwordMinLength"
                :min="1"
                :max="99"
                controls-position="right"
                class="password-length-input"
              />
              <span class="complexity-separator">至</span>
              <el-input-number
                v-model="form.passwordMaxLength"
                :min="1"
                :max="99"
                controls-position="right"
                class="password-length-input"
              />
            </div>
            <div class="complexity-row">
              <span class="complexity-label">复杂度要求:</span>
              <el-radio-group v-model="form.passwordComplexity">
                <el-radio value="纯数字">纯数字</el-radio>
                <el-radio value="数字+大小写">数字+大小写</el-radio>
                <el-radio value="数字+大小写+特殊字符">数字+大小写+特殊字符</el-radio>
              </el-radio-group>
            </div>
          </div>
        </el-form-item>
      </div>

      <!-- Section 2: SDK Config -->
      <div class="section-card">
        <div class="section-title">SDK配置</div>
        <el-form-item label="许可校验频率" prop="licenseCheckFrequency">
          <el-input v-model="form.licenseCheckFrequency" placeholder="请输入许可校验频率">
            <template #append>次/天</template>
          </el-input>
        </el-form-item>

        <el-form-item label="离线激活有效时长" prop="offlineActivationDuration">
          <el-input v-model="form.offlineActivationDuration" placeholder="请输入离线激活有效时长">
            <template #append>天</template>
          </el-input>
        </el-form-item>

        <el-form-item label="许可状态同步时间间隔" prop="licenseSyncInterval">
          <el-input v-model="form.licenseSyncInterval" placeholder="请输入许可状态同步时间间隔">
            <template #append>小时</template>
          </el-input>
        </el-form-item>
      </div>

      <!-- Section 3: Alert Config -->
      <div class="section-card">
        <div class="section-title">告警配置</div>

        <el-form-item label="系统异常" prop="alertReceiverSystemError">
          <el-select
            v-model="form.alertReceiverSystemError"
            placeholder="请选择告警接收人"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in alertReceiverOptions"
              :key="user.value"
              :label="user.label"
              :value="user.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="接口调用失败" prop="alertReceiverApiError">
          <el-select
            v-model="form.alertReceiverApiError"
            placeholder="请选择告警接收人"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in alertReceiverOptions"
              :key="user.value"
              :label="user.label"
              :value="user.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="许可过期">
          <div class="alert-row">
            <el-select
              v-model="form.alertReceiverLicenseExpiry"
              placeholder="请选择告警接收人"
              filterable
              class="alert-receiver-select"
            >
              <el-option
                v-for="user in alertReceiverOptions"
                :key="user.value"
                :label="user.label"
                :value="user.value"
              />
            </el-select>
            <span class="alert-threshold-label">告警触发阈值:</span>
            <span class="threshold-prefix">过期前</span>
            <el-input-number
              v-model="form.alertTriggerThreshold"
              :min="1"
              :max="365"
              controls-position="right"
              class="threshold-input"
            />
            <span class="threshold-suffix">天提醒</span>
          </div>
        </el-form-item>

        <el-form-item label="设备异常绑定" prop="alertReceiverDeviceBind">
          <el-select
            v-model="form.alertReceiverDeviceBind"
            placeholder="请选择告警接收人"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="user in alertReceiverOptions"
              :key="user.value"
              :label="user.label"
              :value="user.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="告警方式">
          <el-checkbox-group v-model="form.alertMethods">
            <el-checkbox value="邮箱">邮箱</el-checkbox>
            <el-checkbox value="站内信息">站内信息</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </div>

      <!-- Section 4: Backup Config -->
      <div class="section-card">
        <div class="section-title">备份配置</div>

        <el-form-item label="自动备份频率">
          <div class="backup-frequency">
            <el-switch
              v-model="form.backupFrequencyEnabled"
              active-text="开启"
              inactive-text="关闭"
              inline-prompt
              @change="handleBackupToggle"
            />
            <el-radio-group v-model="form.backupFrequency" :disabled="!form.backupFrequencyEnabled">
              <el-radio value="每日">每日</el-radio>
              <el-radio value="每周">每周</el-radio>
            </el-radio-group>
          </div>
        </el-form-item>

        <el-form-item label="备份存储路径" prop="backupPath">
          <el-input v-model="form.backupPath" placeholder="请输入备份存储路径" />
        </el-form-item>

        <el-form-item label="备份文件保留时长" prop="backupRetention">
          <el-input v-model="form.backupRetention" placeholder="请输入备份文件保留时长">
            <template #append>天</template>
          </el-input>
        </el-form-item>
      </div>

      <!-- Section 5: Scheduled Tasks -->
      <div class="section-card">
        <div class="section-title">定时任务</div>

        <el-form-item label="工作台统计数据刷新频率" prop="dashboardRefreshRate">
          <el-input v-model="form.dashboardRefreshRate" placeholder="请输入刷新频率">
            <template #append>分钟</template>
          </el-input>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { SystemConfig } from '@/types/index'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'

// ─── Form State ──────────────────────────────────────────────────────

const formRef = ref<FormInstance>()
const saveLoading = ref(false)

interface SystemConfigForm extends SystemConfig {
  backupFrequencyEnabled: boolean
}

const form = reactive<SystemConfigForm>({
  systemName: '',
  sessionTimeout: '',
  passwordMinLength: '8',
  passwordMaxLength: '20',
  passwordComplexity: '数字+大小写',
  licenseCheckFrequency: '',
  offlineActivationDuration: '',
  licenseSyncInterval: '',
  alertReceiverSystemError: '',
  alertReceiverApiError: '',
  alertReceiverLicenseExpiry: '',
  alertTriggerThreshold: '30',
  alertReceiverDeviceBind: '',
  alertMethods: [],
  backupFrequency: '每日',
  backupFrequencyEnabled: false,
  backupPath: '',
  backupRetention: '',
  dashboardRefreshRate: '',
  logoUrl: '',
  bgImageUrl: ''
})

const formRules: FormRules = {
  systemName: [
    { required: true, message: '请输入系统名称', trigger: 'blur' },
    { max: 50, message: '系统名称不能超过50个字符', trigger: 'blur' }
  ],
  sessionTimeout: [
    { required: true, message: '请输入会话超时时间', trigger: 'blur' },
    { pattern: /^\d+$/, message: '请输入有效的数字', trigger: 'blur' }
  ],
  licenseCheckFrequency: [
    { required: true, message: '请输入许可校验频率', trigger: 'blur' },
    { pattern: /^\d+$/, message: '请输入有效的数字', trigger: 'blur' }
  ],
  offlineActivationDuration: [
    { required: true, message: '请输入离线激活有效时长', trigger: 'blur' },
    { pattern: /^\d+$/, message: '请输入有效的数字', trigger: 'blur' }
  ],
  licenseSyncInterval: [
    { required: true, message: '请输入许可状态同步时间间隔', trigger: 'blur' },
    { pattern: /^\d+$/, message: '请输入有效的数字', trigger: 'blur' }
  ],
  alertReceiverSystemError: [
    { required: true, message: '请选择告警接收人', trigger: 'change' }
  ],
  alertReceiverApiError: [
    { required: true, message: '请选择告警接收人', trigger: 'change' }
  ],
  alertReceiverLicenseExpiry: [
    { required: true, message: '请选择告警接收人', trigger: 'change' }
  ],
  alertReceiverDeviceBind: [
    { required: true, message: '请选择告警接收人', trigger: 'change' }
  ],
  backupPath: [
    { required: true, message: '请输入备份存储路径', trigger: 'blur' }
  ],
  backupRetention: [
    { required: true, message: '请输入备份文件保留时长', trigger: 'blur' },
    { pattern: /^\d+$/, message: '请输入有效的数字', trigger: 'blur' }
  ],
  dashboardRefreshRate: [
    { required: true, message: '请输入刷新频率', trigger: 'blur' },
    { pattern: /^\d+$/, message: '请输入有效的数字', trigger: 'blur' }
  ]
}

// ─── Alert Receiver Options ──────────────────────────────────────────

const alertReceiverOptions = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' },
  { label: '赵六', value: 'zhaoliu' },
  { label: '系统管理员', value: 'admin' }
]

// ─── File Upload Handlers ────────────────────────────────────────────

const handleLogoChange = (file: UploadFile) => {
  if (file.raw) {
    const isImage = file.raw.type.startsWith('image/')
    if (!isImage) {
      ElMessage.error('只能上传图片文件!')
      return
    }
    const isLt2M = file.raw.size / 1024 / 1024 < 2
    if (!isLt2M) {
      ElMessage.error('图片大小不能超过 2MB!')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      form.logoUrl = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }
}

const handleBgChange = (file: UploadFile) => {
  if (file.raw) {
    const isImage = file.raw.type.startsWith('image/')
    if (!isImage) {
      ElMessage.error('只能上传图片文件!')
      return
    }
    const isLt5M = file.raw.size / 1024 / 1024 < 5
    if (!isLt5M) {
      ElMessage.error('图片大小不能超过 5MB!')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      form.bgImageUrl = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
  }
}

// ─── Backup Toggle ───────────────────────────────────────────────────

const handleBackupToggle = (val: boolean) => {
  if (!val) {
    form.backupFrequency = '每日'
  }
}

// ─── Save ────────────────────────────────────────────────────────────

const handleSave = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    saveLoading.value = true

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))

    ElMessage.success('保存成功')
  } catch {
    ElMessage.error('请检查表单填写')
  } finally {
    saveLoading.value = false
  }
}

// ─── Lifecycle ───────────────────────────────────────────────────────

onMounted(() => {
  // In production, fetch config from API here
  // Example: loadConfig()
})
</script>

<style lang="scss" scoped>
.system-config {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  border-radius: 8px;
  padding-bottom: 40px;
}

// ─── Page Header ─────────────────────────────────────────────────────

.page-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;

  .el-button {
    min-width: 80px;
  }
}

// ─── Form ────────────────────────────────────────────────────────────

.config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ─── Section Card ────────────────────────────────────────────────────

.section-card {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);

  .section-title {
    font-size: 15px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid #ebeef5;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: -12px;
      top: 0;
      bottom: 12px;
      width: 3px;
      background-color: #409eff;
      border-radius: 2px;
    }
  }
}

// ─── Logo Upload ─────────────────────────────────────────────────────

.logo-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }
}

.logo-preview {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: contain;
}

.logo-placeholder {
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  color: #909399;
  font-size: 13px;

  .upload-icon {
    font-size: 28px;
    color: #c0c4cc;
    margin-bottom: 8px;
  }
}

// ─── Background Image Upload ─────────────────────────────────────────

.bg-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #409eff;
    }
  }
}

.bg-preview {
  width: 200px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.bg-placeholder {
  width: 200px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  color: #909399;
  font-size: 13px;

  .upload-icon {
    font-size: 28px;
    color: #c0c4cc;
    margin-bottom: 8px;
  }
}

// ─── Password Complexity ─────────────────────────────────────────────

.password-complexity {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;

  .complexity-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .complexity-label {
    font-size: 14px;
    color: #606266;
    white-space: nowrap;
    min-width: 80px;
  }

  .password-length-input {
    width: 120px;
  }

  .complexity-separator {
    font-size: 14px;
    color: #909399;
  }
}

// ─── Alert Row (License Expiry) ──────────────────────────────────────

.alert-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  flex-wrap: wrap;

  .alert-receiver-select {
    flex: 1;
    min-width: 200px;
  }

  .alert-threshold-label {
    font-size: 14px;
    color: #606266;
    white-space: nowrap;
  }

  .threshold-prefix {
    font-size: 14px;
    color: #909399;
  }

  .threshold-input {
    width: 120px;
  }

  .threshold-suffix {
    font-size: 14px;
    color: #909399;
  }
}

// ─── Backup Frequency ────────────────────────────────────────────────

.backup-frequency {
  display: flex;
  align-items: center;
  gap: 16px;
}

// ─── Form item overrides ─────────────────────────────────────────────

:deep(.el-form-item) {
  margin-bottom: 22px;

  &:last-child {
    margin-bottom: 0;
  }
}

:deep(.el-form-item__label) {
  font-weight: 400;
}

:deep(.el-input-group__append) {
  background-color: #fafafa;
  padding: 0 12px;
}

// ─── Responsive ──────────────────────────────────────────────────────

@media (max-width: 992px) {
  .system-config {
    padding: 12px;
  }

  .section-card {
    padding: 16px;

    .section-title {
      &::before {
        left: -8px;
      }
    }
  }

  .password-complexity {
    .complexity-row {
      flex-wrap: wrap;
    }
  }

  .alert-row {
    flex-direction: column;
    align-items: flex-start;

    .alert-receiver-select {
      width: 100%;
    }
  }

  .backup-frequency {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
