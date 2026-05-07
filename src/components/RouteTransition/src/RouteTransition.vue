<template>
  <router-view v-slot="{ Component, route }">
    <transition
      :name="transitionName"
      :mode="mode"
      :appear="needAppear"
      @before-enter="handleBeforeEnter"
      @after-enter="handleAfterEnter"
      @before-leave="handleBeforeLeave"
      @after-leave="handleAfterLeave"
    >
      <keep-alive v-if="keepAlive" :include="cachedViews">
        <component
          v-if="!route.meta.link"
          :is="Component"
          :key="componentKey"
          v-bind="$attrs"
        />
      </keep-alive>
      <component
        v-else-if="!route.meta.link"
        :is="Component"
        :key="componentKey"
        v-bind="$attrs"
      />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, RouteLocationNormalized } from 'vue-router'

interface Props {
  mode?: 'out-in' | 'in-out' | 'default' | undefined
  transitionName?: string
  transitionDuration?: number
  keepAlive?: boolean
  cachedViews?: string[]
  linkComponent?: string
  needAppear?: boolean
  componentKeyType?: 'path' | 'fullPath' | 'name' | 'custom'
  customKey?: string | number | null
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'out-in',
  transitionName: 'fade-transform',
  transitionDuration: 300,
  keepAlive: true,
  cachedViews: () => [],
  linkComponent: 'iframe-toggle',
  needAppear: false,
  componentKeyType: 'path',
  customKey: null,
  disabled: false
})

interface Emits {
  'before-enter': [payload: { el: Element; route: RouteLocationNormalized }]
  'after-enter': [payload: { el: Element; route: RouteLocationNormalized }]
  'before-leave': [payload: { el: Element; route: RouteLocationNormalized }]
  'after-leave': [payload: { el: Element; route: RouteLocationNormalized }]
  'transition-start': [payload: { route: RouteLocationNormalized }]
  'transition-end': [payload: { route: RouteLocationNormalized; type: 'enter' | 'leave' }]
}

const emit = defineEmits<Emits>()

const route = useRoute()
const isAnimating = ref(false)

const componentKey = computed(() => {
  if (props.componentKeyType === 'custom' && props.customKey) {
    return props.customKey
  }
  if (props.componentKeyType === 'name') {
    return route.name
  }
  if (props.componentKeyType === 'fullPath') {
    return route.fullPath
  }
  return route.path
})

watch(
  () => route.path,
  () => {
    if (!props.disabled) {
      emit('transition-start', { route })
    }
  }
)

function handleBeforeEnter(el: Element): void {
  isAnimating.value = true
  emit('before-enter', { el, route })
}

function handleAfterEnter(el: Element): void {
  isAnimating.value = false
  emit('after-enter', { el, route })
  emit('transition-end', { route, type: 'enter' })
}

function handleBeforeLeave(el: Element): void {
  isAnimating.value = true
  emit('before-leave', { el, route })
}

function handleAfterLeave(el: Element): void {
  isAnimating.value = false
  emit('after-leave', { el, route })
  emit('transition-end', { route, type: 'leave' })
}

defineExpose({
  isAnimating
})
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity v-bind('transitionDuration + "ms"');
}

.fade-enter-from,
.fade-leave-active {
  opacity: 0;
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all v-bind('transitionDuration + "ms"');
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all v-bind('transitionDuration + "ms"');
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all v-bind('transitionDuration + "ms"');
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all v-bind('transitionDuration + "ms"');
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all v-bind('transitionDuration + "ms"');
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.scale-enter-active,
.scale-leave-active {
  transition: all v-bind('transitionDuration + "ms"');
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(1.2);
}
</style>
