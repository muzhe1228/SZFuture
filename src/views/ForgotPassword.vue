<template>
  <div class="forgot-password-container">
    <!-- Left panel -->
    <div class="left-panel">
      <div class="brand">深圳未来</div>
      <div class="illustration">
        <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
          <rect width="500" height="400" fill="#f5f7fa" rx="16" />
          <!-- Dashboard mockup -->
          <rect x="50" y="50" width="400" height="300" rx="8" fill="#ffffff" stroke="#e4e7ed" stroke-width="2" />
          <!-- Header bar -->
          <rect x="50" y="50" width="400" height="50" rx="8" fill="#409EFF" />
          <circle cx="80" cy="75" r="15" fill="#fff" opacity="0.3" />
          <rect x="110" y="65" width="200" height="20" rx="10" fill="#fff" opacity="0.3" />
          <!-- Content lines -->
          <rect x="70" y="120" width="150" height="10" rx="5" fill="#e4e7ed" />
          <rect x="70" y="140" width="120" height="10" rx="5" fill="#e4e7ed" />
          <rect x="70" y="160" width="130" height="10" rx="5" fill="#e4e7ed" />
          <!-- Button -->
          <rect x="70" y="190" width="100" height="30" rx="15" fill="#409EFF" />
          <!-- Chart area -->
          <rect x="250" y="120" width="180" height="200" rx="4" fill="#f0f9ff" stroke="#409EFF" stroke-width="1" />
          <path d="M 270 280 Q 310 220 350 240 Q 390 260 410 200" stroke="#409EFF" stroke-width="3" fill="none" />
          <!-- Person icon -->
          <circle cx="420" cy="320" r="30" fill="#409EFF" />
          <rect x="390" y="340" width="60" height="60" rx="4" fill="#409EFF" />
          <!-- Floating notification -->
          <rect x="350" y="30" width="140" height="80" rx="6" fill="#ffffff" stroke="#e4e7ed" stroke-width="2" />
          <rect x="370" y="45" width="100" height="8" rx="4" fill="#e4e7ed" />
          <rect x="370" y="60" width="80" height="8" rx="4" fill="#e4e7ed" />
          <rect x="370" y="80" width="60" height="16" rx="8" fill="#409EFF" />
        </svg>
      </div>
    </div>

    <!-- Right panel -->
    <div class="right-panel">
      <el-card class="form-card" shadow="always">
        <div class="form-wrapper">
          <h2 class="form-title">忘记密码</h2>
          <p class="form-subtitle">请输入您的注册邮箱，我们将发送密码重置链接</p>

          <!-- Step 1: Enter email -->
          <el-form
            v-if="currentStep === 1"
            :model="emailForm"
            :rules="emailRules"
            ref="emailFormRef"
            @submit.prevent="handleSendCode"
          >
            <el-form-item prop="email">
              <el-input
                v-model="emailForm.email"
                placeholder="请输入注册邮箱"
                size="large"
                clearable
                prefix-icon="Message"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                style="width: 100%"
                :loading="emailLoading"
                @click="handleSendCode"
              >
                发送重置链接
              </el-button>
            </el-form-item>
          </el-form>

          <!-- Step 2: Enter verification code -->
          <el-form
            v-if="currentStep === 2"
            :model="codeForm"
            :rules="codeRules"
            ref="codeFormRef"
            @submit.prevent="handleVerifyCode"
          >
            <el-form-item prop="code">
              <el-input
                v-model="codeForm.code"
                placeholder="请输入验证码"
                size="large"
                maxlength="6"
                clearable
                prefix-icon="Key"
              />
            </el-form-item>

            <div class="code-actions">
              <span class="countdown-text" v-if="countdown > 0">{{ countdown }}s 后重新发送</span>
              <el-link v-else type="primary" :underline="false" @click="handleResendCode">重新发送</el-link>
            </div>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                style="width: 100%"
                :loading="codeLoading"
                @click="handleVerifyCode"
              >
                验证
              </el-button>
            </el-form-item>
          </el-form>

          <!-- Step 3: Reset password -->
          <el-form
            v-if="currentStep === 3"
            :model="passwordForm"
            :rules="passwordRules"
            ref="passwordFormRef"
            @submit.prevent="handleResetPassword"
          >
            <el-form-item prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                placeholder="请输入新密码"
                size="large"
                show-password
                prefix-icon="Lock"
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请确认新密码"
                size="large"
                show-password
                prefix-icon="Lock"
                @keyup.enter="handleResetPassword"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                style="width: 100%"
                :loading="passwordLoading"
                @click="handleResetPassword"
              >
                重置密码
              </el-button>
            </el-form-item>
          </el-form>

          <!-- Step 4: Success -->
          <div v-if="currentStep === 4" class="success-wrapper">
            <el-result icon="success" title="密码重置成功">
              <template #sub-title>
                <p>您的密码已重置成功</p>
                <p>请使用新密码登录</p>
              </template>
              <template #extra>
                <el-button type="primary" size="large" @click="goToLogin">返回登录</el-button>
              </template>
            </el-result>
          </div>

          <div class="form-footer">
            <el-link type="primary" :underline="false" @click="goToLogin">返回登录</el-link>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const router = useRouter()

