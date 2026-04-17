# admin-dashboard

## 项目简介

- **项目名称**: admin-dashboard
- **项目类型**: Vue 3 + TypeScript + Vite 前端管理系统
- **项目版本**: 0.1.0
- **项目概述**: 许可授权管理系统，用于管理软件许可授权、客户信息、订单等核心业务流程

## 技术栈

### 核心技术
- **前端框架**: Vue 3.5.13
- **TypeScript**: 5.7.0
- **构建工具**: Vite 6.0.0
- **状态管理**: Pinia 2.3.0
- **路由管理**: Vue Router 4.5.0

### UI组件库
- **Element Plus**: 2.9.0
- **Element Plus Icons**: 2.3.1

### 第三方库
- **Axios**: 1.7.0 (HTTP请求)
- **ECharts**: 6.0.0 (数据可视化)
- **vue-echarts**: 8.0.1 (Vue封装的ECharts)
- **NProgress**: 0.2.0 (加载进度条)
- **Mock.js**: 1.1.0 (开发环境模拟数据)

## 项目结构

```
src/
├── api/            # API接口定义
├── components/     # 公共组件
│   └── SearchForm/ # 搜索表单组件
├── layouts/        # 布局组件
│   └── MainLayout.vue # 主布局
├── mock/           # 模拟数据
├── router/         # 路由配置
├── store/          # 状态管理
├── types/          # TypeScript类型定义
├── utils/          # 工具函数
│   ├── auth.ts     # 认证相关
│   └── request.ts  # HTTP请求配置
├── views/          # 页面组件
│   ├── approval/   # 审批管理
│   ├── audit/      # 审计日志
│   ├── auth/       # 授权管理
│   ├── product/    # 产品管理
│   ├── system/     # 系统管理
│   ├── trial/      # 试用管理
│   ├── Dashboard.vue       # 工作台
│   ├── ForgotPassword.vue  # 忘记密码
│   ├── Login.vue           # 登录页
│   ├── Messages.vue        # 消息中心
│   └── OperationLogs.vue   # 操作日志
├── App.vue         # 根组件
└── main.ts         # 入口文件
```

## 功能模块

### 认证模块
- 登录页 (`/login`)
- 忘记密码 (`/forgot-password`)

### 工作台
- 仪表盘 (`/dashboard`)
- 消息中心 (`/messages`)

### 授权管理
- 试用列表 (`/auth/trials`)
- 授权列表 (`/auth/list`)
- 订单列表 (`/auth/orders`)
- 客户列表 (`/auth/customers`)

### 产品管理
- 产品模块配置 (`/product/modules`)
- 许可模版配置 (`/product/templates`)

### 系统管理
- 用户管理 (`/system/users`)
- 角色管理 (`/system/roles`)
- 部门管理 (`/system/departments`)
- 系统配置 (`/system/config`)

### 审计模块
- 操作日志 (`/audit/operations`)
- 系统日志 (`/audit/system`)

### 审批模块
- 审批列表 (`/approval/list`)

## 快速开始

### 环境要求
- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本

### 安装依赖

```bash
npm install
# 或使用 yarn
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或使用 yarn
yarn dev
```

开发服务器将在 `http://localhost:3000` 启动，并自动打开浏览器。

### 构建生产版本

```bash
npm run build
# 或使用 yarn
yarn build
```

构建结果将生成在 `dist` 目录中。

### 预览生产构建

```bash
npm run preview
# 或使用 yarn
yarn preview
```

## 项目特点

1. **完整的权限控制**：基于token的认证机制
2. **模块化设计**：清晰的目录结构和功能划分
3. **TypeScript支持**：全项目TypeScript类型定义
4. **Mock数据**：开发环境提供完整的模拟数据
5. **响应式布局**：基于Element Plus的响应式设计
6. **数据可视化**：集成ECharts实现数据图表展示
7. **加载状态管理**：使用NProgress提供良好的用户体验
8. **完整的授权管理**：支持激活、冻结、解冻、延期、作废等操作
9. **产品管理**：实现产品模块和许可模版的增删改查功能
10. **UI交互对齐**：与uiPage交互稿保持一致的设计风格

## 注意事项

- **开发环境**：开发模式下自动加载mock数据，无需后端API支持
- **生产环境**：需要配置真实的API基础URL（通过环境变量 `VITE_API_BASE_URL`）
- **路由权限控制**：基于localStorage的token，实际项目中建议使用更安全的认证方式
- **UI组件**：项目使用Element Plus作为UI组件库，已配置中文语言
- **构建优化**：生产构建会自动进行代码分割和压缩

## 许可证

MIT License