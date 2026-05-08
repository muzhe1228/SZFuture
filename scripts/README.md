# Release 脚本使用说明

本目录包含项目发布相关的脚本文件。

## 文件列表

| 文件 | 说明 |
|------|------|
| `release.sh` | GitHub Tag 发布脚本 |
| `README.md` | 脚本使用文档 |

## 快速开始

### 1. 交互式发布（推荐）

```bash
npm run release
```

执行流程：
1. 自动读取 `package.json` 中的版本号
2. 提示确认是否使用当前版本
3. 可选择输入自定义版本号
4. 创建 annotated tag
5. 推送到 GitHub

### 2. 快速发布

```bash
npm run release:tag
```

直接使用 `package.json` 中的版本号创建并推送 tag。

## 脚本功能

### release.sh

**特性**：
- 自动读取 package.json 版本号
- 支持自定义版本号
- 创建 annotated tag（包含注释信息）
- 验证 tag 创建结果
- 自动推送到远程仓库
- 友好的输出提示

**使用示例**：

```bash
# 执行脚本
bash scripts/release.sh

# 输出示例
======================================
  GitHub Tag Release Script
======================================
当前版本号: v0.1.0

是否使用当前版本 v0.1.0 打tag? (y/n): y

======================================
  准备创建 tag: v0.1.0
======================================

1. 创建 annotated tag...

2. 验证tag创建...
   ✓ Tag v0.1.0 创建成功

3. 推送tag到远程仓库...

======================================
  ✓ 成功推送 tag: v0.1.0
======================================

GitHub Release URL:
  https://github.com/your-username/your-repo/releases/tag/v0.1.0
```

## Git Tag 管理命令

### 创建 Tag

```bash
# 创建 annotated tag（推荐）
git tag -a v0.1.0 -m "Release v0.1.0"

# 创建 lightweight tag
git tag v0.1.0
```

### 查看 Tag

```bash
# 查看所有 tag
git tag -l

# 查看 tag 详情
git show v0.1.0
```

### 推送 Tag

```bash
# 推送单个 tag
git push origin v0.1.0

# 推送所有 tag
git push origin --tags
```

### 删除 Tag

```bash
# 删除本地 tag
git tag -d v0.1.0

# 删除远程 tag
git push origin :v0.1.0
```

## 推荐发布流程

```bash
# 1. 更新 package.json 版本号
# 使用 npm version 自动更新
npm version patch   # 0.1.0 → 0.1.1
npm version minor   # 0.1.0 → 0.2.0
npm version major   # 0.1.0 → 1.0.0

# 2. 提交版本更新
git commit -am "Bump version to v0.1.1"

# 3. 推送代码到远程
git push

# 4. 打 tag 并推送
npm run release
```

## 版本号规范

遵循 [Semantic Versioning](https://semver.org/)：

| 类型 | 格式 | 说明 |
|------|------|------|
| Major | `1.0.0` | 重大变更，不兼容的 API 修改 |
| Minor | `0.1.0` | 新增功能，向后兼容 |
| Patch | `0.0.1` | Bug 修复，向后兼容 |

## 注意事项

### 依赖要求

`release:tag` 命令需要安装 `jq`：

```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# CentOS/RHEL
sudo yum install jq
```

### GitHub 认证

确保已配置 GitHub 认证：

1. **SSH 方式**（推荐）：
   ```bash
   # 检查 SSH key
   ls -la ~/.ssh
   ```

2. **HTTPS 方式**：
   ```bash
   # 配置凭证缓存
   git config --global credential.helper store
   ```

### Tag 命名规范

- 使用 `v` 前缀：`v1.0.0`
- 版本号格式：`MAJOR.MINOR.PATCH`
- 避免使用特殊字符

## Troubleshooting

### 推送失败

**问题**：`git push origin v0.1.0` 失败

**解决方案**：
```bash
# 检查远程仓库配置
git remote -v

# 确保有权限访问仓库
git push -u origin main

# 检查网络连接
ping github.com
```

### 版本号读取失败

**问题**：脚本无法读取 package.json 版本号

**解决方案**：
```bash
# 检查 package.json 格式
cat package.json | grep '"version"'

# 手动指定版本号
bash scripts/release.sh
# 然后输入自定义版本号
```

## License

MIT
