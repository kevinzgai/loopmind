import { createRouter, createWebHistory } from "vue-router";
import { isAuthenticated, token } from "@/stores/authStore.js";
import { isAdmin } from "@/stores/authStore.js";

// 导入页面组件
const ChatPage = () => import("@/views/chat/ChatPage.vue");
const HomePage = () => import("@/views/home/HomePage.vue");
const LoginPage = () => import("@/views/auth/LoginPage.vue");
const RegisterPage = () => import("@/views/auth/RegisterPage.vue");
const AgentFormPage = () => import("@/views/agent/AgentFormPage.vue");
const MyAgentsPage = () => import("@/views/agent/MyAgentsPage.vue");
const AgentMarketplacePage = () =>
  import("@/views/agent/AgentMarketplacePage.vue");
const AgentChatPage = () => import("@/views/agent/AgentChatPage.vue");
const AgentWidgetPage = () => import("@/views/agent/AgentWidgetPage.vue");
const ApiDocsPage = () => import("@/views/developer/ApiDocsPage.vue");
const SettingsPage = () => import("@/views/settings/SettingsPage.vue");
const ApiKeysPage = () => import("@/views/apiKeys/ApiKeysPage.vue");
const ApiKeysStatsPage = () => import("@/views/apiKeys/ApiKeysStatsPage.vue");
const KnowledgePage = () => import("@/views/knowledge/KnowledgePage.vue");
const AgentCapabilitiesPage = () =>
  import("@/views/agent/AgentCapabilitiesPage.vue");

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
    meta: {
      title: "首页",
    },
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: {
      title: "登录",
    },
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterPage,
    meta: {
      title: "注册",
    },
  },
  {
    path: "/chat",
    name: "Chat",
    component: ChatPage,
    meta: {
      title: "AI 对话",
      requiresAuth: true,
    },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../views/auth/ProfilePage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "Settings",
    component: SettingsPage,
    meta: {
      title: "系统设置",
      requiresAuth: true,
    },
  },
  {
    path: "/api-keys",
    name: "ApiKeys",
    component: ApiKeysPage,
    meta: {
      title: "API Keys 管理",
      requiresAuth: true,
    },
  },
  {
    path: "/api-keys/stats",
    name: "ApiKeysStats",
    component: ApiKeysStatsPage,
    meta: {
      title: "API Key 统计",
      requiresAuth: true,
    },
  },
  {
    path: "/agent/create",
    name: "CreateAgent",
    component: AgentFormPage,
    meta: {
      title: "创建智能体",
      requiresAuth: true,
    },
  },
  {
    path: "/agent/:agentId/edit",
    name: "EditAgent",
    component: AgentFormPage,
    meta: {
      title: "编辑智能体",
      requiresAuth: true,
    },
  },
  {
    path: "/agent/:agentId/chat",
    name: "AgentChat",
    component: AgentChatPage,
    meta: {
      title: "智能体对话",
    },
  },
  {
    path: "/agent/:agentId/widget",
    name: "AgentWidget",
    component: AgentWidgetPage,
    meta: {
      title: "智能体助手",
    },
  },
  {
    path: "/agent/marketplace",
    name: "Marketplace",
    component: AgentMarketplacePage,
    meta: {
      title: "探索发现",
    },
  },
  {
    path: "/developer/api",
    name: "ApiDocs",
    component: ApiDocsPage,
    meta: {
      title: "开发者中心",
    },
  },
  {
    path: "/agent/my-agents",
    name: "MyAgents",
    component: MyAgentsPage,
    meta: {
      title: "我的智能体",
      requiresAuth: true,
    },
  },
  {
    path: "/knowledge",
    name: "Knowledge",
    component: KnowledgePage,
    meta: {
      title: "知识库管理",
      requiresAuth: true,
    },
  },
  {
    path: "/agent/capabilities",
    name: "AgentCapabilities",
    component: AgentCapabilitiesPage,
    meta: {
      title: "智能体能力矩阵",
      requiresAuth: true,
    },
  },
  // 404 路由
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫 - 更新页面标题和认证检查
router.beforeEach((to, from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} - AI Chat`
    : "AI Chat Application";

  // 检查是否需要认证
  if (to.meta.requiresAuth && !token.value) {
    // 需要认证但未登录，重定向到登录页
    next("/login");
  } else if (to.meta.requiresAdmin && !isAdmin.value) {
    next("/");
  } else {
    next();
  }
});

export default router;
