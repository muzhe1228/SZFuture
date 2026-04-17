# 弹窗组件重构计划

## 项目现状分析

经过分析，项目中共有 10 个页面使用了弹窗（el-dialog）：

1. `/src/views/system/RoleManagement.vue` - 角色管理弹窗
2. `/src/views/system/DepartmentManagement.vue` - 部门管理弹窗
3. `/src/views/system/UserManagement.vue` - 用户管理弹窗
4. `/src/views/product/ProductModuleConfig.vue` - 产品模块配置弹窗
5. `/src/views/auth/CustomerList.vue` - 客户列表弹窗
6. `/src/views/product/LicenseTemplateConfig.vue` - 许可证模板配置弹窗
7. `/src/views/auth/OrderList.vue` - 订单列表弹窗
8. `/src/views/auth/AuthList.vue` - 授权列表弹窗
9. `/src/views/trial/TrialList.vue` - 试用列表弹窗
10. `/src/views/Messages.vue` - 消息详情弹窗

## 重构目标

1. **分离弹窗逻辑**：将每个页面的弹窗逻辑从页面组件中分离出来，放入独立的弹窗组件中
2. **保持功能不变**：确保重构后的弹窗功能与原来完全一致
3. **遵循单一职责原则**：每个组件只负责一个功能，避免文件过长
4. **统一管理**：在 `components/Dialog` 文件夹下按页面创建子文件夹，统一管理所有弹窗组件

## 重构步骤

### 1. 创建弹窗组件目录结构

在 `components/Dialog` 文件夹下创建以下子目录：

```
components/
  Dialog/
    index.vue          # 基础 Dialog 组件
    index.ts           # 导出文件
    RoleManagement/    # 角色管理弹窗
    DepartmentManagement/ # 部门管理弹窗
    UserManagement/    # 用户管理弹窗
    ProductModuleConfig/ # 产品模块配置弹窗
    CustomerList/      # 客户列表弹窗
    LicenseTemplateConfig/ # 许可证模板配置弹窗
    OrderList/         # 订单列表弹窗
    AuthList/          # 授权列表弹窗
    TrialList/         # 试用列表弹窗
    Messages/          # 消息详情弹窗
```

### 2. 为每个页面创建弹窗组件

为每个页面创建对应的弹窗组件，将弹窗逻辑从页面中移到弹窗组件中。

### 3. 修改页面组件

在页面组件中引入对应的弹窗组件，替换原来的 el-dialog。

### 4. 测试验证

确保所有弹窗功能正常工作，与原来的功能一致。

## 具体实施计划

### 1. 首先处理 Messages.vue 的消息详情弹窗

- 创建 `components/Dialog/Messages/MessageDetail.vue`
- 将消息详情弹窗逻辑从 Messages.vue 移到 MessageDetail.vue
- 修改 Messages.vue 引入并使用 MessageDetail 组件

### 2. 处理 RoleManagement.vue 的角色管理弹窗

- 创建 `components/Dialog/RoleManagement/RoleForm.vue`
- 将角色管理弹窗逻辑从 RoleManagement.vue 移到 RoleForm.vue
- 修改 RoleManagement.vue 引入并使用 RoleForm 组件

### 3. 处理其他页面的弹窗

按照同样的方式，为其他页面创建对应的弹窗组件。

## 技术要点

1. **组件通信**：使用 props 和 emit 实现弹窗组件与页面组件的通信
2. **表单验证**：如果弹窗包含表单，确保表单验证逻辑正确迁移
3. **数据传递**：确保弹窗组件能正确接收和处理页面传递的数据
4. **事件处理**：确保弹窗组件能正确触发和处理事件

## 预期效果

- 页面组件代码更加简洁，只关注核心业务逻辑
- 弹窗组件独立管理，便于维护和扩展
- 遵循单一职责原则，提高代码质量
- 统一弹窗管理，便于后续统一修改和优化