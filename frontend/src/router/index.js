import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated, token } from '../stores/authStore.js'

// 导入页面组件
const ChatPage = () => import('../views/ChatPage.vue')
const AudioTestPage = () => import('../views/AudioTestPage.vue')
const TtsTestPage = () => import('../views/TtsTestPage.vue')
const AsrTestPage = () => import('../views/AsrTestPage.vue')
const AsrStreamPage = () => import('../views/AsrStreamPage.vue')
const HomePage = () => import('../views/HomePage.vue')
const LoginPage = () => import('../views/LoginPage.vue')
const RegisterPage = () => import('../views/RegisterPage.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: '首页'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: {
      title: '登录'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: {
      title: '注册'
    }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatPage,
    meta: {
      title: 'AI 对话',
      requiresAuth: true
    }
  },
  {
    path: '/audio-test',
    name: 'AudioTest',
    component: AudioTestPage,
    meta: {
      title: '录音测试'
    }
  },
  {
    path: '/tts-test',
    name: 'TtsTest',
    component: TtsTestPage,
    meta: {
      title: 'TTS 测试'
    }
  },
  {
    path: '/asr-test',
    name: 'AsrTest',
    component: AsrTestPage,
    meta: {
      title: 'ASR 语音识别测试'
    }
  },
  {
    path: '/asr-stream',
    name: 'AsrStream',
    component: AsrStreamPage,
    meta: {
      title: '实时语音识别'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 更新页面标题和认证检查
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - AI Chat` : 'AI Chat Application'

  // 检查是否需要认证
  if (to.meta.requiresAuth && !token.value) {
    // 需要认证但未登录，重定向到登录页
    next('/login')
  } else {
    next()
  }
})

export default router
