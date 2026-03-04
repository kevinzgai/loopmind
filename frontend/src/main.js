import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import AntdX from 'ant-design-x-vue'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import './assets/tailwind.css'
import { setupPermissionDirective } from './directives/permission.js'

const app = createApp(App)
app.use(router)
app.use(AntdX)
app.use(VueVirtualScroller)
setupPermissionDirective(app)
app.mount('#app')