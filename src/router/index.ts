import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { checkPermission } from '@/utils/permission'
import { ElMessage } from 'element-plus'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    permission?: {
      role?: string
      permissions?: string[]
    }
    keepAlive?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue'),
    meta: { title: '忘记密码', requiresAuth: false },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/Forbidden.vue'),
    meta: { title: '无权限', requiresAuth: false },
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    meta: { title: '首页', requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '工作台', requiresAuth: true, keepAlive: true },
      },
      {
        path: 'messages',
        name: 'Messages',
        component: () => import('@/views/Messages.vue'),
        meta: { title: '消息', requiresAuth: true, permission: { permissions: ['message:view'] } },
      },
      {
        path: 'auth/trials',
        name: 'TrialList',
        component: () => import('@/views/trial/TrialList.vue'),
        meta: { title: '试用列表', requiresAuth: true, permission: { permissions: ['trial:view'] }, keepAlive: true },
      },
      {
        path: 'auth/list',
        name: 'AuthList',
        component: () => import('@/views/auth/AuthList.vue'),
        meta: { title: '授权列表', requiresAuth: true, permission: { permissions: ['auth:view'] }, keepAlive: true },
      },
      {
        path: 'auth/orders',
        name: 'OrderList',
        component: () => import('@/views/auth/OrderList.vue'),
        meta: { title: '订单列表', requiresAuth: true, permission: { permissions: ['order:view'] } },
      },
      {
        path: 'auth/customers',
        name: 'CustomerList',
        component: () => import('@/views/auth/CustomerList.vue'),
        meta: { title: '客户列表', requiresAuth: true, permission: { permissions: ['customer:view'] } },
      },
      {
        path: 'product/modules',
        name: 'ProductModuleConfig',
        component: () => import('@/views/product/ProductModuleConfig.vue'),
        meta: { title: '产品模块配置', requiresAuth: true, permission: { permissions: ['product:view'] } },
      },
      {
        path: 'product/templates',
        name: 'LicenseTemplateConfig',
        component: () => import('@/views/product/LicenseTemplateConfig.vue'),
        meta: { title: '许可模版配置', requiresAuth: true, permission: { permissions: ['product:view'] } },
      },
      {
        path: 'system/users',
        name: 'UserManagement',
        component: () => import('@/views/system/UserManagement.vue'),
        meta: { title: '用户管理', requiresAuth: true, permission: { permissions: ['user:view'] } },
      },
      {
        path: 'system/roles',
        name: 'RoleManagement',
        component: () => import('@/views/system/RoleManagement.vue'),
        meta: { title: '角色管理', requiresAuth: true, permission: { permissions: ['role:view'] } },
      },
      {
        path: 'system/departments',
        name: 'DepartmentManagement',
        component: () => import('@/views/system/DepartmentManagement.vue'),
        meta: { title: '部门管理', requiresAuth: true, permission: { permissions: ['department:view'] } },
      },
      {
        path: 'system/config',
        name: 'SystemConfig',
        component: () => import('@/views/system/SystemConfig.vue'),
        meta: { title: '系统配置', requiresAuth: true, permission: { role: 'admin', permissions: ['system:config'] } },
      },
      {
        path: 'audit/operations',
        name: 'OperationLogs',
        component: () => import('@/views/OperationLogs.vue'),
        meta: { title: '操作日志', requiresAuth: true, permission: { permissions: ['log:view'] } },
      },
      {
        path: 'audit/system',
        name: 'SystemLogs',
        component: () => import('@/views/audit/SystemLogs.vue'),
        meta: { title: '系统日志', requiresAuth: true, permission: { permissions: ['log:view'] } },
      },
      {
        path: 'approval/list',
        name: 'ApprovalList',
        component: () => import('@/views/approval/ApprovalList.vue'),
        meta: {
          title: '审批列表',
          requiresAuth: true,
          permission: { permissions: ['approval:view'] },
          keepAlive: true,
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const publicPaths = ['/login', '/forgot-password', '/403']

  if (publicPaths.includes(to.path)) {
    if (token && to.path !== '/403') {
      next('/')
    } else {
      next()
    }
  } else {
    if (!token) {
      next('/login')
      return
    }

    const permission = to.meta.permission
    if (permission && !checkPermission(permission)) {
      ElMessage.error('您没有访问此页面的权限')
      next('/403')
      return
    }

    next()
  }
})

export default router
