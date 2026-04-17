import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  base: './',
  build: {
    // 配置输出目录
    outDir: 'dist',
    // 配置chunk大小警告限制
    chunkSizeWarningLimit: 500,
    // 配置CSS提取
    cssCodeSplit: false,
    // 启用Gzip压缩
    brotliSize: true,
    // 优化构建速度
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // 配置manualChunks
        manualChunks: {
          // 公共依赖
          vendor: ['vue', 'vue-router', 'pinia', 'axios'],
          // Element Plus 核心
          'element-core': ['element-plus'],
          // Element Plus 图标
          'element-icons': ['@element-plus/icons-vue'],
          // 图表库
          echarts: ['echarts'],
          // Vue ECharts 封装
          'vue-echarts': ['vue-echarts'],
          // 工具库
          utils: ['nprogress'],
          // Mock 数据（仅开发环境）
          mock: ['mockjs']
        }
      }
    }
  }
})
