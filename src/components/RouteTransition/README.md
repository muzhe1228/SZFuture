# RouteTransition 组件

Vue 3 路由过渡动画组件，支持多种动画效果，配置灵活，适用于多项目复用。

## 特性

- 🎨 支持 10+ 种内置动画效果
- ⚡ 支持自定义动画时长和缓动函数
- 🎯 支持路由元信息配置动画
- 🔧 支持组件级别和全局级别配置
- 📦 支持 keep-alive 缓存
- 🌈 支持暗黑模式
- ♿ 支持减少动画偏好
- 📝 完全支持 TypeScript

## 安装

将 `RouteTransition` 组件复制到你的项目中：

```
src/components/RouteTransition/
├── index.ts                  # 主入口文件 (TypeScript)
└── src/
    ├── RouteTransition.vue    # 主组件
    ├── transition.scss        # 动画样式
    └── useRouteTransition.ts  # Composables (TypeScript)
```

在项目中全局注册或按需引入：

```javascript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { RouteTransition } from './components/RouteTransition'

const app = createApp(App)

app.component('RouteTransition', RouteTransition)

app.mount('#app')
```

## 基础使用

```vue
<template>
  <RouteTransition />
</template>

<script setup lang="ts">
import RouteTransition from '@/components/RouteTransition'
</script>
```

## 完整配置示例

```vue
<template>
  <div class="layout">
    <nav>导航栏</nav>
    <RouteTransition
      mode="out-in"
      transition-name="fade-transform"
      :transition-duration="300"
      :keep-alive="true"
      :cached-views="cachedViews"
      component-key-type="path"
      @before-enter="onBeforeEnter"
      @after-enter="onAfterEnter"
      @transition-end="onTransitionEnd"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouteLocationNormalized } from 'vue-router'
import RouteTransition from '@/components/RouteTransition'

const cachedViews = ref<string[]>(['Index', 'UserList'])

function onBeforeEnter({ el, route }: { el: Element; route: RouteLocationNormalized }) {
  console.log('进入前:', route.path)
}

function onAfterEnter({ el, route }: { el: Element; route: RouteLocationNormalized }) {
  console.log('进入后:', route.path)
}

function onTransitionEnd({ route, type }: { route: RouteLocationNormalized; type: 'enter' | 'leave' }) {
  console.log(`动画结束 - ${type}:`, route.path)
}
</script>
```

## 在 MainLayout 中使用

