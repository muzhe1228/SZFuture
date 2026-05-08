# 项目代码优化文档

## 文档版本

| 版本 | 日期 | 作者 | 说明 |
|------|------|------|------|
| 1.0 | 2026-05-07 | 开发团队 | 初始版本 |

---

## 目录

1. [BaseDialog 基础组件](#1-basedialog-基础组件)
2. [SearchForm 组件优化](#2-searchform-组件优化)
3. [API 调用方式统一](#3-api-调用方式统一)
4. [通用样式提取](#4-通用样式提取)
5. [API 响应类型定义](#5-api-响应类型定义)
6. [Dialog 错误处理完善](#6-dialog-错误处理完善)
7. [日志工具函数](#7-日志工具函数)
8. [Console 语句清理](#8-console-语句清理)

---

## 1. BaseDialog 基础组件

### 1.1 优化目的

封装通用的 Dialog 逻辑，减少重复代码，提高组件复用性。

### 1.2 实现内容

**文件位置**：`src/components/BaseDialog/`

| 文件 | 说明 |
|------|------|
| `BaseDialog.vue` | 基础对话框组件 |
| `index.ts` | 导出文件 |

### 1.3 Props 定义

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| modelValue | boolean | - | 对话框显示状态（双向绑定） |
| title | string | - | 对话框标题 |
| width | string | '520px' | 对话框宽度 |
| closeOnClickModal | boolean | false | 是否点击遮罩关闭 |
| closeOnPressEscape | boolean | false | 是否按 ESC 关闭 |
| showClose | boolean | true | 是否显示关闭按钮 |
| showCancelButton | boolean | true | 是否显示取消按钮 |
| showConfirmButton | boolean | true | 是否显示确认按钮 |
| cancelText | string | '取消' | 取消按钮文字 |
| confirmText | string | '确定' | 确认按钮文字 |
| confirmType | string | 'primary' | 确认按钮类型 |
| cancelLoading | boolean | false | 取消按钮加载状态 |
| confirmLoading | boolean | false | 确认按钮加载状态 |
| confirmDisabled | boolean | false | 确认按钮禁用状态 |

### 1.4 Events 定义

| Event | 说明 | 参数 |
|-------|------|------|
| update:modelValue | 对话框状态变化 | value: boolean |
| close | 对话框关闭 | - |
| cancel | 点击取消 | - |
| confirm | 点击确认 | - |

### 1.5 使用示例

```vue
<template>
  <BaseDialog
    v-model="visible"
    title="提示"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <p>对话框内容</p>
    <template #footer>
      <el-button @click="visible = false">自定义按钮</el-button>
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { BaseDialog } from '@/components/BaseDialog'

const visible = ref(false)

const handleConfirm = () => {
  // 确认逻辑
}

const handleCancel = () => {
  // 取消逻辑
}
</script>
```

---

## 2. SearchForm 组件优化

### 2.1 优化目的

移除未使用的防抖代码，简化搜索逻辑。

### 2.2 修改内容

| 修改项 | 说明 |
|--------|------|
| 移除 `debounce` prop | 已不再使用 |
| 移除 `searchTimer` 变量 | 防抖逻辑已删除 |
| 简化 `handleSearch` 方法 | 直接触发搜索，无延迟 |
| 移除 `onBeforeUnmount` 导入 | 已不再需要 |

### 2.3 优化效果

- 搜索响应更及时
- 减少代码复杂度
- 降低内存占用（无定时器残留）

---

## 3. API 调用方式统一

### 3.1 优化目的

统一项目中的 API 调用方式，使用封装的 `request` 工具函数替代原生 `fetch`。

### 3.2 修改范围

**修改的组件**：

| 目录 | 组件 |
|------|------|
| TrialList | ActivateModal.vue |
| TrialList | FreezeModal.vue |
| TrialList | DeleteModal.vue |
| TrialList | UnfreezeModal.vue |
| TrialList | VoidModal.vue |

### 3.3 使用方式

```typescript
// 优化前
const response = await fetch('/api/trial/activate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
const result = await response.json()

// 优化后
import request from '@/utils/request'

const result = await request.post('/api/trial/activate', data)
```

### 3.4 优势

| 特性 | 说明 |
|------|------|
| 自动 Token 携带 | 请求拦截器自动添加 Authorization 头 |
| 统一错误处理 | 响应拦截器统一处理 401、403、500 等错误 |
| 自动解析响应 | 直接返回 response.data |
| TypeScript 支持 | 泛型支持，更好的类型提示 |

---

## 4. 通用样式提取

### 4.1 优化目的

将重复出现的样式提取到全局样式文件，减少代码重复。

### 4.2 提取的样式

**文件位置**：`src/styles/common.scss`

| 样式类 | 说明 |
|--------|------|
| `.dialog-footer` | 对话框底部按钮区域布局 |
| `.dialog-content` | 对话框内容区域 |
| `.modal-form` | 表单区域样式 |

### 4.3 样式代码

```scss
// Dialog styles
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.dialog-content {
  margin-bottom: 20px;
}

.modal-form {
  margin-top: 16px;
}
```

---

## 5. API 响应类型定义

### 5.1 优化目的

创建统一的 API 响应类型，提高 TypeScript 类型安全。

### 5.2 类型定义

**文件位置**：`src/types/api.ts`

```typescript
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  total?: number
}

export interface PageResponse<T = any> {
  list: T[]
  total: number
}

export type ApiPageResponse<T = any> = ApiResponse<PageResponse<T>>

export interface BaseEntity {
  id: number
  createdAt?: string
  updatedAt?: string
}

export const SUCCESS_CODE = 200

export const isSuccess = <T = any>(response: ApiResponse<T>): boolean => {
  return response.code === SUCCESS_CODE
}
```

### 5.3 使用示例

```typescript
import type { ApiResponse, ApiPageResponse } from '@/types/api'

interface User {
  id: number
  name: string
  email: string
}

// 单个对象响应
const userResponse: ApiResponse<User> = {
  code: 200,
  message: 'success',
  data: { id: 1, name: 'John', email: 'john@example.com' }
}

// 分页响应
const userListResponse: ApiPageResponse<User> = {
  code: 200,
  message: 'success',
  data: {
    list: [{ id: 1, name: 'John', email: 'john@example.com' }],
    total: 100
  }
}
```

---

## 6. Dialog 错误处理完善

### 6.1 优化目的

完善 API 调用的错误处理，当响应码不为 200 时提示用户具体错误信息。

### 6.2 修改内容

为所有 Dialog 组件的 API 调用添加 else 分支：

```typescript
// 优化前
if (result.code === 200) {
  ElMessage.success('操作成功')
  emit('success')
}

// 优化后
if (result.code === 200) {
  ElMessage.success('操作成功')
  emit('success')
} else {
  ElMessage.error(result.message || '操作失败')
}
```

### 6.3 优化效果

- 用户可以看到具体的失败原因
- 提高用户体验
- 便于问题排查

---

## 7. 日志工具函数

### 7.1 优化目的

创建统一的日志工具函数，支持环境感知，生产环境自动禁用调试日志。

### 7.2 实现内容

**文件位置**：`src/utils/logger.ts`

### 7.3 API 说明

| 方法 | 说明 | 生产环境 |
|------|------|----------|
| `logger.log()` | 普通日志 | ✗ 禁用 |
| `logger.info()` | 信息日志 | ✗ 禁用 |
| `logger.warn()` | 警告日志 | ✓ 启用 |
| `logger.error()` | 错误日志 | ✓ 启用 |
| `logger.debug()` | 调试日志 | ✗ 禁用 |

### 7.4 使用示例

```typescript
import { logger } from '@/utils/logger'

// 调试日志（生产环境不输出）
logger.debug('Debug info:', { data: 'value' })

// 信息日志（生产环境不输出）
logger.info('User logged in:', { userId: 1 })

// 警告日志（始终输出）
logger.warn('Deprecated API used:', { api: '/old-api' })

// 错误日志（始终输出）
logger.error('Failed to load data:', error)
```

### 7.5 输出格式

```
[2026/05/07 10:30:00][ERROR] Failed to load data: Error: Network error
```

---

## 8. Console 语句清理

### 8.1 优化目的

移除调试代码，使用统一的日志工具函数。

### 8.2 修改范围

| 文件 | 修改内容 |
|------|----------|
| `src/stores/tabStore.ts` | console.error → logger.error |
| `src/components/BaseTablePage/BaseTablePage.vue` | console.error → logger.error |
| `src/components/SearchForm.vue` | console.error → logger.error |
| `src/components/DataTable/DataTable.vue` | console.error → logger.error |
| `src/views/Dashboard.vue` | 移除 console.log |
| `src/views/OperationLogs.vue` | 移除 console.log |
| `src/views/approval/ApprovalList.vue` | 移除 console.log |

### 8.3 优化效果

- 代码更整洁
- 生产环境无调试输出
- 统一的日志格式

---

## 附录：优化收益汇总

| 优化项 | 减少代码量 | 提高类型安全 | 改善用户体验 | 便于维护 |
|--------|------------|--------------|--------------|----------|
| BaseDialog 组件 | ✓ | ✓ | - | ✓ |
| SearchForm 优化 | ✓ | - | ✓ | ✓ |
| API 调用统一 | ✓ | ✓ | ✓ | ✓ |
| 通用样式提取 | ✓ | - | - | ✓ |
| API 类型定义 | - | ✓ | - | ✓ |
| 错误处理完善 | - | - | ✓ | ✓ |
| 日志工具函数 | - | ✓ | - | ✓ |
| Console 清理 | ✓ | ✓ | ✓ | ✓ |

---

## 后续优化建议

| 优先级 | 优化项 | 说明 |
|--------|--------|------|
| 高 | 迁移现有 Dialog 使用 BaseDialog | 减少重复代码 |
| 中 | 创建 API 模块 | 统一管理 API 调用 |
| 中 | 添加请求重试机制 | 提高系统稳定性 |
| 低 | 创建组件文档 | 提高团队协作效率 |