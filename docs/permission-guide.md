# 权限控制配置文档

## 概述

本项目采用基于角色和权限的访问控制（RBAC）模式，支持两种级别的权限控制：

1. **路由级别**：通过路由守卫自动检查用户是否有权限访问页面
2. **组件级别**：通过指令或组合式函数控制元素的显示/隐藏

## 权限系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      权限系统                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐   │
│  │  用户信息    │  │  权限工具    │  │  路由守卫        │   │
│  │  (UserInfo) │  │  (permission.ts)│ │  (router)      │   │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │
│         │                │                   │              │
│         ▼                ▼                   ▼              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              权限检查逻辑                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                         │                                  │
│           ┌─────────────┼─────────────┐                    │
│           ▼             ▼             ▼                    │
│    ┌──────────┐  ┌──────────┐  ┌─────────────┐            │
│    │ v-has-role │ │v-has-permission│ │ usePermission │     │
│    │  指令     │  │   指令   │  │ 组合式函数   │            │
│    └──────────┘  └──────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## 核心文件说明

### 1. 用户信息结构 (`src/utils/permission.ts`)

```typescript
interface UserInfo {
  id: number           // 用户ID
  username: string     // 用户名
  name: string         // 姓名
  role: string         // 角色标识
  permissions: string[] // 权限列表
}
```

**权限字符串格式**：`模块:操作`，例如 `auth:view`、`user:edit`

### 2. 权限工具函数

| 函数名 | 功能说明 | 参数 | 返回值 |
|--------|----------|------|--------|
| `setUserInfo` | 保存用户信息到 localStorage | `userInfo: UserInfo` | `void` |
| `getUserInfo` | 获取当前用户信息 | 无 | `UserInfo \| null` |
| `clearUserInfo` | 清除用户信息 | 无 | `void` |
| `hasRole` | 检查用户是否具有指定角色 | `role: string` | `boolean` |
| `hasAnyRole` | 检查用户是否具有任一角色 | `roles: string[]` | `boolean` |
| `hasPermission` | 检查用户是否具有指定权限 | `permission: string` | `boolean` |
| `hasAnyPermission` | 检查用户是否具有任一权限 | `permissions: string[]` | `boolean` |
| `hasAllPermissions` | 检查用户是否具有所有权限 | `permissions: string[]` | `boolean` |
| `checkPermission` | 综合检查权限配置 | `config?: PermissionConfig` | `boolean` |

### 3. 组合式函数 (`src/composables/usePermission.ts`)

提供在 Vue 组件中便捷使用的权限检查方法：

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `userInfo` | `ComputedRef<UserInfo \| null>` | 当前用户信息 |
| `isLoggedIn` | `ComputedRef<boolean>` | 是否已登录 |
| `role` | `ComputedRef<string>` | 当前用户角色 |
| `permissions` | `ComputedRef<string[]>` | 当前用户权限列表 |
| `can(permission)` | `(string) => boolean` | 检查单个权限 |
| `canAny(permissions)` | `(string[]) => boolean` | 检查任一权限 |
| `canAll(permissions)` | `(string[]) => boolean` | 检查所有权限 |
| `is(roleName)` | `(string) => boolean` | 检查单个角色 |
| `isAny(roles)` | `(string[]) => boolean` | 检查任一角色 |
| `check(config)` | `(PermissionConfig) => boolean` | 综合检查 |

### 4. 权限指令 (`src/utils/permissionDirective.ts`)

提供两个自定义指令用于模板中控制元素显示：

- **`v-has-role`**：检查角色权限
- **`v-has-permission`**：检查操作权限

## 配置方式

### 1. 路由权限配置

在路由定义中通过 `meta.permission` 配置权限：

```typescript
const routes = [
  {
    path: 'system/config',
    name: 'SystemConfig',
    component: () => import('@/views/system/SystemConfig.vue'),
    meta: {
      title: '系统配置',
      requiresAuth: true,
      permission: {
        role: 'admin',              // 必需角色（可选）
        permissions: ['system:config'] // 必需权限（可选）
      }
    }
  }
]
```

**权限检查逻辑**：
- 同时配置 `role` 和 `permissions`：需同时满足角色和任一权限
- 仅配置 `role`：只需满足角色
- 仅配置 `permissions`：只需满足任一权限
- 未配置：不进行权限检查

### 2. 组件内权限控制

**方式一：使用组合式函数**

```vue
<script setup lang="ts">
import { usePermission } from '@/composables/usePermission'

const { can, is, canAny } = usePermission()

const canEdit = can('user:edit')
const isAdmin = is('admin')
const canManage = canAny(['user:view', 'user:edit'])
</script>

<template>
  <el-button v-if="canEdit" type="primary">编辑</el-button>
  <el-button v-if="isAdmin" type="danger">删除</el-button>
</template>
```

