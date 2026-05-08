<template>
  <div class="forbidden-page">
    <div class="forbidden-container">
      <div class="forbidden-icon">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="60"
            cy="60"
            r="50"
            stroke="#ff4d4f"
            stroke-width="4"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-dasharray="8 4"
          />
          <path d="M35 35L85 85M85 35L35 85" stroke="#ff4d4f" stroke-width="4" stroke-linecap="round" />
        </svg>
      </div>
      <h1 class="forbidden-title">403</h1>
      <p class="forbidden-message">您没有访问此页面的权限</p>
      <p class="forbidden-tip">请联系管理员获取相应权限</p>
      <el-button type="primary" @click="goBack">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  const goBack = () => {
    window.location.href = '/'
  }
</script>

<style lang="scss" scoped>
  .forbidden-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .forbidden-container {
    text-align: center;
    background: white;
    padding: 60px 80px;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }

  .forbidden-icon {
    margin-bottom: 20px;
  }

  .forbidden-title {
    font-size: 48px;
    font-weight: bold;
    color: #ff4d4f;
    margin: 0 0 16px 0;
  }

  .forbidden-message {
    font-size: 18px;
    color: #666;
    margin: 0 0 8px 0;
  }

  .forbidden-tip {
    font-size: 14px;
    color: #999;
    margin: 0 0 32px 0;
  }

  .el-button {
    width: 160px;
    height: 44px;
    font-size: 16px;
  }
</style>
