<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">账号管理</h2>
      <button @click="showCreateModal = true" class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
        <Plus class="w-4 h-4" />
        创建用户
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users class="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ stats.totalUsers }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">总用户数</div>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <UserCheck class="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ stats.activeUsers }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">活跃用户</div>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Shield class="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ stats.adminCount }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">管理员</div>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Activity class="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div class="text-2xl font-bold text-slate-900 dark:text-slate-100">{{ stats.todayLogins }}</div>
            <div class="text-sm text-slate-500 dark:text-slate-400">今日登录</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input v-model="searchQuery" type="text" placeholder="搜索用户名或邮箱..." class="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-violet-500" @keyup.enter="loadUsers" />
          </div>
        </div>
        <button @click="loadUsers" class="px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <RefreshCw :class="['w-4 h-4', { 'animate-spin': loading }]" />
        </button>
      </div>

      <div v-if="loading" class="p-8 text-center text-slate-500 dark:text-slate-400">
        <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2" />
        加载中...
      </div>

      <div v-else-if="users.length === 0" class="p-8 text-center text-slate-500 dark:text-slate-400">
        <Users class="w-12 h-12 mx-auto mb-2 opacity-50" />
        暂无用户数据
      </div>

      <table v-else class="w-full">
        <thead class="bg-slate-50 dark:bg-slate-900/50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">用户</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">邮箱</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">角色</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">状态</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">最后登录</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <span class="text-sm font-medium text-violet-600 dark:text-violet-400">{{ user.username.charAt(0).toUpperCase() }}</span>
                </div>
                <span class="font-medium text-slate-900 dark:text-slate-100">{{ user.username }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{{ user.email }}</td>
            <td class="px-4 py-3">
              <span :class="[
                'px-2 py-1 text-xs font-medium rounded-full',
                user.role === 'admin' 
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              ]">
                {{ user.role === 'admin' ? '管理员' : '普通用户' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span :class="[
                'px-2 py-1 text-xs font-medium rounded-full',
                user.isActive 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              ]">
                {{ user.isActive ? '正常' : '已禁用' }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
              {{ user.lastLoginAt ? formatDate(user.lastLoginAt) : '从未登录' }}
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <button v-if="user.role !== 'admin'" @click="editUser(user)" class="p-1.5 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="编辑">
                  <Edit2 class="w-4 h-4" />
                </button>
                <button v-if="user.role !== 'admin'" @click="resetPassword(user)" class="p-1.5 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="重置密码">
                  <Key class="w-4 h-4" />
                </button>
                <button v-if="user.role !== 'admin'" @click="toggleUserStatus(user)" class="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" :title="user.isActive ? '禁用' : '启用'">
                  <Ban v-if="user.isActive" class="w-4 h-4" />
                  <CheckCircle v-else class="w-4 h-4" />
                </button>
                <button v-if="user.role !== 'admin'" @click="confirmDelete(user)" class="p-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="删除">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div class="text-sm text-slate-500 dark:text-slate-400">
          共 {{ total }} 条记录
        </div>
        <div class="flex items-center gap-2">
          <button @click="page--" :disabled="page === 1" class="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
            上一页
          </button>
          <span class="text-sm text-slate-600 dark:text-slate-400">{{ page }} / {{ totalPages }}</span>
          <button @click="page++" :disabled="page === totalPages" class="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 创建用户弹窗 -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showCreateModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">创建新用户</h3>
        <form @submit.prevent="createUser">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">用户名</label>
              <input v-model="createForm.username" type="text" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">邮箱</label>
              <input v-model="createForm.email" type="email" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">密码</label>
              <input v-model="createForm.password" type="password" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              取消
            </button>
            <button type="submit" :disabled="submitting" class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {{ submitting ? '创建中...' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 编辑用户弹窗 -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showEditModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">编辑用户</h3>
        <form @submit.prevent="updateUser">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">用户名</label>
              <input v-model="editForm.username" type="text" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">邮箱</label>
              <input v-model="editForm.email" type="email" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="showEditModal = false" class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              取消
            </button>
            <button type="submit" :disabled="submitting" class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {{ submitting ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 重置密码弹窗 -->
    <div v-if="showResetModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showResetModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">重置密码</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">为用户 <strong>{{ resetTarget?.username }}</strong> 设置新密码</p>
        <form @submit.prevent="submitResetPassword">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">新密码</label>
            <input v-model="resetForm.password" type="password" required class="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button type="button" @click="showResetModal = false" class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              取消
            </button>
            <button type="submit" :disabled="submitting" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {{ submitting ? '重置中...' : '重置密码' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showDeleteConfirm = false">
      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">确认删除</h3>
        <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">确定要删除用户 <strong>{{ deleteTarget?.username }}</strong> 吗？此操作不可撤销。</p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteConfirm = false" class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            取消
          </button>
          <button @click="deleteUser" :disabled="submitting" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50">
            {{ submitting ? '删除中...' : '删除' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Plus, Search, RefreshCw, Loader2, Users, UserCheck, Shield, Activity, Edit2, Key, Ban, CheckCircle, Trash2 } from 'lucide-vue-next'
import apiService from '@/services/apiService.js'

const loading = ref(false)
const submitting = ref(false)
const users = ref([])
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  adminCount: 0,
  todayLogins: 0
})
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const totalPages = ref(1)
const searchQuery = ref('')

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showResetModal = ref(false)
const showDeleteConfirm = ref(false)

const createForm = ref({ username: '', email: '', password: '' })
const editForm = ref({ id: '', username: '', email: '' })
const resetForm = ref({ password: '' })
const resetTarget = ref(null)
const deleteTarget = ref(null)

async function loadStats() {
  try {
    const res = await apiService.request('/admin/users/stats')
    if (res) {
      stats.value = res
    }
  } catch (e) {
    console.error('加载统计失败:', e)
  }
}

async function loadUsers() {
  loading.value = true
  try {
    const res = await apiService.request('/admin/users', {
      params: { page: page.value, limit: limit.value, search: searchQuery.value }
    })
    if (res) {
      users.value = res.users || []
      total.value = res.total || 0
      totalPages.value = res.totalPages || 1
    }
  } catch (e) {
    console.error('加载用户失败:', e)
  } finally {
    loading.value = false
  }
}

async function createUser() {
  submitting.value = true
  try {
    await apiService.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(createForm.value)
    })
    showCreateModal.value = false
    createForm.value = { username: '', email: '', password: '' }
    loadUsers()
    loadStats()
  } catch (e) {
    alert('创建失败: ' + (e.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

function editUser(user) {
  editForm.value = { id: user.id, username: user.username, email: user.email }
  showEditModal.value = true
}

async function updateUser() {
  submitting.value = true
  try {
    await apiService.request(`/admin/users/${editForm.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({ username: editForm.value.username, email: editForm.value.email })
    })
    showEditModal.value = false
    loadUsers()
  } catch (e) {
    alert('更新失败: ' + (e.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

function resetPassword(user) {
  resetTarget.value = user
  resetForm.value = { password: '' }
  showResetModal.value = true
}

async function submitResetPassword() {
  submitting.value = true
  try {
    await apiService.request(`/admin/users/${resetTarget.value.id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password: resetForm.value.password })
    })
    showResetModal.value = false
    alert('密码已重置')
  } catch (e) {
    alert('重置失败: ' + (e.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

async function toggleUserStatus(user) {
  try {
    await apiService.request(`/admin/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: !user.isActive })
    })
    loadUsers()
    loadStats()
  } catch (e) {
    alert('操作失败: ' + (e.message || '未知错误'))
  }
}

function confirmDelete(user) {
  deleteTarget.value = user
  showDeleteConfirm.value = true
}

async function deleteUser() {
  submitting.value = true
  try {
    await apiService.request(`/admin/users/${deleteTarget.value.id}`, {
      method: 'DELETE'
    })
    showDeleteConfirm.value = false
    loadUsers()
    loadStats()
  } catch (e) {
    alert('删除失败: ' + (e.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

watch(page, () => {
  loadUsers()
})

onMounted(() => {
  loadStats()
  loadUsers()
})
</script>
