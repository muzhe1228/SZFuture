import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import './styles/table.scss'
import App from './App.vue'
import router from './router'

// Load mock data in development mode
if (import.meta.env.DEV) {
  import('./mock').then(({ setupMock }) => setupMock())
}

// Configure NProgress
NProgress.configure({ showSpinner: false, easing: 'ease', speed: 500 })
NProgress.inc(0.2)

// Custom NProgress styling to match Element Plus theme
const nprogressStyle = document.createElement('style')
nprogressStyle.textContent = `
  #nprogress .bar {
    background: #409EFF !important;
    height: 3px !important;
  }
  #nprogress .peg {
    box-shadow: 0 0 10px #409EFF, 0 0 5px #409EFF !important;
  }
`
document.head.appendChild(nprogressStyle)

// Router navigation guards for NProgress
router.beforeEach((_to, _from, next) => {
  NProgress.start()
  next()
})

router.afterEach(() => {
  NProgress.done()
})

const app = createApp(App)

// Register all Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})

app.mount('#app')
