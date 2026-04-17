# TypeScript 错误修复计划

## 项目 TypeScript 错误分析

通过运行 `npm run build` 命令，发现项目中存在 38 个 TypeScript 错误，主要分布在以下几个方面：

### 错误分类

1. **未使用的导入和变量**：10 个
2. **Dialog 组件缺少 title 属性**：2 个
3. **类型不匹配错误**：5 个
4. **找不到类型定义**：3 个
5. **不存在的属性访问**：18 个

## 修复方案

### 1. 修复未使用的导入和变量

- **src/components/Dialog/AuthList/FreezeModal.vue**：删除未使用的 `ref` 导入
- **src/components/Dialog/AuthList/ImportModal.vue**：删除未使用的 `ElMessage` 导入
- **src/components/Dialog/AuthList/VoidModal.vue**：删除未使用的 `ref` 导入
- **src/components/Dialog/CustomerList/DeleteConfirm.vue**：删除未使用的 `ref` 导入
- **src/components/Dialog/OrderList/DeleteConfirm.vue**：删除未使用的 `ref` 导入
- **src/views/auth/OrderList.vue**：删除未使用的 `OrderForm` 和 `DeleteConfirm` 导入
- **src/views/product/LicenseTemplateConfig.vue**：删除未使用的 `templateFormRules` 变量和 `resetTemplateForm` 函数
- **src/views/product/ProductModuleConfig.vue**：删除未使用的 `reactive` 导入

### 2. 修复 Dialog 组件缺少 title 属性

- **src/components/Dialog/CustomerList/DeleteConfirm.vue**：添加 `title` 属性
- **src/components/Dialog/OrderList/DeleteConfirm.vue**：添加 `title` 属性

### 3. 修复类型不匹配错误

- **src/components/Dialog/LicenseTemplateConfig/TemplateForm.vue**：修复 licenseType 类型
- **src/components/Dialog/LicenseTemplateConfig/TemplateForm.vue**：修复 floatingLicense 类型
- **src/components/Dialog/TrialList/TrialForm.vue**：修复 status 类型

### 4. 修复找不到类型定义

- **src/views/auth/OrderList.vue**：添加 `FormRules` 类型导入
- **src/views/product/LicenseTemplateConfig.vue**：添加 `FormRules` 类型导入和 `FormInstance` 导入

### 5. 修复不存在的属性访问

- **src/components/Dialog/OrderList/OrderForm.vue**：修复 Order 类型属性访问
- **src/components/Dialog/ProductModuleConfig/ModuleForm.vue**：修复 ProductModule 类型属性访问
- **src/components/Dialog/TrialList/TrialForm.vue**：修复 Trial 类型属性访问
- **src/views/product/ProductModuleConfig.vue**：修复 ProductModule 类型属性访问

## 执行步骤

1. 修复未使用的导入和变量
2. 修复 Dialog 组件缺少 title 属性
3. 修复类型不匹配错误
4. 修复找不到类型定义
5. 修复不存在的属性访问
6. 运行 TypeScript 类型检查验证修复结果
7. 运行构建命令验证修复结果

## 风险评估

- **风险等级**: 中
- **影响范围**: 多个组件和页面
- **修复难度**: 中等

## 预期结果

- 所有 TypeScript 错误被修复
- 项目可以正常编译和构建
- 不影响任何功能