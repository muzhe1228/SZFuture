<template>
  <div class="tab-bar">
    <div class="tab-list">
      <div class="tab-items-container">
        <div v-for="tab in tabStore.tabs" :key="tab.path" class="tab-item" :class="{ active: tabStore.currentPath === tab.path }"
          @click="switchTab(tab)" @contextmenu.prevent="openContextMenu($event, tab)">
          <span class="tab-title">{{ tab.title }}</span>
          <el-icon v-if="tab.path !== '/dashboard'" class="tab-close" @click.stop="closeTab(tab)">
            <Close />
          </el-icon>
        </div>
      </div>

      <!-- 右侧下拉菜单 -->
      <div class="tab-right-menu">
        <el-dropdown trigger="click">
          <el-icon class="tab-menu-button">
            <Setting />
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="refreshCurrentTab">
                <el-icon>
                  <Refresh />
                </el-icon>
                <span>刷新页面</span>
              </el-dropdown-item>
              <el-dropdown-item @click="closeOtherTabs">
                <el-icon>
                  <More />
                </el-icon>
                <span>关闭其他</span>
              </el-dropdown-item>
              <template v-if="currentTab?.path !== '/dashboard'">
                <el-dropdown-item v-if="tabStore.tabs.length > 2 && currentIndex > 1" @click="closeLeftTabs">
                  <el-icon>
                    <ArrowLeft />
                  </el-icon>
                  <span>关闭左侧</span>
                </el-dropdown-item>
                <el-dropdown-item v-if="tabStore.tabs.length > 1 && currentIndex < tabStore.tabs.length - 1" @click="closeRightTabs">
                  <el-icon>
                    <ArrowRight />
                  </el-icon>
                  <span>关闭右侧</span>
                </el-dropdown-item>
                <el-dropdown-item @click="closeAllTabs">
                  <el-icon>
                    <CircleClose />
                  </el-icon>
                  <span>全部关闭</span>
                </el-dropdown-item>
              </template>
              <el-dropdown-item @click="toggleFullscreen">
                <el-icon>
                  <FullScreen />
                </el-icon>
                <span>全屏显示</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-icon class="tab-menu-button" @click="refreshCurrentTab" title="刷新页面">
          <Refresh />
        </el-icon>
      </div>
    </div>

    <!-- 右键菜单 -->
    <div v-if="contextMenuVisible" class="context-menu"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }" @click.stop>
      <div class="context-menu-content">
        <div class="context-menu-item" @click="refreshCurrentTab">
          <el-icon class="context-menu-icon">
            <Refresh />
          </el-icon>
          <span>刷新页面</span>
        </div>
        <template v-if="currentTab?.path !== '/dashboard'">
          <div class="context-menu-item" @click="closeCurrentTab">
            <el-icon class="context-menu-icon">
              <Close />
            </el-icon>
            <span>关闭当前</span>
          </div>


          <div v-if="tabStore.tabs.length > 2 && currentIndex > 1" class="context-menu-item" @click="closeLeftTabs">
            <el-icon class="context-menu-icon">
              <ArrowLeft />
            </el-icon>
            <span>关闭左侧</span>
          </div>
          <div v-if="tabStore.tabs.length > 1 && currentIndex < tabStore.tabs.length - 1" class="context-menu-item"
            @click="closeRightTabs">
            <el-icon class="context-menu-icon">
              <ArrowRight />
            </el-icon>
            <span>关闭右侧</span>
          </div>
          <div class="context-menu-item" @click="closeOtherTabs">
            <el-icon class="context-menu-icon">
              <More />
            </el-icon>
            <span>关闭其他</span>
          </div>
          <div class="context-menu-item" @click="closeAllTabs">
            <el-icon class="context-menu-icon">
              <CircleClose />
            </el-icon>
            <span>全部关闭</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Close, Setting, Refresh, ArrowLeft, ArrowRight, More, CircleClose, FullScreen } from '@element-plus/icons-vue'
import { useTabStore } from '@/stores/tabStore'
import type { Tab } from '@/types/tab'

const route = useRoute()
const router = useRouter()
const tabStore = useTabStore()

const currentTab = ref<Tab | null>(null)
const contextMenuVisible = ref(false)
const contextMenuLeft = ref(0)
const contextMenuTop = ref(0)

