# Table 组件封装计划

## 项目研究结论

通过搜索项目代码，发现以下页面使用了 el-table 组件：

1. **Messages.vue** - 消息列表页面
2. **SystemLogs.vue** - 系统日志页面
3. **ApprovalList.vue** - 审批列表页面
4. **TrialList.vue** - 试用列表页面
5. **LicenseTemplateConfig.vue** - 许可证模版配置页面
6. **UserManagement.vue** - 用户管理页面
7. **ProductModuleConfig.vue** - 产品模块配置页面
8. **DepartmentManagement.vue** - 部门管理页面
9. **OperationLogs.vue** - 操作日志页面
10. **RoleManagement.vue** - 角色管理页面
11. **AuthList.vue** - 授权列表页面
12. **OrderList.vue** - 订单列表页面
13. **CustomerList.vue** - 客户列表页面

## 组件设计

### DataTable 组件属性 (Props)

```typescript
interface DataTableProps {
  // 表格配置
  columns: ColumnConfig[]  // 列配置数组
  data: any[]             // 表格数据
  loading: boolean         // 加载状态
  total: number           // 总条数

  // 分页配置
  currentPage: number
  pageSize: number
  pageSizes: number[]

  // 表格头部配置
  title: string           // 表格标题
  showColumnSettings?: boolean  // 是否显示列设置按钮

  // 操作按钮配置
  actions?: ActionButton[]  // 操作按钮配置

  // 事件回调
  onPageChange?: (page: number, pageSize: number) => void
  onSelectionChange?: (selection: any[]) => void
  onColumnSettings?: () => void
  onAction?: (action: string, row: any) => void
}

interface ColumnConfig {
  key: string
  label: string
  prop: string
  width?: string
  minWidth?: string
  align?: 'left' | 'center' | 'right'
  visible?: boolean
  hasTemplate?: boolean
}

interface ActionButton {
  key: string
  label: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  icon?: any
  condition?: (row: any) => boolean  // 显示条件
}
```

### 组件功能

1. **表格头部 (TableHeader)**
   - 左侧：表格标题 + 总条数
   - 右侧：列设置按钮（可选）+ 自定义操作按钮

2. **动态列渲染**
   - 支持 v-for 遍历列配置
   - 支持列的显示/隐藏
   - 支持自定义列模板

3. **动态操作按钮**
   - 支持配置多个操作按钮
   - 支持按钮类型（primary/success/warning/danger）
   - 支持显示条件
   - 支持图标

4. **分页组件**
   - 支持自定义页大小选项
   - 支持总条数显示
   - 支持页码跳转

5. **列设置功能**
   - 右侧抽屉显示所有列
   - 可通过开关控制列的显示/隐藏
   - 配置自动保存到 localStorage

## 实施步骤

### 第一阶段：创建 DataTable 组件

1. **创建 DataTable 组件文件**
   - 创建 `/src/components/DataTable.vue`
   - 定义组件的 Props 和 Emits
   - 实现表格头部
   - 实现动态列渲染
   - 实现动态操作按钮
   - 实现列设置抽屉
   - 实现分页组件

2. **创建类型定义文件**
   - 创建 `/src/components/DataTable/types.ts`
   - 定义 ColumnConfig 接口
   - 定义 ActionButton 接口
   - 定义 DataTableProps 接口

### 第二阶段：修改 Messages.vue

1. 替换现有的表格实现为 DataTable 组件
2. 配置 columns 属性
3. 配置 actions 属性
4. 配置 title 和 total
5. 测试功能完整性

### 第三阶段：应用到其他页面

1. **SystemLogs.vue** - 系统日志页面
2. **ApprovalList.vue** - 审批列表页面
3. **TrialList.vue** - 试用列表页面
4. **LicenseTemplateConfig.vue** - 许可证模版配置页面
5. **UserManagement.vue** - 用户管理页面
6. **ProductModuleConfig.vue** - 产品模块配置页面
7. **DepartmentManagement.vue** - 部门管理页面
8. **OperationLogs.vue** - 操作日志页面
9. **RoleManagement.vue** - 角色管理页面
10. **AuthList.vue** - 授权列表页面
11. **OrderList.vue** - 订单列表页面
12. **CustomerList.vue** - 客户列表页面

### 第四阶段：测试和验证

1. 测试每个页面的表格功能
2. 测试列设置功能
3. 测试分页功能
4. 测试操作按钮功能
5. 验证代码质量和一致性

## 潜在依赖和考虑因素

- **依赖**：Element Plus 组件库（已使用）
- **存储**：使用 localStorage 存储列配置
- **兼容性**：确保与现有代码的兼容性
- **用户体验**：确保操作简单直观
- **性能**：确保大数据量下的性能表现

## 预期效果

- 所有页面使用统一的 DataTable 组件
- 代码结构更加清晰，便于维护和扩展
- 表格头部统一，包含标题、总条数和操作按钮
- 列设置功能可在所有页面使用
- 操作按钮可动态配置，支持显示条件