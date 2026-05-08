import { ref, computed, watch, Ref, ComputedRef } from 'vue'
import { useRoute } from 'vue-router'

export interface UseRouteTransitionOptions {
  transitionName?: string
  transitionDuration?: number
  componentKeyType?: 'path' | 'fullPath' | 'name'
  disabled?: boolean
}

export interface UseRouteTransitionReturn {
  componentKey: ComputedRef<string | number | symbol | undefined>
  isAnimating: Ref<boolean>
  lastTransitionTime: Ref<number | null>
  transitionEnabled: ComputedRef<boolean>
  startAnimation: () => void
  endAnimation: () => void
}

export function useRouteTransition(options: UseRouteTransitionOptions = {}): UseRouteTransitionReturn {
  const {
    transitionName: _transitionName = 'fade-transform',
    transitionDuration: _transitionDuration = 300,
    componentKeyType = 'path',
    disabled = false,
  } = options

  const route = useRoute()
  const isAnimating = ref(false)
  const lastTransitionTime = ref<number | null>(null)

  const componentKey = computed((): string | number | symbol | undefined => {
    if (componentKeyType === 'name') {
      return route.name
    }
    if (componentKeyType === 'fullPath') {
      return route.fullPath
    }
    return route.path
  })

  const transitionEnabled = computed((): boolean => {
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
    endAnimation,
  }
}

export interface UseTransitionDurationReturn {
  duration: Ref<number>
  unit: Ref<string>
  formattedDuration: ComputedRef<string>
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
    setDuration,
  }
}

export interface UseTransitionControlReturn {
  isDisabled: Ref<boolean>
  isPaused: Ref<boolean>
  currentTransition: Ref<string | null>
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
    setTransition,
  }
}

export interface UseKeepAliveCacheReturn {
  cachedViews: Ref<string[]>
  maxCacheSize: Ref<number>
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
    hasCache,
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
      leaveActiveClass: 'fade-leave-active',
    },
    'fade-transform': {
      name: 'fade-transform',
      enterClass: 'fade-transform-enter-from',
      enterActiveClass: 'fade-transform-enter-active',
      leaveClass: 'fade-transform-leave-to',
      leaveActiveClass: 'fade-transform-leave-active',
    },
    'slide-left': {
      name: 'slide-left',
      enterClass: 'slide-left-enter-from',
      enterActiveClass: 'slide-left-enter-active',
      leaveClass: 'slide-left-leave-to',
      leaveActiveClass: 'slide-left-leave-active',
    },
    'slide-right': {
      name: 'slide-right',
      enterClass: 'slide-right-enter-from',
      enterActiveClass: 'slide-right-enter-active',
      leaveClass: 'slide-right-leave-to',
      leaveActiveClass: 'slide-right-leave-active',
    },
    'slide-up': {
      name: 'slide-up',
      enterClass: 'slide-up-enter-from',
      enterActiveClass: 'slide-up-enter-active',
      leaveClass: 'slide-up-leave-to',
      leaveActiveClass: 'slide-up-leave-active',
    },
    'slide-down': {
      name: 'slide-down',
      enterClass: 'slide-down-enter-from',
      enterActiveClass: 'slide-down-enter-active',
      leaveClass: 'slide-down-leave-to',
      leaveActiveClass: 'slide-down-leave-active',
    },
    scale: {
      name: 'scale',
      enterClass: 'scale-enter-from',
      enterActiveClass: 'scale-enter-active',
      leaveClass: 'scale-leave-to',
      leaveActiveClass: 'scale-leave-active',
    },
  }

  function getAnimation(name: string): AnimationConfig {
    return animations[name] || animations.fade
  }

  function registerAnimation(name: string, config: Omit<AnimationConfig, 'name'>): void {
    animations[name] = {
      name,
      ...config,
    }
  }

  return {
    animations,
    getAnimation,
    registerAnimation,
  }
}

export interface RouteMetaTransition {
  name?: string
  mode?: string
  duration?: number
  disabled?: boolean
}

export interface UseRouteMetaTransitionReturn {
  metaTransition: ComputedRef<RouteMetaTransition | null>
  shouldAnimate: ComputedRef<boolean>
}

export function useRouteMetaTransition(): UseRouteMetaTransitionReturn {
  const route = useRoute()

  const metaTransition = computed((): RouteMetaTransition | null => {
    const meta = route.meta
    if (!meta) return null

    const transition = (meta as Record<string, unknown>).transition

    if (typeof transition === 'object' && transition !== null) {
      const t = transition as RouteMetaTransition
      return {
        name: t.name || 'fade-transform',
        mode: t.mode || 'out-in',
        duration: t.duration || 300,
        disabled: t.disabled || false,
      }
    }

    if (transition === false) {
      return { disabled: true }
    }

    return null
  })

  const shouldAnimate = computed((): boolean => {
    if (!metaTransition.value) return true
    return !metaTransition.value.disabled
  })

  return {
    metaTransition,
    shouldAnimate,
  }
}