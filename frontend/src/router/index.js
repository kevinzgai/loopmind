import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated, token } from '@/stores/authStore.js'
import { isAdmin } from '@/stores/authStore.js'

// 导入页面组件
const ChatPage = () => import('@/views/chat/ChatPage.vue')
const AudioTestPage = () => import('@/views/test/AudioTestPage.vue')
const TtsTestPage = () => import('@/views/test/TtsTestPage.vue')
const AsrTestPage = () => import('@/views/test/AsrTestPage.vue')
const AsrStreamPage = () => import('@/views/test/AsrStreamPage.vue')
const HomePage = () => import('@/views/home/HomePage.vue')
const LoginPage = () => import('@/views/auth/LoginPage.vue')
const RegisterPage = () => import('@/views/auth/RegisterPage.vue')
const AgentFormPage = () => import('@/views/agent/AgentFormPage.vue')
const MyAgentsPage = () => import('@/views/agent/MyAgentsPage.vue')
const AgentChatPage = () => import('@/views/agent/AgentChatPage.vue')
const AdminSystemPage = () => import('@/views/admin/AdminSystemPage.vue')

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
  },
  {
    path: '/admin/system',
    name: 'AdminSystem',
    component: AdminSystemPage,
    meta: {
      title: '系统配置',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/agent/create',
    name: 'CreateAgent',
    component: AgentFormPage,
    meta: {
      title: '创建智能体',
      requiresAuth: true
    }
  },
  {
    path: '/agent/:agentId/edit',
    name: 'EditAgent',
    component: AgentFormPage,
    meta: {
      title: '编辑智能体',
      requiresAuth: true
    }
  },
  {
    path: '/agent/:agentId/chat',
    name: 'AgentChat',
    component: AgentChatPage,
    meta: {
      title: '智能体对话'
    }
  },
  {
    path: '/agent/my-agents',
    name: 'MyAgents',
    component: MyAgentsPage,
    meta: {
      title: '我的智能体',
      requiresAuth: true
    }
  },
  // 404 路由
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
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
  } else if (to.meta.requiresAdmin && !isAdmin.value) {
    next('/')
  } else {
    next()
  }
})

export default router
