import { ref, computed, watch } from 'vue'
import { useRoute, RouteLocationNormalized } from 'vue-router'

export interface UseRouteTransitionOptions {
  transitionName?: string
  transitionDuration?: number
  componentKeyType?: 'path' | 'fullPath' | 'name'
  disabled?: boolean
}

export interface UseRouteTransitionReturn {
  componentKey: ReturnType<typeof computed>
  isAnimating: ReturnType<typeof ref<boolean>>
  lastTransitionTime: ReturnType<typeof ref<number | null>>
  transitionEnabled: ReturnType<typeof computed<boolean>>
  startAnimation: () => void
  endAnimation: () => void
}

export function useRouteTransition(options: UseRouteTransitionOptions = {}): UseRouteTransitionReturn {
  const {
    transitionName = 'fade-transform',
    transitionDuration = 300,
    componentKeyType = 'path',
    disabled = false
  } = options

  const route = useRoute()
  const isAnimating = ref(false)
  const lastTransitionTime = ref<number | null>(null)

  const componentKey = computed(() => {
    if (componentKeyType === 'name') {
      return route.name
    }
    if (componentKeyType === 'fullPath') {
      return route.fullPath
    }
    return route.path
  })

  const transitionEnabled = computed(() => {
    if (disabled) return false
    return route.meta.noTransition !== true
  })

  watch(
    () => route.path,
    () => {
      if (transitionEnabled.value) {
        lastTransitionTime.value = Date.now()
      }
    }
  )

  function startAnimation(): void {
    isAnimating.value = true
  }

  function endAnimation(): void {
    isAnimating.value = false
  }

  return {
    componentKey,
    isAnimating,
    lastTransitionTime,
    transitionEnabled,
    startAnimation,
    endAnimation
  }
}

export interface UseTransitionDurationReturn {
  duration: ReturnType<typeof ref<number>>
  unit: ReturnType<typeof ref<string>>
  formattedDuration: ReturnType<typeof computed<string>>
  setDuration: (value: number, unitType?: string) => void
}

export function useTransitionDuration(): UseTransitionDurationReturn {
  const duration = ref(300)
  const unit = ref('ms')

  const formattedDuration = computed(() => {
    return `${duration.value}${unit.value}`
  })

  function setDuration(value: number, unitType: string = 'ms'): void {
    duration.value = value
    unit.value = unitType
  }

  return {
    duration,
    unit,
    formattedDuration,
    setDuration
  }
}

export interface UseTransitionControlReturn {
  isDisabled: ReturnType<typeof ref<boolean>>
  isPaused: ReturnType<typeof ref<boolean>>
  currentTransition: ReturnType<typeof ref<string | null>>
  enable: () => void
  disable: () => void
  pause: () => void
  resume: () => void
  setTransition: (name: string) => void
}

export function useTransitionControl(): UseTransitionControlReturn {
  const isDisabled = ref(false)
  const isPaused = ref(false)
  const currentTransition = ref<string | null>(null)

  function enable(): void {
    isDisabled.value = false
  }

  function disable(): void {
    isDisabled.value = true
  }

  function pause(): void {
    isPaused.value = true
  }

  function resume(): void {
    isPaused.value = false
  }

  function setTransition(name: string): void {
    currentTransition.value = name
  }

  return {
    isDisabled,
    isPaused,
    currentTransition,
    enable,
    disable,
    pause,
    resume,
    setTransition
  }
}

export interface UseKeepAliveCacheReturn {
  cachedViews: ReturnType<typeof ref<string[]>>
  maxCacheSize: ReturnType<typeof ref<number>>
  addCache: (view: string) => void
  removeCache: (view: string) => void
  clearCache: () => void
  hasCache: (view: string) => boolean
}

