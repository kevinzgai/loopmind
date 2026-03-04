<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header Card -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
      <div class="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <User class="w-32 h-32 text-slate-400" />
      </div>
      
      <div class="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
        <div class="relative group">
          <div class="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl border-4 border-white dark:border-slate-900 shadow-md transition-transform group-hover:scale-105">
            <img v-if="currentUser?.profile?.avatar && currentUser.profile.avatar.startsWith('http')" :src="currentUser.profile.avatar" class="w-full h-full object-cover rounded-full" />
            <span v-else>{{ currentUser?.profile?.avatar || '👤' }}</span>
          </div>
          <button @click="activeTab = 'profile'" class="absolute -bottom-1 -right-1 p-2 bg-violet-600 text-white rounded-full shadow-lg hover:bg-violet-700 transition-colors">
            <Camera class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 text-center md:text-left space-y-4">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">{{ currentUser?.username }}</h1>
            <p class="text-slate-500 dark:text-slate-400">{{ currentUser?.email }}</p>
          </div>
          
          <div class="flex flex-wrap justify-center md:justify-start gap-3">
            <span :class="[
              'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider',
              currentUser?.isSuperAdmin 
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' 
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            ]">
              {{ currentUser?.isSuperAdmin ? '管理员' : '普通用户' }}
            </span>
            <span class="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium">
              注册于 {{ formatDate(currentUser?.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
        <div class="p-3 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg">
          <Box class="w-6 h-6" />
        </div>
        <div>
          <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ agentCount }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400">我的智能体</div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
        <div class="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
          <Database class="w-6 h-6" />
        </div>
        <div>
          <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ kbCount }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400">知识库数量</div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
        <div class="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
          <LogIn class="w-6 h-6" />
        </div>
        <div>
          <div class="text-sm font-bold text-slate-900 dark:text-slate-100">{{ formatDate(currentUser?.lastLoginAt, true) }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400">最后登录</div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="flex border-b border-slate-200 dark:border-slate-800">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'px-6 py-3 text-sm font-medium transition-colors relative',
          activeTab === tab.id 
            ? 'text-violet-600 dark:text-violet-400' 
            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
        ]"
      >
        {{ tab.label }}
        <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 dark:bg-violet-400"></div>
      </button>
    </div>

    <!-- Tab Contents -->
    <div class="space-y-6">
      <!-- Profile Edit Tab -->
      <section v-if="activeTab === 'profile'" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2">
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">资料编辑</h2>
        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">个人头像 (Emoji 或 URL)</label>
              <div class="flex gap-3 items-center">
                <input 
                  v-model="editForm.avatar" 
                  type="text" 
                  placeholder="例如: 🤖 或 https://..."
                  class="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm py-2"
                />
                <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl border border-slate-200 dark:border-slate-700">
                  {{ editForm.avatar || '👤' }}
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-slate-700 dark:text-slate-300">用户名</label>
              <input 
                :value="currentUser?.username" 
                type="text" 
                disabled
                class="w-full bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 text-sm py-2 cursor-not-allowed"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">个人简介</label>
            <textarea 
              v-model="editForm.bio" 
              placeholder="介绍一下你自己..."
              rows="3"
              class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm"
            ></textarea>
          </div>

          <div class="pt-4">
            <button type="submit" class="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-bold shadow-md shadow-violet-500/20 transition-all disabled:opacity-50" :disabled="isUpdating">
              <span v-if="isUpdating">正在保存...</span>
              <span v-else>保存修改</span>
            </button>
          </div>
        </form>
      </section>

      <!-- Security Tab -->
      <section v-if="activeTab === 'security'" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2">
        <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">账户安全</h2>
        <form @submit.prevent="handleChangePassword" class="max-w-md space-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">当前密码</label>
            <input v-model="passwordForm.oldPassword" type="password" required class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm py-2" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">新密码</label>
            <input v-model="passwordForm.newPassword" type="password" required class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm py-2" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700 dark:text-slate-300">确认新密码</label>
            <input v-model="passwordForm.confirmPassword" type="password" required class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-violet-500 focus:border-violet-500 text-sm py-2" />
          </div>
          <div class="pt-4">
            <button type="submit" class="px-6 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50" :disabled="isChangingPassword">
              {{ isChangingPassword ? '正在处理...' : '更新密码' }}
            </button>
          </div>
        </form>
      </section>

      <!-- API Key Tab -->
      <section v-if="activeTab === 'api'" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-2">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100">API 访问凭证</h2>
          <router-link to="/developer/api" class="text-xs text-violet-600 dark:text-violet-400 font-bold flex items-center hover:underline">
            查看接口文档 <ExternalLink class="w-3 h-3 ml-1" />
          </router-link>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400">用于第三方应用或工具调用智能体接口的授权码，请妥善保管。</p>
        
        <div class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-4">
          <div class="flex gap-2 items-center">
            <div class="flex-1 relative">
              <input 
                :type="showApiKey ? 'text' : 'password'" 
                v-model="apiKeyData.key" 
                readonly 
                class="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm py-2 pl-3 pr-10"
              />
              <button @click="showApiKey = !showApiKey" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <Eye v-if="!showApiKey" class="w-4 h-4" />
                <EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
            <button @click="copyApiKey" class="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors shadow-sm">
              <Copy class="w-4 h-4" />
            </button>
            <button @click="handleResetApiKey" class="px-4 py-2.5 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800/50 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors" :disabled="isResetting">
              {{ isResetting ? '重置中...' : '重置' }}
            </button>
          </div>

          <div class="flex flex-wrap gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div class="flex items-center text-xs text-slate-400">
              <Clock class="w-3.5 h-3.5 mr-1.5" />
              创建于: {{ formatDate(apiKeyData.createdAt, true) }}
            </div>
            <div class="flex items-center text-xs text-slate-400">
              <Activity class="w-3.5 h-3.5 mr-1.5" />
              最后使用: {{ apiKeyData.lastUsedAt ? formatDate(apiKeyData.lastUsedAt, true) : '从未被使用' }}
            </div>
          </div>
        </div>
        
        <div class="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/50 rounded-lg flex gap-3">
          <AlertTriangle class="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0" />
          <p class="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            <strong>安全提醒：</strong> API Key 拥有访问您账户下所有智能体的完整权限。请勿将 Key 泄露在公开的代码库（如 GitHub）或客户端代码中。如果怀疑 Key 已泄露，请立即重置。
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { currentUser, updateProfile, changePassword } from '@/stores/authStore'
import { getUserAgents } from '@/services/agentService'
import { getKnowledgeBases } from '@/services/knowledgeService'
import { getMyApiKey, resetMyApiKey } from '@/services/apiKeyService'
import { 
  User, Box, Database, LogIn, Camera, 
  ExternalLink, Eye, EyeOff, Copy, Clock, 
  Activity, AlertTriangle 
} from 'lucide-vue-next'

const activeTab = ref('profile')
const tabs = [
  { id: 'profile', label: '基本资料' },
  { id: 'security', label: '安全设置' },
  { id: 'api', label: 'API 访问' }
]

const agentCount = ref(0)
const kbCount = ref(0)
const isUpdating = ref(false)
const isChangingPassword = ref(false)
const isResetting = ref(false)
const showApiKey = ref(false)
const apiKeyData = reactive({
  key: '',
  createdAt: '',
  lastUsedAt: ''
})

const editForm = reactive({
  avatar: currentUser.value?.profile?.avatar || '',
  bio: currentUser.value?.profile?.bio || ''
})

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(async () => {
  try {
    const response = await getUserAgents()
    agentCount.value = response.total || response.agents?.length || 0
    
    const kbResponse = await getKnowledgeBases()
    kbCount.value = kbResponse.kbs?.length || 0

    const keyRes = await getMyApiKey()
    apiKeyData.key = keyRes.apiKey
    apiKeyData.createdAt = keyRes.createdAt
    apiKeyData.lastUsedAt = keyRes.lastUsedAt
  } catch (err) {
    console.error('获取统计数据失败:', err)
  }
})

const handleResetApiKey = async () => {
  if (!confirm('确定要重置 API Key 吗？重置后旧的 Key 将立即失效。')) return
  
  try {
    isResetting.value = true
    const res = await resetMyApiKey()
    apiKeyData.key = res.apiKey
    apiKeyData.createdAt = res.createdAt
    alert('API Key 已重置')
  } catch (err) {
    alert('重置失败: ' + err.message)
  } finally {
    isResetting.value = false
  }
}

const copyApiKey = () => {
  navigator.clipboard.writeText(apiKeyData.key)
  alert('API Key 已复制到剪贴板')
}

const formatDate = (dateStr, time = false) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  if (time) {
    return date.toLocaleString('zh-CN', { hour12: false })
  }
  return date.toLocaleDateString('zh-CN')
}

const handleUpdateProfile = async () => {
  try {
    isUpdating.value = true
    await updateProfile({
      avatar: editForm.avatar,
      bio: editForm.bio
    })
    alert('资料更新成功')
  } catch (err) {
    alert('更新失败: ' + err.message)
  } finally {
    isUpdating.value = false
  }
}

const handleChangePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('两次输入的新密码不一致')
    return
  }
  
  try {
    isChangingPassword.value = true
    await changePassword(
      passwordForm.oldPassword,
      passwordForm.newPassword,
      passwordForm.confirmPassword
    )
    alert('密码修改成功')
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (err) {
    alert('修改失败: ' + err.message)
  } finally {
    isChangingPassword.value = false
  }
}
</script>

<style scoped>
/* Tabs animate in */
.animate-in {
  animation: animate-in 0.3s ease-out;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
