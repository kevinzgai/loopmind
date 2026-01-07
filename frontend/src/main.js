import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import AntdX from 'ant-design-x-vue'
import './assets/tailwind.css'

const app = createApp(App)
app.use(router)
app.use(AntdX)
app.mount('#app')