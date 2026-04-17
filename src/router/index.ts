import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue')
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '工作台' }
      },
      {
        path: 'messages',
        name: 'Messages',
        component: () => import('@/views/Messages.vue'),
        meta: { title: '消息' }
      },
      {
        path: 'auth/trials',
        name: 'TrialList',
        component: () => import('@/views/trial/TrialList.vue'),
        meta: { title: '试用列表' }
      },
      {
        path: 'auth/list',
        name: 'AuthList',
        component: () => import('@/views/auth/AuthList.vue'),
        meta: { title: '授权列表' }
      },
      {
        path: 'auth/orders',
        name: 'OrderList',
        component: () => import('@/views/auth/OrderList.vue'),
        meta: { title: '订单列表' }
      },
      {
        path: 'auth/customers',
        name: 'CustomerList',
        component: () => import('@/views/auth/CustomerList.vue'),
        meta: { title: '客户列表' }
      },
      {
        path: 'product/modules',
        name: 'ProductModuleConfig',
        component: () => import('@/views/product/ProductModuleConfig.vue'),
        meta: { title: '产品模块配置' }
      },
      {
        path: 'product/templates',
        name: 'LicenseTemplateConfig',
        component: () => import('@/views/product/LicenseTemplateConfig.vue'),
        meta: { title: '许可模版配置' }
      },
      {
        path: 'system/users',
        name: 'UserManagement',
        component: () => import('@/views/system/UserManagement.vue'),
        meta: { title: '用户管理' }
      },
      {
        path: 'system/roles',
        name: 'RoleManagement',
        component: () => import('@/views/system/RoleManagement.vue'),
        meta: { title: '角色管理' }
      },
      {
        path: 'system/departments',
        name: 'DepartmentManagement',
        component: () => import('@/views/system/DepartmentManagement.vue'),
        meta: { title: '部门管理' }
      },
      {
        path: 'system/config',
        name: 'SystemConfig',
        component: () => import('@/views/system/SystemConfig.vue'),
        meta: { title: '系统配置' }
      },
      {
        path: 'audit/operations',
        name: 'OperationLogs',
        component: () => import('@/views/OperationLogs.vue'),
        meta: { title: '操作日志' }
      },
      {
        path: 'audit/system',
        name: 'SystemLogs',
        component: () => import('@/views/audit/SystemLogs.vue'),
        meta: { title: '系统日志' }
      },
      {
        path: 'approval/list',
        name: 'ApprovalList',
        component: () => import('@/views/approval/ApprovalList.vue'),
        meta: { title: '审批列表' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const publicPaths = ['/login', '/forgot-password']

  if (publicPaths.includes(to.path)) {
    if (token) next('/')
    else next()
  } else {
    if (token) next()
    else next('/login')
  }
})

export default router