```vue
<template>
  <el-container class="layout-container">
    <!-- Sidebar -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <!-- 侧边栏内容 -->
    </el-aside>

    <!-- Main Content -->
    <el-container class="main-container">
      <!-- Header -->
      <el-header class="header">
        <!-- 头部内容 -->
      </el-header>

      <!-- Tab Bar -->
      <TabBar />

      <!-- Content -->
      <el-main class="main-content">
        <RouteTransition>
          <router-view />
        </RouteTransition>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RouteTransition from '@/components/RouteTransition'
import TabBar from '@/components/TabBar'

// 其他代码...
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| mode | 过渡模式 | `'out-in'` \| `'in-out'` \| `'default'` \| `undefined` | `'out-in'` |
| transitionName | 动画名称 | `String` | `'fade-transform'` |
| transitionDuration | 动画时长（毫秒） | `Number` | `300` |
| keepAlive | 是否启用缓存 | `Boolean` | `true` |
| cachedViews | 缓存的视图名称数组 | `String[]` | `[]` |
| linkComponent | 链接组件名称 | `String` | `'iframe-toggle'` |
| needAppear | 是否需要初始动画 | `Boolean` | `false` |
| componentKeyType | 组件 key 类型 | `'path'` \| `'fullPath'` \| `'name'` \| `'custom'` | `'path'` |
| customKey | 自定义 key（当 componentKeyType 为 custom 时使用） | `String` \| `Number` \| `null` | `null` |
| disabled | 是否禁用过渡 | `Boolean` | `false` |

## Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| before-enter | 元素进入过渡前触发 | `{ el: Element, route: RouteLocationNormalized }` |
| after-enter | 元素进入过渡后触发 | `{ el: Element, route: RouteLocationNormalized }` |
| before-leave | 元素离开过渡前触发 | `{ el: Element, route: RouteLocationNormalized }` |
| after-leave | 元素离开过渡后触发 | `{ el: Element, route: RouteLocationNormalized }` |
| transition-start | 过渡开始时触发 | `{ route: RouteLocationNormalized }` |
| transition-end | 过渡结束时触发 | `{ route: RouteLocationNormalized, type: 'enter' \| 'leave' }` |

## 内置动画

### 1. fade（淡入淡出）

```vue
<RouteTransition transition-name="fade" />
```

### 2. fade-transform（左右滑动淡入淡出）

```vue
<RouteTransition transition-name="fade-transform" />
```

### 3. slide-left（向左滑入）

```vue
<RouteTransition transition-name="slide-left" />
```

### 4. slide-right（向右滑入）

```vue
<RouteTransition transition-name="slide-right" />
```

### 5. slide-up（向上滑入）

```vue
<RouteTransition transition-name="slide-up" />
```

### 6. slide-down（向下滑入）

```vue
<RouteTransition transition-name="slide-down" />
```

### 7. scale（缩放）

```vue
<RouteTransition transition-name="scale" />
```

## 路由元信息配置

在路由配置中通过 `meta` 控制动画：

```typescript
// router/index.ts
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/User.vue'),
    meta: {
      title: '用户管理',
      // 禁用动画
      noTransition: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '工作台',
      // 自定义动画配置
      transition: {
        name: 'slide-left',
        mode: 'out-in',
        duration: 400,
        disabled: false
      }
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
```

## Composable 使用

### useRouteTransition

```typescript
import { useRouteTransition } from '@/components/RouteTransition/src/useRouteTransition'

const {
  componentKey,           // 计算后的组件 key
  isAnimating,            // 是否正在动画
  lastTransitionTime,     // 上次动画时间
  transitionEnabled,      // 动画是否启用
  startAnimation,         // 开始动画
  endAnimation            // 结束动画
} = useRouteTransition({
  transitionName: 'fade-transform',
  transitionDuration: 300,
  componentKeyType: 'path',
  disabled: false
})
```

### useTransitionDuration

```typescript
import { useTransitionDuration } from '@/components/RouteTransition/src/useRouteTransition'

const {
  duration,             // 动画时长
  unit,                 // 时间单位
  formattedDuration,    // 格式化后的时长
  setDuration           // 设置时长
} = useTransitionDuration()

// 使用示例
setDuration(500, 'ms')
console.log(formattedDuration.value) // 输出: 500ms
```

### useTransitionControl

```typescript
import { useTransitionControl } from '@/components/RouteTransition/src/useRouteTransition'

const {
  isDisabled,      // 是否禁用
  isPaused,        // 是否暂停
  currentTransition, // 当前动画类型
  enable,          // 启用动画
  disable,         // 禁用动画
  pause,           // 暂停动画
  resume,          // 恢复动画
  setTransition    // 设置动画类型
} = useTransitionControl()

// 使用示例
disable() // 禁用动画
setTransition('slide-left') // 设置动画类型
```

### useKeepAliveCache

```typescript
import { useKeepAliveCache } from '@/components/RouteTransition/src/useRouteTransition'

const {
  cachedViews,     // 缓存的视图列表
  maxCacheSize,    // 最大缓存大小
  addCache,        // 添加缓存
  removeCache,     // 移除缓存
  clearCache,      // 清空缓存
  hasCache         // 检查是否有缓存
} = useKeepAliveCache()

// 使用示例
addCache('Dashboard') // 添加缓存
removeCache('User') // 移除缓存
```

### useTransitionAnimations

```typescript
import { useTransitionAnimations } from '@/components/RouteTransition/src/useRouteTransition'

const {
  animations,         // 所有动画配置
  getAnimation,       // 获取动画配置
  registerAnimation   // 注册自定义动画
} = useTransitionAnimations()

// 使用示例
const fadeAnimation = getAnimation('fade')

// 注册自定义动画
registerAnimation('custom-animation', {
  enterClass: 'custom-enter-from',
  enterActiveClass: 'custom-enter-active',
  leaveClass: 'custom-leave-to',
  leaveActiveClass: 'custom-leave-active'
})
```

### useRouteMetaTransition

```typescript
import { useRouteMetaTransition } from '@/components/RouteTransition/src/useRouteTransition'

const {
  metaTransition,   // 路由元信息中的动画配置
  shouldAnimate     // 是否应该动画
} = useRouteMetaTransition()

// 使用示例
if (shouldAnimate.value) {
  console.log('应该执行动画')
}
```

## 实际应用示例

### 多布局场景

```vue
<template>
  <div>
    <!-- 布局1 -->
    <layout-a v-if="currentLayout === 'A'">
      <RouteTransition
        transition-name="slide-left"
        component-key-type="fullPath"
      />
    </layout-a>

    <!-- 布局2 -->
    <layout-b v-else>
      <RouteTransition
        transition-name="fade-transform"
        component-key-type="path"
      />
    </layout-b>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RouteTransition from '@/components/RouteTransition'
import LayoutA from '@/layouts/LayoutA.vue'
import LayoutB from '@/layouts/LayoutB.vue'

const currentLayout = ref('A')
</script>
```

### 带动画开关

```vue
<template>
  <div>
    <el-switch v-model="animationEnabled" label="启用动画" />
    <RouteTransition
      :transition-name="animationEnabled ? 'fade-transform' : ''"
      :transition-duration="300"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RouteTransition from '@/components/RouteTransition'

const animationEnabled = ref(true)
</script>
```

### 自定义动画时长

```vue
<template>
  <div>
    <el-slider v-model="duration" min="100" max="1000" label="动画时长" />
    <RouteTransition
      transition-name="fade-transform"
      :transition-duration="duration"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RouteTransition from '@/components/RouteTransition'

const duration = ref(300)
</script>
```

## 注意事项

1. **动画性能**：建议动画时长控制在 200-500ms，过长会影响体验
2. **缓存配合**：使用 `keep-alive` 时，确保 `cachedViews` 正确更新
3. **key 唯一性**：不同的 `componentKeyType` 会影响组件复用和状态保持
4. **SSR 支持**：如需 SSR，请确保组件在客户端 hydration 后才执行动画
5. **无障碍**：组件自动支持 `prefers-reduced-motion`，用户可在系统设置中减少动画
6. **TypeScript**：组件已完全支持 TypeScript，可在项目中放心使用

## License

MIT
