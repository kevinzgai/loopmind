import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import AntdX from 'ant-design-x-vue'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import './assets/tailwind.css'

// 修复 vue-virtual-scroller 在 Vue 3 中的兼容性问题
// vue-virtual-scroller v1.1.2 仍然试图 import Vue from 'vue'，导致 esm 解析错误
// 我们不需要显式使用它，因为 app.use(VueVirtualScroller) 会自动处理组件注册

const app = createApp(App)
app.use(router)
app.use(AntdX)
app.use(VueVirtualScroller)
app.mount('#app')