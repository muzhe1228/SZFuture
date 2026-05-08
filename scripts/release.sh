#!/bin/bash

set -e

echo "======================================"
echo "  GitHub Tag Release Script"
echo "======================================"

# 获取当前版本号
VERSION=$(cat package.json | grep '"version"' | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d ' ')

echo "当前版本号: v$VERSION"
echo ""

# 确认版本号
read -p "是否使用当前版本 v$VERSION 打tag? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    read -p "请输入自定义版本号: " CUSTOM_VERSION
    VERSION="$CUSTOM_VERSION"
fi

TAG="v$VERSION"

echo ""
echo "======================================"
echo "  准备创建 tag: $TAG"
echo "======================================"

# 创建tag
echo ""
echo "1. 创建 annotated tag..."
git tag -a "$TAG" -m "Release $TAG"

# 验证tag
echo ""
echo "2. 验证tag创建..."
git tag -l "$TAG"

if [ $? -eq 0 ]; then
    echo "   ✓ Tag $TAG 创建成功"
else
    echo "   ✗ Tag $TAG 创建失败"
    exit 1
fi

# 推送到远程
echo ""
echo "3. 推送tag到远程仓库..."
git push origin "$TAG"

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "  ✓ 成功推送 tag: $TAG"
    echo "======================================"
    echo ""
    echo "GitHub Release URL:"
    echo "  https://github.com/your-username/your-repo/releases/tag/$TAG"
    echo ""
else
    echo ""
    echo "======================================"
    echo "  ✗ 推送失败，请检查网络或权限"
    echo "======================================"
    exit 1
fi
