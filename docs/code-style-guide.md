# 项目代码规范文档

## 1. 项目概述

### 1.1 项目技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue | 3.5.13 |
| 路由 | Vue Router | 4.5.0 |
| 状态管理 | Pinia | 2.3.0 |
| UI 组件 | Element Plus | 2.9.0 |
| 图标 | @element-plus/icons-vue | 2.3.1 |
| 构建工具 | Vite | 6.0.0 |
| 语言 | TypeScript | ~5.7.0 |
| 样式 | SCSS | ^1.99.0 |
| 图表 | ECharts / vue-echarts | ^6.0.0 / ^8.0.1 |
| HTTP 客户端 | Axios | ^1.7.0 |
| 代码规范 | ESLint + Prettier | - |

### 1.2 项目结构

```
src/
├── components/          # 公共组件
│   ├── BaseDialog/      # 基础弹窗组件
│   ├── BaseTablePage/   # 基础表格页面组件
│   ├── DataTable/       # 数据表格组件
│   ├── SearchForm/      # 搜索表单组件
│   ├── RouteTransition/ # 路由过渡组件
│   └── Dialog/          # 对话框组件
├── composables/         # 组合式函数
│   ├── useCrud.ts       # CRUD 操作封装
│   ├── useForm.ts       # 表单逻辑封装
│   └── useTable.ts      # 表格逻辑封装
├── config/             # 配置文件
│   ├── auth/            # 授权相关配置
│   ├── common/          # 公共配置
│   └── menu.ts          # 菜单配置
├── stores/             # Pinia 状态管理
│   ├── tabStore.ts      # 标签页状态
│   └── user.ts          # 用户状态
├── views/              # 页面视图
│   ├── auth/           # 授权管理
│   ├── trial/          # 试用管理
│   ├── dashboard/      # 工作台
│   └── system/         # 系统设置
├── utils/              # 工具函数
│   ├── logger/         # 日志工具
│   └── request.ts      # HTTP 请求封装
├── types/              # TypeScript 类型定义
├── api/                # API 接口定义
├── mock/               # Mock 数据
├── layout/             # 布局组件
└── main.ts             # 入口文件
```

---

## 2. TypeScript 规范

### 2.1 基础类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `string` | 字符串 | `const name: string = 'admin'` |
| `number` | 数字 | `const age: number = 25` |
| `boolean` | 布尔值 | `const active: boolean = true` |
| `any` | 任意类型 | 尽量避免使用 |
| `unknown` | 未知类型 | 需要类型断言 |
| `void` | 无返回值 | `function log(): void {}` |
| `never` | 永远不会返回 | 异常处理函数 |

### 2.2 接口定义

```typescript
interface User {
  id: number
  username: string
  email?: string  // 可选属性
  readonly createdAt: Date  // 只读属性
}
```

### 2.3 类型别名

```typescript
type Status = 'active' | 'inactive' | 'pending'
type Response<T> = {
  code: number
  data: T
  message: string
}
```

### 2.4 泛型

```typescript
function createArray<T>(length: number, value: T): T[] {
  return Array(length).fill(value)
}
```

### 2.5 ESLint 规则

| 规则 | 配置 | 说明 |
|------|------|------|
| `no-unused-vars` | error | 禁止未使用的变量 |
| `no-explicit-any` | warn | 避免使用 any 类型 |
| `explicit-function-return-type` | off | 无需显式声明返回类型 |
| `varsIgnorePattern` | `^_` | 下划线开头的变量可忽略 |

---

## 3. Vue 组件规范

### 3.1 组件命名

- **组件名**：使用 PascalCase（大驼峰）
- **文件名**：使用 PascalCase
- **示例**：`UserForm.vue`, `BaseDialog.vue`

### 3.2 Script Setup

```vue
<script setup lang="ts">
// 导入顺序：第三方库 → 内部模块 → 类型定义
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { logger } from '@/utils/logger'
import type { User } from '@/types/user'

// Props 定义
const props = defineProps<{
  user: User
  editable?: boolean
}>()

// Emits 定义
const emit = defineEmits<{
  update: [user: User]
  delete: [id: number]
}>()

// 响应式状态
const form = ref<User>({ ...props.user })

// 计算属性
const isDirty = computed(() => JSON.stringify(form.value) !== JSON.stringify(props.user))

// 方法定义
function handleSubmit() {
  emit('update', form.value)
}
</script>
```

### 3.3 Template 规范

```vue
<template>
  <!-- 根元素应有明确的类名 -->
  <div class="user-form">
    <!-- 元素顺序：表单控件 → 操作按钮 -->
    <el-form :model="form">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" />
      </el-form-item>
    </el-form>
    
    <!-- 按钮组使用 flex 布局 -->
    <div class="form-actions">
      <el-button @click="handleSubmit">提交</el-button>
    </div>
  </div>
</template>
```

### 3.4 Style 规范

```vue
<style lang="scss" scoped>
/* 使用 BEM 命名规范 */
.user-form {
  padding: 16px;
  
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
  
  .form-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
```

---

## 4. 代码格式化规范