// 当前标签页的索引
const currentIndex = computed(() => {
  if (!currentTab.value) return -1
  return tabStore.tabs.findIndex((tab) => tab.path === currentTab.value!.path)
})

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    // 从路由配置中获取标题
    const routeConfig = router.getRoutes().find((r) => r.path === newPath)
    if (routeConfig && routeConfig.meta?.title) {
      tabStore.addTab(newPath, routeConfig.meta.title as string)
    }
    tabStore.switchTab(newPath)
  },
  { immediate: true }
)

// 切换标签页
const switchTab = (tab: Tab) => {
  tabStore.switchTab(tab.path)
  router.push(tab.path)
  currentTab.value = tab
}

// 关闭标签页
const closeTab = (tab: Tab) => {
  tabStore.closeTab(tab.path)
  router.push(tabStore.currentPath)
}

// 打开右键菜单
const openContextMenu = (event: MouseEvent, tab: Tab) => {
  event.preventDefault()
  contextMenuLeft.value = event.clientX
  contextMenuTop.value = event.clientY
  currentTab.value = tab
  contextMenuVisible.value = true
}

// 刷新当前标签页
const refreshCurrentTab = () => {
  router.go(0)
  contextMenuVisible.value = false
}

// 关闭当前标签页
const closeCurrentTab = () => {
  if (currentTab.value) {
    tabStore.closeTab(currentTab.value.path)
    router.push(tabStore.currentPath)
    contextMenuVisible.value = false
  }
}

// 关闭其他标签页
const closeOtherTabs = (tab?: Tab | Event) => {
  const targetTab = tab instanceof Event ? currentTab.value : tab || currentTab.value
  if (targetTab) {
    tabStore.closeOtherTabs(targetTab.path)
    router.push(tabStore.currentPath)
    contextMenuVisible.value = false
  }
}

// 关闭左侧标签页
const closeLeftTabs = () => {
  if (currentTab.value) {
    tabStore.closeLeftTabs(currentTab.value.path)
    router.push(tabStore.currentPath)
    contextMenuVisible.value = false
  }
}

// 关闭右侧标签页
const closeRightTabs = () => {
  if (currentTab.value) {
    tabStore.closeRightTabs(currentTab.value.path)
    router.push(tabStore.currentPath)
    contextMenuVisible.value = false
  }
}

// 切换全屏
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else if (document.exitFullscreen) {
    document.exitFullscreen()
  }
}

// 关闭所有标签页
const closeAllTabs = () => {
  tabStore.closeAllTabs()
  router.push(tabStore.currentPath)
  contextMenuVisible.value = false
}

// 组件挂载时初始化
onMounted(() => {
  // 从路由配置中获取标题
  const routeConfig = router.getRoutes().find((r) => r.path === route.path)
  if (routeConfig && routeConfig.meta?.title) {
    tabStore.addTab(route.path, routeConfig.meta.title as string)
  }
  tabStore.switchTab(route.path)

  // 点击页面其他地方关闭右键菜单
  document.addEventListener('click', closeContextMenu)
})

// 组件卸载时清理
onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
}
</script>

<style lang="scss" scoped>
.tab-bar {
  display: flex;
  align-items: center;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  padding: 4px 12px;
  overflow-x: auto;
  position: relative;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: var(--el-bg-color);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--el-text-color-secondary);
  }
}

.tab-list {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  width: 100%;
}

.tab-items-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow-x: auto;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  position: relative;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  &.active {
    background-color: var(--el-bg-color-page);
    color: var(--el-color-primary);
    // border-bottom-color: var(--el-color-primary);
  }
}

.tab-title {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-close {
  font-size: 14px;
  opacity: 0.6;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
}

.tab-right-menu {
  margin-left: auto;
  order: 1;
  display: flex;
  align-items: center;
  gap: 8px;

  .tab-menu-button {
    font-size: 22px;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.3s, transform 0.2s;
    padding: 4px;
    border-radius: 4px;

    &:hover {
      opacity: 1;
      transform: scale(1.05);
      background-color: var(--el-fill-color-light);
    }
  }
}

.context-menu {
  position: fixed;
  z-index: 1000;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  box-shadow: var(--el-box-shadow-light);
  padding: 4px;
  min-width: 100px;
}

.context-menu-content {
  display: flex;
  flex-direction: column;
}

.context-menu-item {
  padding: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: var(--el-fill-color-light);
  }
}

.context-menu-icon {
  font-size: 12px;
  color: var(--el-text-color-regular);
}

:deep(.el-dropdown-menu) {
  min-width: 100px;

  .el-dropdown-item {
    padding: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .el-icon {
      font-size: 12px;
      color: var(--el-text-color-regular);
    }
  }
}
</style>