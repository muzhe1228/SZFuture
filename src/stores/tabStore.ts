import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Tab } from '@/types/tab'
import { logger } from '@/utils/logger'

export const useTabStore = defineStore('tab', () => {
  const tabs = ref<Tab[]>([{ path: '/dashboard', title: '工作台' }])
  const currentPath = ref('/dashboard')

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
      logger.error('Failed to load tab state from localStorage:', error)
    }
  }

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('tabStore.tabs', JSON.stringify(tabs.value))
      localStorage.setItem('tabStore.currentPath', currentPath.value)
    } catch (error) {
      logger.error('Failed to save tab state to localStorage:', error)
    }
  }

  watch(
    [tabs, currentPath],
    () => {
      saveToLocalStorage()
    },
    { deep: true }
  )

  const addTab = (path: string, title: string) => {
    const existingTab = tabs.value.find((tab) => tab.path === path)
    if (!existingTab) {
      tabs.value.push({ path, title })
    }
  }

  const closeTab = (path: string) => {
    if (path === '/dashboard') return

    const index = tabs.value.findIndex((tab) => tab.path === path)
    if (index === -1) return

    tabs.value.splice(index, 1)

    if (path === currentPath.value) {
      const newTab = tabs.value[index - 1] || tabs.value[0]
      currentPath.value = newTab.path
    }
  }

  const closeOtherTabs = (path: string) => {
    if (path === '/dashboard') {
      tabs.value = [{ path: '/dashboard', title: '工作台' }]
    } else {
      tabs.value = [{ path: '/dashboard', title: '工作台' }, tabs.value.find((tab) => tab.path === path)!]
    }
    currentPath.value = path
  }

  const closeLeftTabs = (path: string) => {
    const index = tabs.value.findIndex((tab) => tab.path === path)
    if (index > 0) {
      tabs.value = [tabs.value[0], ...tabs.value.slice(index)]
      currentPath.value = path
    }
  }

  const closeRightTabs = (path: string) => {
    const index = tabs.value.findIndex((tab) => tab.path === path)
    if (index < tabs.value.length - 1) {
      tabs.value = tabs.value.slice(0, index + 1)
      currentPath.value = path
    }
  }

  const closeAllTabs = () => {
    tabs.value = [{ path: '/dashboard', title: '工作台' }]
    currentPath.value = '/dashboard'
  }

  const switchTab = (path: string) => {
    currentPath.value = path
  }

  const resetTabs = () => {
    tabs.value = [{ path: '/dashboard', title: '工作台' }]
    currentPath.value = '/dashboard'
  }

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
    switchTab,
    resetTabs,
  }
})
