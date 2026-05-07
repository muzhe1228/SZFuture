import RouteTransition from './src/RouteTransition.vue'
import './src/transition.scss'
import { useRouteTransition, useTransitionDuration, useTransitionControl, useKeepAliveCache, useTransitionAnimations, useRouteMetaTransition } from './src/useRouteTransition'

export {
  RouteTransition,
  useRouteTransition,
  useTransitionDuration,
  useTransitionControl,
  useKeepAliveCache,
  useTransitionAnimations,
  useRouteMetaTransition
}

export default RouteTransition
