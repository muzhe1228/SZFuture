# Table 样式统一与数据匹配计划

## 项目现状分析

### 1. Table 组件使用情况
项目中使用 `el-table` 组件的页面包括：
- `/src/views/Messages.vue`
- `/src/views/auth/AuthList.vue`
- `/src/views/audit/SystemLogs.vue`
- `/src/views/auth/OrderList.vue`
- `/src/views/auth/CustomerList.vue`
- `/src/views/product/LicenseTemplateConfig.vue`
- `/src/views/product/ProductModuleConfig.vue`
- `/src/views/system/RoleManagement.vue`
- `/src/views/system/DepartmentManagement.vue`
- `/src/views/system/UserManagement.vue`
- `/src/views/trial/TrialList.vue`
- `/src/views/approval/ApprovalList.vue`
- `/src/views/OperationLogs.vue`

### 2. 现有 Table 样式差异
从初步分析来看，不同页面的 table 组件可能存在以下差异：
- 边框样式
- 行高和间距
- 表头样式
- 单元格对齐方式
- 操作列的布局
- 加载状态样式

### 3. Mock 数据与页面显示匹配情况
从 `mock/auth.ts` 文件分析，存在以下潜在问题：
- 数据字段名称可能与页面显示字段不匹配
- 状态值可能需要映射（如 `authStatus` 字段的值与页面显示的状态文本可能不一致）
- 日期格式可能需要统一

## 实施计划

### 第一阶段：创建统一的 Table 样式

1. **创建全局 Table 样式文件**
   - 创建 `/src/styles/table.scss` 文件
   - 定义统一的 table 样式，包括：
     - 边框样式
     - 行高和间距
     - 表头样式
     - 单元格对齐方式
     - 操作列布局
     - 加载状态样式

2. **在全局样式中引入**
   - 修改 `/src/main.ts` 文件，引入统一的 table 样式

### 第二阶段：检查并统一所有页面的 Table 组件

1. **逐一检查每个页面的 Table 组件**
   - 确保所有 table 组件使用统一的样式
   - 调整 table 列的宽度、对齐方式等属性
   - 统一操作列的布局和样式

2. **优化 Table 组件配置**
   - 统一 `border`、`stripe`、`highlight-current-row` 等属性
   - 优化列的 `min-width` 和 `width` 设置
   - 统一加载状态的显示方式

### 第三阶段：检查并修正 Mock 数据与页面显示的匹配

1. **分析每个页面的数据结构**
   - 检查页面组件中使用的数据字段
   - 对比 mock 数据中的字段名称和值

2. **修正不匹配的数据**
   - 调整 mock 数据的字段名称，确保与页面组件匹配
   - 修正状态值的映射关系
   - 统一日期格式和其他数据格式

3. **测试数据显示**
   - 运行项目，检查每个页面的数据显示是否正确
   - 验证操作功能是否正常

### 第四阶段：验证和优化

1. **功能验证**
   - 测试所有页面的 table 功能
   - 确保数据显示正确
   - 验证操作功能正常

2. **性能优化**
   - 优化 table 的渲染性能
   - 确保大数据量时的显示效果

3. **响应式优化**
   - 确保 table 在不同屏幕尺寸下的显示效果
   - 优化移动端的显示

## 预期成果

1. **统一的 Table 样式**
   - 所有页面的 table 组件具有一致的外观
   - 统一的边框、行高、间距等样式

2. **数据显示匹配**
   - Mock 数据与页面显示完全匹配
   - 状态值显示正确
   - 日期格式统一

3. **功能完善**
   - 所有 table 功能正常
   - 操作按钮和交互正常

4. **性能优化**
   - Table 渲染性能良好
   - 响应式显示效果优秀

## 风险评估

### 潜在风险
1. **样式冲突**：全局样式可能与现有页面样式冲突
2. **数据结构变更**：修改 mock 数据可能影响其他功能
3. **性能问题**：统一样式后可能影响页面加载性能

### 风险缓解措施
1. **样式隔离**：使用 scoped 样式或命名空间避免冲突
2. **数据备份**：修改 mock 数据前备份原始数据
3. **性能测试**：在修改后进行性能测试

## 实施步骤

1. **准备阶段**：创建统一的 table 样式文件
2. **样式统一**：修改所有页面的 table 组件
3. **数据匹配**：修正 mock 数据与页面显示的匹配
4. **验证测试**：测试所有页面的功能和显示
5. **优化调整**：根据测试结果进行优化

## 时间估计

- **准备阶段**：1 小时
- **样式统一**：2-3 小时
- **数据匹配**：1-2 小时
- **验证测试**：1 小时
- **优化调整**：0.5-1 小时

总耗时：5.5-8 小时