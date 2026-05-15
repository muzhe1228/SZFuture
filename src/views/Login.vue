<template>
  <div class="login-page">
    <!-- Left side: Branding & illustration -->
    <div class="login-left">
      <div class="brand-name">深圳未来</div>
      <div class="illustration">
        <img src="@/assets/loginIcon.png" alt="登录图标" class="login-icon-img" />
      </div>
    </div>

    <!-- Right side: Login form -->
    <div class="login-right">
      <el-card class="login-card" shadow="always">
        <h1 class="login-title">登录</h1>
        <div class="login-mode-switch">
          <span class="mode-label">登录模式：</span>
          <el-switch v-model="useMockLogin" :active-text="'Mock'" :inactive-text="'真实'" active-color="#f59e0b"
            inactive-color="#67c23a" />
        </div>
        <el-form ref="formRef" label-position="top" :model="loginForm" :rules="rules" class="login-form"
          @keyup.enter="handleLogin">
          <el-form-item label="账号" prop="username">
            <el-input v-model="loginForm.username" placeholder="账号" size="large" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" show-password />
          </el-form-item>
          <div class="form-options">
            <el-checkbox v-model="loginForm.rememberMe">记住密码</el-checkbox>
            <router-link to="/forgot-password" class="forgot-link">忘记密码?</router-link>
          </div>
          <el-form-item>
            <el-button type="primary" size="large" class="login-btn" :loading="loading" @click="handleLogin">
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
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useTabStore } from '@/stores/tabStore'
import { setUserInfo as setPermissionUserInfo } from '@/utils/permission'
import request from '@/utils/request'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const userStore = useUserStore()
const tabStore = useTabStore()
const useMockLogin = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false,
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const adminPermissions = [
  'message:view',
  'trial:view',
  'auth:view',
  'order:view',
  'customer:view',
  'product:view',
  'user:view',
  'role:view',
  'department:view',
  'system:config',
  'log:view',
  'approval:view',
]
const merchantPermissions = [
  'message:view',
  'trial:view',
  'auth:view',
  'order:view',
  'user:view',
  'role:view',
  'department:view',
  'log:view',
]

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const username = loginForm.username
      const password = loginForm.password

      let token = ''

      if (useMockLogin.value) {
        await new Promise((resolve) => setTimeout(resolve, 800))
        if (!((username === 'admin' && password === 'admin') || (username === 'merchant' && password === 'merchant'))) {
          ElMessage.error('账号或密码错误')
          loading.value = false
          return
        }
       
        token = 'mock-token-' + Date.now()
      } else {
        const response = await request.post('/login', { username, password })
        if (response.code !== 200) {
          ElMessage.error(response.message || '登录失败')
          loading.value = false
          return
        }
        token = response.token
      }
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('user_info')
      localStorage.removeItem('tabStore.tabs')
      localStorage.removeItem('tabStore.currentPath')
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('searchFields-') || key.endsWith('-visibility')) {
          localStorage.removeItem(key)
        }
      })

      userStore.setToken(token)
      // 获取用户信息
      const useInfo = await request.get('/getInfo')
      const isAdmin = useInfo.roles.includes('admin')
      const permissions = isAdmin ? adminPermissions : merchantPermissions
      const userInfo = {
        ...useInfo.user,
        avatar: useInfo.user.avatar || 'https://img1.baidu.com/it/u=3423853670,1866145135&fm=253&fmt=auto&app=138&f=JPEG?w=800&h=800',
        permissions: permissions,
      }

      userStore.setUserInfo(userInfo)

      setPermissionUserInfo(userInfo)

      if (loginForm.rememberMe) {
        localStorage.setItem('rememberedUsername', username)
      } else {
        localStorage.removeItem('rememberedUsername')
      }

      ElMessage.success('登录成功')
      tabStore.resetTabs()
      router.push('/')
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '登录失败，请重试')
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
  background-image: url('@/assets/loginBg.png');
  background-size: 100% 100%;
}

.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px;
  position: relative;
}

.brand-name {
  font-size: 28px;
  font-weight: 700;
  color: #f59e0b;
  letter-spacing: 2px;
}

.illustration {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 70%;
  }

}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  // background: #f5f7fa;
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
  margin-bottom: 16px;
  color: var(--el-color-primary);
}

.login-mode-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 8px;

  .mode-label {
    font-size: 14px;
    color: #64748b;
    margin-right: 12px;
  }
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

// 暗黑模式样式
.dark {
  .login-left {
    background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);

    .illustration {
      svg {

        // 修改SVG中的白色元素为浅色
        rect[fill='#fff'] {
          fill: #e0e0e0;
        }

        rect[fill='#E8F4FD'] {
          fill: #2c2c2c;
        }
      }
    }
  }

  .login-right {
    background: #1a1a1a;
  }

  .login-card {
    background-color: #2c2c2c;
    border-color: #333;

    :deep(.el-card__body) {
      background-color: #2c2c2c;
    }
  }

  .login-title {
    color: var(--el-text-color-primary);
  }

  .forgot-link {
    color: var(--el-color-primary);
  }

  // 确保表单在暗黑模式下的样式
  :deep(.el-form) {
    .el-form-item__label {
      color: var(--el-text-color-primary);
    }
  }

  // 确保输入框在暗黑模式下的样式
  :deep(.el-input__wrapper) {
    --el-input-bg-color: var(--el-input-bg-color);
    --el-input-border-color: var(--el-input-border-color);
    --el-input-text-color: var(--el-input-text-color);
    --el-input-placeholder-color: var(--el-input-placeholder-color);
  }

  // 确保复选框在暗黑模式下的样式
  :deep(.el-checkbox) {
    .el-checkbox__label {
      color: var(--el-text-color-primary);
    }
  }

  // 响应式调整
  @media (max-width: 768px) {
    .login-right {
      background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
    }
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
