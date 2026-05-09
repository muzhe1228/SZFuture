<template>
  <el-container class="layout-container">
    <!-- Sidebar -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <span v-if="!isCollapse" class="logo-text">深圳未来</span>
        <span v-else class="logo-text-short">未来</span>
      </div>
      <el-menu text-color="var(--text-white)" active-text-color="#475E8C" background background-color="#6378A1"
        :default-active="activeMenu" :collapse="isCollapse" :collapse-transition="false" router class="sidebar-menu">
        <template v-for="item in filteredMenuItems" :key="item.index">
          <el-menu-item v-if="!item.children" :index="item.index">
            <el-icon>
              <component :is="getIcon(item.icon)" />
            </el-icon>
            <template #title>{{ item.label }}</template>
          </el-menu-item>
          <el-sub-menu v-else :index="item.index">
            <template #title>
              <el-icon>
                <component :is="getIcon(item.icon)" />
              </el-icon>
              <span>{{ item.label }}</span>
            </template>
            <el-menu-item v-for="child in getPermissionedChildren(item.children)" :key="child.index"
              :index="child.index">
              {{ child.label }}
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>

    <!-- Main Content -->
    <el-container class="main-container">
      <!-- Header -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path"
              :to="item.path ? { path: item.path } : undefined">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tooltip content="全屏" placement="bottom">
            <el-icon class="header-icon" @click="toggleFullscreen">
              <FullScreen />
            </el-icon>
          </el-tooltip>
          <el-tooltip :content="isDark ? '切换到浅色模式' : '切换到深色模式'" placement="bottom">
            <el-icon class="header-icon" @click="toggleTheme">
              <Sunny v-if="isDark" />
              <Moon v-else />
            </el-icon>
          </el-tooltip>
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <!-- <el-icon><UserFilled /></el-icon> -->
              <el-avatar :size="24" class="avatar">
                <img :src="userStore.userInfo?.avatar" />
              </el-avatar>
              <span class="user-name">{{ userStore.userInfo?.username || '测试用户' }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Tab Bar -->
      <TabBar />

      <!-- Content -->
      <el-main class="main-content">
        <RouteTransition />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  ChatDotRound,
  Key,
  Box,
  Setting,
  Document,
  Checked,
  Fold,
  Expand,
  FullScreen,
  Sunny,
  Moon,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useTabStore } from '@/stores/tabStore'
import { clearUserInfo as clearPermissionUserInfo } from '@/utils/permission'
import { usePermission } from '@/composables/usePermission'
import { menuItems, type MenuItem } from '@/config/menu'
import TabBar from '@/components/TabBar'
import RouteTransition from '@/components/RouteTransition'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const isDark = ref(false)
// Get user info from store
const userStore = useUserStore()
// Get tab store
const tabStore = useTabStore()
// Permission check
const { can } = usePermission()

const iconMap: Record<string, any> = {
  HomeFilled,
  ChatDotRound,
  Key,
  Box,
  Setting,
  Document,
  Checked,
}

const getIcon = (iconName?: string) => {
  if (!iconName) return HomeFilled
  return iconMap[iconName] || HomeFilled
}

const hasPermission = (permission?: string) => {
  if (!permission) return true
  return can(permission)
}

const filteredMenuItems = computed(() => {
  return menuItems.filter((item) => {
    if (!item.children) {
      return hasPermission(item.permission)
    }
    const hasVisibleChildren = item.children.some((child) => hasPermission(child.permission))
    return hasVisibleChildren
  })
})

const getPermissionedChildren = (children?: MenuItem[]) => {
  if (!children) return []
  return children.filter((child) => hasPermission(child.permission))
}
// 切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// 加载主题偏好
const loadTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }
}

// 组件挂载时加载主题
loadTheme()

const activeMenu = computed(() => route.path)

const breadcrumbs = computed(() => {
  const breadcrumbList = []

  // Add home breadcrumb
  breadcrumbList.push({
    path: '/',
    title: '首页',
  })

  // Add parent menu breadcrumbs based on route path
  const pathSegments = route.path.split('/').filter(Boolean)
  let currentPath = ''

  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`

    // Map segment to menu name based on full path
    let menuName = segment

    // Handle specific paths
    if (currentPath === '/auth') {
      menuName = '授权管理'
    } else if (currentPath === '/auth/trials') {
      menuName = '试用列表'
    } else if (currentPath === '/auth/list') {
      menuName = '授权列表'
    } else if (currentPath === '/auth/orders') {
      menuName = '订单列表'
    } else if (currentPath === '/auth/customers') {
      menuName = '客户列表'
    } else if (currentPath === '/product') {
      menuName = '产品管理'
    } else if (currentPath === '/product/modules') {
      menuName = '产品模块配置'
    } else if (currentPath === '/product/templates') {
      menuName = '许可模版配置'
    } else if (currentPath === '/system') {
      menuName = '系统管理'
    } else if (currentPath === '/system/users') {
      menuName = '用户管理'
    } else if (currentPath === '/system/roles') {
      menuName = '角色管理'
    } else if (currentPath === '/system/departments') {
      menuName = '部门管理'
    } else if (currentPath === '/system/config') {
      menuName = '系统配置'
    } else if (currentPath === '/audit') {
      menuName = '运维管理'
    } else if (currentPath === '/audit/operations') {
      menuName = '操作日志'
    } else if (currentPath === '/audit/system') {
      menuName = '系统日志'
    } else if (currentPath === '/approval') {
      menuName = '审批管理'
    } else if (currentPath === '/approval/list') {
      menuName = '审批列表'
    } else if (currentPath === '/dashboard') {
      menuName = '工作台'
    } else if (currentPath === '/messages') {
      menuName = '消息'
    }

    breadcrumbList.push({
      path: currentPath,
      title: menuName,
    })
  })

  return breadcrumbList
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        // Clear all user-related localStorage data, except theme
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        localStorage.removeItem('user_info')
        localStorage.removeItem('rememberedUsername')
        localStorage.removeItem('tabStore.tabs')
        localStorage.removeItem('tabStore.currentPath')
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('searchFields-') || key.endsWith('-visibility')) {
            localStorage.removeItem(key)
          }
        })
        clearPermissionUserInfo()
        tabStore.resetTabs()
        router.push('/login')
        ElMessage.success('已退出登录')
      })
      .catch(() => { })
  } else if (command === 'profile') {
    ElMessage.info('个人中心开发中')
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  width: 100%;
}

.sidebar {
  overflow: hidden;
  transition: width 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #475E8C;

  .logo {
    height: 129px;
    display: flex;
    align-items: center;
    justify-content: center;

    .logo-text {
      color: var(--text-white);
      font-size: 34px;
      font-weight: 300;
      white-space: nowrap;
    }

    .logo-text-short {
      color: var(--text-white);
      font-size: 16px;
      font-weight: bold;
    }
  }

  .sidebar-menu {
    border-right: none;
    overflow-y: auto;

    .el-menu-item.is-active {
      background-color: #E6EAF2;
    }

    &:not(.el-menu--collapse) {
      width: 220px;
    }
  }
}

.main-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  padding: 0 20px;
  height: 60px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      color: var(--el-text-color-regular);

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .header-icon {
      font-size: 20px;
      cursor: pointer;
      color: var(--el-text-color-regular);

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      color: var(--el-text-color-regular);

      .user-name {
        font-size: 14px;
      }
    }
  }
}

.main-content {
  background-color: var(--el-bg-color-page);
  padding: 16px;
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
</style>
