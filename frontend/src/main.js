import { createApp } from 'vue'
import App from './App.vue'
import AntdX from 'ant-design-x-vue'
import './assets/tailwind.css'

const app = createApp(App)
app.use(AntdX)
app.mount('#app')