export function useKeepAliveCache(): UseKeepAliveCacheReturn {
  const cachedViews = ref<string[]>([])
  const maxCacheSize = ref(20)

  function addCache(view: string): void {
    if (!cachedViews.value.includes(view)) {
      cachedViews.value.push(view)
      if (cachedViews.value.length > maxCacheSize.value) {
        cachedViews.value.shift()
      }
    }
  }

  function removeCache(view: string): void {
    const index = cachedViews.value.indexOf(view)
    if (index > -1) {
      cachedViews.value.splice(index, 1)
    }
  }

  function clearCache(): void {
    cachedViews.value = []
  }

  function hasCache(view: string): boolean {
    return cachedViews.value.includes(view)
  }

  return {
    cachedViews,
    maxCacheSize,
    addCache,
    removeCache,
    clearCache,
    hasCache
  }
}

export interface AnimationConfig {
  name: string
  enterClass: string
  enterActiveClass: string
  leaveClass: string
  leaveActiveClass: string
}

export interface UseTransitionAnimationsReturn {
  animations: Record<string, AnimationConfig>
  getAnimation: (name: string) => AnimationConfig
  registerAnimation: (name: string, config: Omit<AnimationConfig, 'name'>) => void
}

export function useTransitionAnimations(): UseTransitionAnimationsReturn {
  const animations: Record<string, AnimationConfig> = {
    fade: {
      name: 'fade',
      enterClass: 'fade-enter-from',
      enterActiveClass: 'fade-enter-active',
      leaveClass: 'fade-leave-to',
      leaveActiveClass: 'fade-leave-active'
    },
    'fade-transform': {
      name: 'fade-transform',
      enterClass: 'fade-transform-enter-from',
      enterActiveClass: 'fade-transform-enter-active',
      leaveClass: 'fade-transform-leave-to',
      leaveActiveClass: 'fade-transform-leave-active'
    },
    'slide-left': {
      name: 'slide-left',
      enterClass: 'slide-left-enter-from',
      enterActiveClass: 'slide-left-enter-active',
      leaveClass: 'slide-left-leave-to',
      leaveActiveClass: 'slide-left-leave-active'
    },
    'slide-right': {
      name: 'slide-right',
      enterClass: 'slide-right-enter-from',
      enterActiveClass: 'slide-right-enter-active',
      leaveClass: 'slide-right-leave-to',
      leaveActiveClass: 'slide-right-leave-active'
    },
    'slide-up': {
      name: 'slide-up',
      enterClass: 'slide-up-enter-from',
      enterActiveClass: 'slide-up-enter-active',
      leaveClass: 'slide-up-leave-to',
      leaveActiveClass: 'slide-up-leave-active'
    },
    'slide-down': {
      name: 'slide-down',
      enterClass: 'slide-down-enter-from',
      enterActiveClass: 'slide-down-enter-active',
      leaveClass: 'slide-down-leave-to',
      leaveActiveClass: 'slide-down-leave-active'
    },
    scale: {
      name: 'scale',
      enterClass: 'scale-enter-from',
      enterActiveClass: 'scale-enter-active',
      leaveClass: 'scale-leave-to',
      leaveActiveClass: 'scale-leave-active'
    }
  }

  function getAnimation(name: string): AnimationConfig {
    return animations[name] || animations.fade
  }

  function registerAnimation(name: string, config: Omit<AnimationConfig, 'name'>): void {
    animations[name] = {
      name,
      ...config
    }
  }

  return {
    animations,
    getAnimation,
    registerAnimation
  }
}

export interface MetaTransition {
  name?: string
  mode?: string
  duration?: number
  disabled?: boolean
}

export interface UseRouteMetaTransitionReturn {
  metaTransition: ReturnType<typeof computed<MetaTransition | null>>
  shouldAnimate: ReturnType<typeof computed<boolean>>
}

export function useRouteMetaTransition(): UseRouteMetaTransitionReturn {
  const route = useRoute()

  const metaTransition = computed(() => {
    const meta = route.meta
    if (!meta) return null

    if (typeof meta.transition === 'object') {
      return {
        name: meta.transition.name || 'fade-transform',
        mode: meta.transition.mode || 'out-in',
        duration: meta.transition.duration || 300,
        disabled: meta.transition.disabled || false
      }
    }

    if (meta.transition === false) {
      return { disabled: true }
    }

    return null
  })

  const shouldAnimate = computed(() => {
    if (!metaTransition.value) return true
    return !metaTransition.value.disabled
  })

  return {
    metaTransition,
    shouldAnimate
  }
}