**方式二：使用指令**

```vue
<template>
  <!-- 单个权限 -->
  <el-button v-has-permission="'user:edit'">编辑</el-button>
  
  <!-- 多个权限（满足任一） -->
  <el-button v-has-permission="['user:edit', 'user:delete']">管理</el-button>
  
  <!-- 角色检查 -->
  <el-button v-has-role="'admin'">管理员操作</el-button>
  
  <!-- 多个角色（满足任一） -->
  <el-button v-has-role="['admin', 'manager']">高级操作</el-button>
</template>
```

### 3. 全局注册指令

在 `main.ts` 中注册权限指令：

```typescript
import { setupPermissionDirectives } from '@/utils/permissionDirective'

const app = createApp(App)
setupPermissionDirectives(app)
```

## 权限控制流程图

```
用户访问路由
       │
       ▼
┌──────────────────┐
│  是否公共路径？   │
└────────┬─────────┘
         │
    否    │    是
         ▼         ▼
┌─────────────┐  直接访问
│ 有token吗？ │
└──────┬──────┘
       │
   否   │   是
       ▼        ▼
  跳转登录  ┌─────────────┐
           │有权限配置？ │
           └──────┬──────┘
                  │
             否   │   是
                  ▼        ▼
             直接访问  ┌─────────────┐
                      │checkPermission│
                      └──────┬──────┘
                             │
                        允许  │  拒绝
                             ▼        ▼
                         访问页面  跳转403
```

## 403 页面

当用户无权限访问页面时，自动跳转到 `/403` 页面：

```vue
<!-- src/views/Forbidden.vue -->
<template>
  <div class="forbidden-page">
    <div class="icon">🚫</div>
    <h1>403 无权限访问</h1>
    <p>您没有权限访问此页面，请联系管理员</p>
    <el-button @click="goBack">返回首页</el-button>
  </div>
</template>
```

## 现有权限列表

### 系统权限

| 权限标识 | 说明 | 关联页面 |
|----------|------|----------|
| `message:view` | 查看消息 | 消息中心 |
| `trial:view` | 查看试用列表 | 试用列表 |
| `auth:view` | 查看授权列表 | 授权列表 |
| `order:view` | 查看订单列表 | 订单列表 |
| `customer:view` | 查看客户列表 | 客户列表 |
| `product:view` | 查看产品配置 | 产品模块/许可模板 |
| `user:view` | 查看用户管理 | 用户管理 |
| `role:view` | 查看角色管理 | 角色管理 |
| `department:view` | 查看部门管理 | 部门管理 |
| `system:config` | 系统配置 | 系统配置 |
| `log:view` | 查看日志 | 操作日志/系统日志 |
| `approval:view` | 查看审批列表 | 审批列表 |

### 角色列表

| 角色标识 | 说明 |
|----------|------|
| `admin` | 超级管理员 |
| `manager` | 管理员 |
| `user` | 普通用户 |

## 最佳实践

### 1. 权限命名规范

采用 `模块:操作` 的命名格式：

```typescript
// 正确
'user:view'    // 用户模块-查看
'user:edit'    // 用户模块-编辑
'user:delete'  // 用户模块-删除

// 错误
'viewUser'     // 不建议使用驼峰
'userView'     // 不建议使用驼峰
```

### 2. 路由权限配置

- 公共页面（登录、忘记密码）：`requiresAuth: false`，不配置 `permission`
- 需要登录但无特殊权限：仅配置 `requiresAuth: true`
- 需要特定权限：配置 `permission` 对象

### 3. 组件权限控制

- 对于简单的显示/隐藏逻辑，使用指令更简洁
- 对于复杂的权限判断逻辑，使用组合式函数更灵活
- 避免在模板中写复杂的权限表达式

### 4. 权限初始化

登录成功后，应立即调用 `setUserInfo` 保存用户权限信息：

```typescript
// 登录成功后
const userInfo = {
  id: 1,
  username: 'admin',
  name: '管理员',
  role: 'admin',
  permissions: ['user:view', 'user:edit', 'system:config']
}
setUserInfo(userInfo)
localStorage.setItem('token', 'xxx')
```

## 扩展说明

### 动态权限刷新

当前实现基于 localStorage，权限变更需要重新登录。如需支持动态刷新，可：

1. 监听后端权限变更事件
2. 通过 WebSocket 推送权限更新
3. 调用 `setUserInfo` 更新本地缓存

### 权限缓存策略

用户信息存储在 localStorage，刷新页面后权限信息保持不变。登出时需调用：

```typescript
clearUserInfo()
localStorage.removeItem('token')
```