const currentStep = ref(1)
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// Email form
const emailFormRef = ref<FormInstance>()
const emailLoading = ref(false)
const emailForm = reactive({
  email: ''
})

const emailRules = {
  email: [
    { required: true, message: '请输入注册邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// Code form
const codeFormRef = ref<FormInstance>()
const codeLoading = ref(false)
const codeForm = reactive({
  code: ''
})

const codeRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ]
}

// Password form
const passwordFormRef = ref<FormInstance>()
const passwordLoading = ref(false)
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// Send reset code
const handleSendCode = async () => {
  if (!emailFormRef.value) return

  await emailFormRef.value.validate(async (valid) => {
    if (valid) {
      emailLoading.value = true
      try {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        ElMessage.success('重置链接已发送至您的邮箱')
        currentStep.value = 2
        startCountdown()
      } catch {
        ElMessage.error('发送失败，请稍后重试')
      } finally {
        emailLoading.value = false
      }
    }
  })
}

// Resend code
const handleResendCode = () => {
  handleSendCode()
}

// Start countdown
const startCountdown = () => {
  countdown.value = 60
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)
}

// Verify code
const handleVerifyCode = async () => {
  if (!codeFormRef.value) return

  await codeFormRef.value.validate(async (valid) => {
    if (valid) {
      codeLoading.value = true
      try {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        ElMessage.success('验证成功')
        currentStep.value = 3
      } catch {
        ElMessage.error('验证码错误')
      } finally {
        codeLoading.value = false
      }
    }
  })
}

// Reset password
const handleResetPassword = async () => {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      passwordLoading.value = true
      try {
        // Mock API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        currentStep.value = 4
      } catch {
        ElMessage.error('重置失败，请稍后重试')
      } finally {
        passwordLoading.value = false
      }
    }
  })
}

// Go to login
const goToLogin = () => {
  router.push('/login')
}

// Cleanup timer
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style lang="scss" scoped>
.forgot-password-container {
  display: flex;
  height: 100vh;
  background: #ffffff;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
}

.brand {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 60px;
}

.illustration {
  width: 80%;
  max-width: 500px;

  svg {
    width: 100%;
    height: auto;
  }
}

.right-panel {
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-card {
  width: 100%;
  max-width: 420px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border: none;
}

.form-wrapper {
  padding: 20px;
}

.form-title {
  text-align: center;
  margin-bottom: 12px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.form-subtitle {
  text-align: center;
  margin-bottom: 30px;
  font-size: 14px;
  color: #909399;
}

.code-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -10px;
  margin-bottom: 20px;
  font-size: 14px;

  .countdown-text {
    color: #909399;
  }
}

.success-wrapper {
  padding: 20px 0;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .left-panel {
    display: none;
  }

  .right-panel {
    width: 100%;
  }
}
</style>