### 4.1 Prettier 配置

| 选项 | 值 | 说明 |
|------|------|------|
| `printWidth` | 120 | 单行最大字符数 |
| `tabWidth` | 2 | 制表符宽度 |
| `useTabs` | false | 使用空格代替制表符 |
| `semi` | true | 语句结尾加分号 |
| `singleQuote` | true | 使用单引号 |
| `trailingComma` | es5 | 尾随逗号 |
| `arrowParens` | always | 箭头函数参数加括号 |

### 4.2 空格规范

- 关键字后加空格：`if (condition)`
- 逗号后加空格：`const a = [1, 2, 3]`
- 操作符两侧加空格：`a + b`
- 函数参数逗号后加空格：`fn(a, b)`

### 4.3 换行规范

- 单行超过 120 字符时换行
- 条件语句的每个条件占一行
- 对象/数组字面量每行一个属性

---

## 5. 目录与文件命名规范

### 5.1 目录命名

- 使用 kebab-case（短横线分隔）
- 示例：`user-management`, `base-table-page`

### 5.2 文件命名

| 文件类型 | 命名规则 | 示例 |
|----------|----------|------|
| 组件 | PascalCase | `UserForm.vue` |
| 工具函数 | camelCase | `request.ts` |
| 类型定义 | PascalCase | `User.ts` |
| 配置文件 | kebab-case | `search-fields.ts` |
| Store | camelCase | `user.ts` |

---

## 6. 注释规范

### 6.1 单行注释

```typescript
// 计算用户年龄
const age = calculateAge(birthDate)
```

### 6.2 多行注释

```typescript
/**
 * 用户登录函数
 * @param username 用户名
 * @param password 密码
 * @returns 用户信息
 */
async function login(username: string, password: string): Promise<User> {
  // ...
}
```

### 6.3 组件注释

```vue
<script setup lang="ts">
/**
 * 用户表单组件
 * @props user - 用户数据
 * @props editable - 是否可编辑
 * @emit update - 更新用户
 * @emit delete - 删除用户
 */
</script>
```

---

## 7. 状态管理规范

### 7.1 Pinia Store 结构

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref('')
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  
  // 方法
  function login(credentials: LoginCredentials) {
    // ...
  }
  
  function logout() {
    user.value = null
    token.value = ''
  }
  
  return { user, token, isLoggedIn, login, logout }
})
```

---

## 8. API 请求规范

### 8.1 请求封装

```typescript
// 使用统一的 request 封装
import request from '@/utils/request'

export const userApi = {
  list: (params: ListParams) => request.get('/api/users', { params }),
  create: (data: CreateUser) => request.post('/api/users', data),
  update: (id: number, data: UpdateUser) => request.put(`/api/users/${id}`, data),
  delete: (id: number) => request.delete(`/api/users/${id}`),
}
```

### 8.2 响应处理

```typescript
// 使用拦截器统一处理
request.interceptors.response.use(
  (response) => {
    logger.info(`[API] ${response.config.method} ${response.config.url}`, response.data)
    return response.data
  },
  (error) => {
    logger.error(`[API ERROR] ${error.config.method} ${error.config.url}`, error)
    // 统一错误处理
  }
)
```

---

## 9. 日志规范

### 9.1 Logger 使用

```typescript
import { logger } from '@/utils/logger'

// 开发环境输出，生产环境静默
logger.log('普通日志')
logger.info('信息日志')
logger.debug('调试日志')

// 所有环境输出
logger.warn('警告日志')
logger.error('错误日志')
```

### 9.2 日志配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `showTime` | true (开发) | 显示时间戳 |
| `showLevel` | true | 显示日志级别 |
| `useColors` | true (开发) | 使用颜色输出 |
| `stringify` | false | 对象转为 JSON |

---

## 10. Git 提交规范

### 10.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 10.2 提交类型

| 类型 | 说明 |
|------|------|
| `feat` | 新增功能 |
| `fix` | 修复 Bug |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构（不新增功能也不修复 Bug） |
| `perf` | 性能优化 |
| `test` | 测试用例 |
| `chore` | 构建/工具更新 |

### 10.3 示例

```
feat(user): 添加用户登录功能

- 实现登录接口调用
- 添加表单验证
- 更新路由守卫

Closes #123
```

---

## 11. 构建与部署规范

### 11.1 命令说明

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run lint` | ESLint 检查 |
| `npm run lint:fix` | ESLint 自动修复 |
| `npm run format` | Prettier 格式化 |
| `npm run release` | 创建版本标签 |

### 11.2 构建配置

- 输出目录：`dist/`
- 压缩方式：Terser
- Gzip 压缩：启用
- 公共路径：`./`

---

## 12. 安全规范

### 12.1 注意事项

1. **避免 XSS**：使用 Vue 的模板语法自动转义
2. **避免 CSRF**：使用 Token 验证
3. **敏感信息**：不要在代码中硬编码密钥
4. **输入验证**：对用户输入进行严格验证
5. **HTTPS**：生产环境使用 HTTPS

---

## 附录：常用命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format

# 创建版本标签
npm run release
```
