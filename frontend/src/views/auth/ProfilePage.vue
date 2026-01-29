<template>
  <div class="profile-container">
    <div class="profile-header">
      <div class="header-content">
        <div class="avatar-large">{{ currentUser?.profile?.avatar || '👤' }}</div>
        <div class="user-info">
          <h1>{{ currentUser?.username }}</h1>
          <p class="email">{{ currentUser?.email }}</p>
          <div class="badge-list">
            <span class="badge" :class="currentUser?.role">{{ currentUser?.role === 'admin' ? '管理员' : '普通用户' }}</span>
            <span class="badge">注册于 {{ formatDate(currentUser?.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-grid">
      <!-- 个人统计卡片 -->
      <div class="card stats-card">
        <h3>个人统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ agentCount }}</span>
            <span class="stat-label">我的智能体</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ kbCount }}</span>
            <span class="stat-label">知识库数量</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatDate(currentUser?.lastLoginAt, true) }}</span>
            <span class="stat-label">最后登录</span>
          </div>
        </div>
      </div>

      <!-- 资料编辑卡片 -->
      <div class="card edit-card">
        <h3>编辑资料</h3>
        <form @submit.prevent="handleUpdateProfile">
          <div class="form-group">
            <label>个人头像 (Emoji 或 URL)</label>
            <div class="avatar-input-group">
              <input 
                v-model="editForm.avatar" 
                type="text" 
                placeholder="例如: 🤖 或 https://..."
              />
              <div class="avatar-preview">{{ editForm.avatar || '👤' }}</div>
            </div>
          </div>
          <div class="form-group">
            <label>个人简介</label>
            <textarea 
              v-model="editForm.bio" 
              placeholder="介绍一下你自己..."
              rows="3"
            ></textarea>
          </div>
          <button type="submit" class="btn-primary" :disabled="isUpdating">
            {{ isUpdating ? '保存中...' : '保存修改' }}
          </button>
        </form>
      </div>

      <!-- API Key 管理卡片 -->
      <div class="card api-key-card">
        <h3>API 访问凭证</h3>
        <p class="card-desc">用于第三方应用或工具调用智能体接口的授权码。</p>
        <div class="api-key-box">
          <div class="key-display">
            <input 
              :type="showApiKey ? 'text' : 'password'" 
              v-model="apiKeyData.key" 
              readonly 
              class="key-input"
            />
            <button @click="showApiKey = !showApiKey" class="icon-btn">
              {{ showApiKey ? '👁️‍🗨️' : '👁️' }}
            </button>
          </div>
          <div class="key-actions">
            <button @click="copyApiKey" class="btn-sm">复制</button>
            <button @click="handleResetApiKey" class="btn-sm btn-danger" :disabled="isResetting">
              {{ isResetting ? '重置中...' : '重置' }}
            </button>
            <router-link to="/agent/capabilities" class="btn-sm btn-link">去调试功能矩阵 ↗</router-link>
          </div>
        </div>
        <div class="key-info" v-if="apiKeyData.createdAt">
          <span>创建于: {{ formatDate(apiKeyData.createdAt, true) }}</span>
          <span v-if="apiKeyData.lastUsedAt">最后使用: {{ formatDate(apiKeyData.lastUsedAt, true) }}</span>
          <span v-else>从未被使用</span>
        </div>
      </div>

      <!-- 安全设置卡片 -->
      <div class="card security-card">
        <h3>修改密码</h3>
        <form @submit.prevent="handleChangePassword">
          <div class="form-group">
            <label>当前密码</label>
            <input v-model="passwordForm.oldPassword" type="password" required />
          </div>
          <div class="form-group">
            <label>新密码</label>
            <input v-model="passwordForm.newPassword" type="password" required />
          </div>
          <div class="form-group">
            <label>确认新密码</label>
            <input v-model="passwordForm.confirmPassword" type="password" required />
          </div>
          <button type="submit" class="btn-secondary" :disabled="isChangingPassword">
            {{ isChangingPassword ? '处理中...' : '修改密码' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { currentUser, updateProfile, changePassword } from '@/stores/authStore'
import { getUserAgents } from '@/services/agentService'
import { getKnowledgeBases } from '@/services/knowledgeService'
import { getMyApiKey, resetMyApiKey } from '@/services/apiKeyService'

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
    // 接口返回结构是 { agents: [], total: 0, ... }
    agentCount.value = response.total || response.agents?.length || 0
    
    const kbResponse = await getKnowledgeBases()
    // 接口返回结构是 { kbs: [] }
    kbCount.value = kbResponse.kbs?.length || 0

    // 获取 API Key
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
.profile-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.avatar-large {
  width: 100px;
  height: 100px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
}

.user-info h1 {
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  color: #1e293b;
}

.email {
  color: #64748b;
  margin-bottom: 1rem;
}

.badge-list {
  display: flex;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  background: #f1f5f9;
  color: #64748b;
}

.badge.admin {
  background: #fee2e2;
  color: #ef4444;
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.2rem;
  color: #1e293b;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.75rem;
}

.stats-card {
  grid-column: 1 / -1;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #4f46e5;
}

.stat-label {
  font-size: 0.9rem;
  color: #64748b;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #475569;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.avatar-input-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.avatar-preview {
  width: 45px;
  height: 45px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.btn-primary, .btn-secondary {
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
}

.api-key-card {
  grid-column: 1 / -1;
}

.card-desc {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1rem;
}

.api-key-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.key-display {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.key-input {
  flex: 1;
  background: white;
  font-family: monospace;
  font-size: 0.9rem;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.key-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.4rem 1rem;
  font-size: 0.875rem;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sm:hover {
  background: #f1f5f9;
}

.btn-danger {
  color: #ef4444;
  border-color: #fecaca;
}

.btn-danger:hover {
  background: #fef2f2;
}

.btn-link {
  text-decoration: none;
  color: #4f46e5;
  display: inline-flex;
  align-items: center;
}

.key-info {
  margin-top: 1rem;
  display: flex;
  gap: 1.5rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
