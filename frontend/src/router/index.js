import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
const ChatPage = () => import('../views/ChatPage.vue')
const AudioTestPage = () => import('../views/AudioTestPage.vue')
const TtsTestPage = () => import('../views/TtsTestPage.vue')
const AsrTestPage = () => import('../views/AsrTestPage.vue')
const AsrStreamPage = () => import('../views/AsrStreamPage.vue')
const HomePage = () => import('../views/HomePage.vue')

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
    path: '/chat',
    name: 'Chat',
    component: ChatPage,
    meta: {
      title: 'AI 对话'
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

// 路由守卫 - 更新页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - AI Chat` : 'AI Chat Application'
  next()
})

export default router
