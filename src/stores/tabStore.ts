import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Tab } from '@/types/tab'

export const useTabStore = defineStore('tab', () => {
  const tabs = ref<Tab[]>([
    { path: '/dashboard', title: '工作台' }
  ])
  const currentPath = ref('/dashboard')

  // 从本地存储加载标签页状态
  const loadFromLocalStorage = () => {
    try {
      const savedTabs = localStorage.getItem('tabStore.tabs')
      const savedCurrentPath = localStorage.getItem('tabStore.currentPath')
      if (savedTabs) {
        tabs.value = JSON.parse(savedTabs)
      }
      if (savedCurrentPath) {
        currentPath.value = savedCurrentPath
      }
    } catch (error) {
      console.error('Failed to load tab state from localStorage:', error)
    }
  }

  // 保存标签页状态到本地存储
  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('tabStore.tabs', JSON.stringify(tabs.value))
      localStorage.setItem('tabStore.currentPath', currentPath.value)
    } catch (error) {
      console.error('Failed to save tab state to localStorage:', error)
    }
  }

  // 监听状态变化，自动保存到本地存储
  watch(
    [tabs, currentPath],
    () => {
      saveToLocalStorage()
    },
    { deep: true }
  )

  // 添加标签页
  const addTab = (path: string, title: string) => {
    const existingTab = tabs.value.find((tab) => tab.path === path)
    if (!existingTab) {
      tabs.value.push({ path, title })
    }
  }

  // 关闭标签页
  const closeTab = (path: string) => {
    if (path === '/dashboard') return // 首页不能关闭

    const index = tabs.value.findIndex((tab) => tab.path === path)
    if (index === -1) return

    tabs.value.splice(index, 1)

    // 如果关闭的是当前标签页，切换到上一个标签页
    if (path === currentPath.value) {
      const newTab = tabs.value[index - 1] || tabs.value[0]
      currentPath.value = newTab.path
    }
  }

  // 关闭其他标签页
  const closeOtherTabs = (path: string) => {
    if (path === '/dashboard') {
      tabs.value = [{ path: '/dashboard', title: '工作台' }]
    } else {
      tabs.value = [
        { path: '/dashboard', title: '工作台' },
        tabs.value.find((tab) => tab.path === path)!
      ]
    }
    currentPath.value = path
  }

  // 关闭左侧标签页
  const closeLeftTabs = (path: string) => {
    const index = tabs.value.findIndex((tab) => tab.path === path)
    if (index > 0) {
      tabs.value = [
        tabs.value[0], // 首页
        ...tabs.value.slice(index)
      ]
      currentPath.value = path
    }
  }

  // 关闭右侧标签页
  const closeRightTabs = (path: string) => {
    const index = tabs.value.findIndex((tab) => tab.path === path)
    if (index < tabs.value.length - 1) {
      tabs.value = tabs.value.slice(0, index + 1)
      currentPath.value = path
    }
  }

  // 关闭所有标签页
  const closeAllTabs = () => {
    tabs.value = [{ path: '/dashboard', title: '工作台' }]
    currentPath.value = '/dashboard'
  }

  // 切换标签页
  const switchTab = (path: string) => {
    currentPath.value = path
  }

  // 初始化
  loadFromLocalStorage()

  return {
    tabs,
    currentPath,
    addTab,
    closeTab,
    closeOtherTabs,
    closeLeftTabs,
    closeRightTabs,
    closeAllTabs,
    switchTab
  }
})
