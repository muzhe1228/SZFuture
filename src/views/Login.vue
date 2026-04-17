<template>
  <div class="login-page">
    <!-- Left side: Branding & illustration -->
    <div class="login-left">
      <div class="brand-name">深圳未来</div>
      <div class="illustration">
        <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
          <!-- Background shapes -->
          <rect x="60" y="120" width="380" height="220" rx="12" fill="#E8F4FD" />
          <!-- Laptop -->
          <rect x="130" y="180" width="240" height="140" rx="8" fill="#409EFF" />
          <rect x="140" y="190" width="220" height="110" rx="4" fill="#fff" />
          <!-- Screen content - charts -->
          <rect x="155" y="205" width="60" height="8" rx="4" fill="#409EFF" opacity="0.6" />
          <rect x="155" y="220" width="80" height="8" rx="4" fill="#409EFF" opacity="0.4" />
          <rect x="155" y="235" width="50" height="8" rx="4" fill="#409EFF" opacity="0.5" />
          <!-- Bar chart -->
          <rect x="260" y="260" width="18" height="30" rx="3" fill="#409EFF" opacity="0.7" />
          <rect x="285" y="240" width="18" height="50" rx="3" fill="#409EFF" opacity="0.8" />
          <rect x="310" y="220" width="18" height="70" rx="3" fill="#409EFF" />
          <rect x="335" y="250" width="18" height="40" rx="3" fill="#409EFF" opacity="0.6" />
          <!-- Laptop base -->
          <rect x="110" y="320" width="280" height="12" rx="6" fill="#337ECC" />
          <!-- Person silhouette -->
          <circle cx="250" cy="100" r="35" fill="#409EFF" opacity="0.3" />
          <path d="M210 150 Q250 130 290 150 L290 180 L210 180 Z" fill="#409EFF" opacity="0.3" />
          <!-- Dashboard cards floating -->
          <rect x="30" y="80" width="80" height="60" rx="8" fill="#fff" opacity="0.9" />
          <circle cx="55" cy="100" r="12" fill="#409EFF" opacity="0.5" />
          <rect x="75" y="95" width="25" height="6" rx="3" fill="#ccc" />
          <rect x="75" y="107" width="20" height="6" rx="3" fill="#ddd" />
          <rect x="390" y="60" width="80" height="60" rx="8" fill="#fff" opacity="0.9" />
          <rect x="405" y="75" width="50" height="8" rx="4" fill="#409EFF" opacity="0.6" />
          <rect x="405" y="90" width="40" height="8" rx="4" fill="#409EFF" opacity="0.4" />
          <rect x="405" y="105" width="30" height="8" rx="4" fill="#409EFF" opacity="0.5" />
        </svg>
      </div>
    </div>

    <!-- Right side: Login form -->
    <div class="login-right">
      <el-card class="login-card" shadow="always">
        <h1 class="login-title">登录</h1>
        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="账号"
              size="large"
              :prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密码"
              size="large"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          <div class="form-options">
            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
            <router-link to="/forgot-password" class="forgot-link">忘记密码?</router-link>
          </div>
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      // Mock login: any username/password works
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Store token in localStorage
      localStorage.setItem('token', 'mock-token-' + Date.now())

      // Remember password option
      if (loginForm.rememberMe) {
        localStorage.setItem('rememberedUsername', loginForm.username)
      } else {
        localStorage.removeItem('rememberedUsername')
      }

      ElMessage.success('登录成功')
      router.push('/')
    } catch {
      ElMessage.error('登录失败，请重试')
    } finally {
      loading.value = false
    }
  })
}

// Load remembered username on mount
const rememberedUsername = localStorage.getItem('rememberedUsername')
if (rememberedUsername) {
  loginForm.username = rememberedUsername
  loginForm.rememberMe = true
}
</script>

<style lang="scss" scoped>
.login-page {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #e8f4fd 0%, #d4e8f7 100%);
  display: flex;
  flex-direction: column;
  padding: 40px;
  position: relative;
}

.brand-name {
  font-size: 28px;
  font-weight: 700;
  color: #409EFF;
  letter-spacing: 2px;
}

.illustration {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    max-width: 100%;
    max-height: 100%;
    width: 500px;
    height: 400px;
  }
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.login-card {
  width: 420px;
  padding: 20px;
  border-radius: 12px;

  :deep(.el-card__body) {
    padding: 40px 30px;
  }
}

.login-title {
  text-align: center;
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 36px;
}

.login-form {
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .forgot-link {
    font-size: 14px;
  }

  .login-btn {
    width: 100%;
    height: 44px;
    font-size: 16px;
    font-weight: 500;
  }
}

// Responsive: stack on small screens
@media (max-width: 768px) {
  .login-left {
    display: none;
  }

  .login-right {
    background: linear-gradient(135deg, #e8f4fd 0%, #d4e8f7 100%);
  }

  .login-card {
    width: 90%;
    max-width: 420px;
  }
}
</style>
