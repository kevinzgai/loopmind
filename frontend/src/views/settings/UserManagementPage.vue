<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-bold font-heading">账号管理</h2>
      <Button @click="showCreateModal = true" class="shadow-glow">
        <Plus class="w-4 h-4" />创建用户
      </Button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="stat-card group">
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">总用户数</span>
          <div class="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors"><Users class="w-4 h-4" /></div>
        </div>
        <div class="text-2xl font-bold font-heading mt-2">{{ stats.totalUsers }}</div>
      </div>
      <div class="stat-card group">
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">活跃用户</span>
          <div class="p-2 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors"><UserCheck class="w-4 h-4" /></div>
        </div>
        <div class="text-2xl font-bold font-heading mt-2">{{ stats.activeUsers }}</div>
      </div>
      <div class="stat-card group">
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">管理员</span>
          <div class="p-2 rounded-lg bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors"><Shield class="w-4 h-4" /></div>
        </div>
        <div class="text-2xl font-bold font-heading mt-2">{{ stats.adminCount }}</div>
      </div>
      <div class="stat-card group">
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted-foreground">今日登录</span>
          <div class="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors"><Activity class="w-4 h-4" /></div>
        </div>
        <div class="text-2xl font-bold font-heading mt-2">{{ stats.todayLogins }}</div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-card border border-border rounded-xl overflow-hidden">
      <div class="flex items-center justify-between p-4 border-b border-border">
        <div class="relative">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="搜索用户名或邮箱..." class="pl-9 w-64 h-9" @keyup.enter="loadUsers" />
        </div>
        <Button variant="ghost" size="icon-sm" @click="loadUsers">
          <RefreshCw :class="['w-4 h-4', { 'animate-spin': loading }]" />
        </Button>
      </div>

      <div v-if="loading" class="p-10 flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 class="w-6 h-6 animate-spin text-primary" />
        <span class="text-sm">加载中...</span>
      </div>

      <div v-else-if="users.length === 0" class="p-10 flex flex-col items-center gap-2 text-muted-foreground">
        <Users class="w-10 h-10 opacity-30" />
        <span class="text-sm">暂无用户数据</span>
      </div>

      <table v-else class="w-full text-sm">
        <thead class="bg-muted/30">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">用户</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">邮箱</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">角色</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">状态</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">最后登录</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="user in users" :key="user.id" class="hover:bg-muted/20 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span class="text-xs font-bold text-primary">{{ user.username.charAt(0).toUpperCase() }}</span>
                </div>
                <span class="font-medium">{{ user.username }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-muted-foreground">{{ user.email }}</td>
            <td class="px-4 py-3">
              <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', user.role === 'admin' ? 'bg-orange-500/10 text-orange-500' : 'bg-muted text-muted-foreground']">
                {{ user.role === 'admin' ? '管理员' : '普通用户' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span :class="['text-xs px-2 py-0.5 rounded-full font-medium', user.isActive ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive']">
                {{ user.isActive ? '正常' : '已禁用' }}
              </span>
            </td>
            <td class="px-4 py-3 text-xs text-muted-foreground">{{ user.lastLoginAt ? formatDate(user.lastLoginAt) : '从未登录' }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-1" v-if="user.role !== 'admin'">
                <Button variant="ghost" size="icon-sm" @click="editUser(user)" title="编辑"><Edit2 class="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon-sm" @click="resetPassword(user)" title="重置密码"><Key class="w-3.5 h-3.5" /></Button>
                <Button variant="ghost" size="icon-sm" @click="toggleUserStatus(user)" :title="user.isActive ? '禁用' : '启用'">
                  <Ban v-if="user.isActive" class="w-3.5 h-3.5" />
                  <CheckCircle v-else class="w-3.5 h-3.5 text-green-500" />
                </Button>
                <Button variant="ghost" size="icon-sm" @click="confirmDelete(user)" class="text-destructive hover:text-destructive" title="删除"><Trash2 class="w-3.5 h-3.5" /></Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="p-4 border-t border-border flex items-center justify-between">
        <span class="text-sm text-muted-foreground">共 {{ total }} 条记录</span>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" @click="page--" :disabled="page === 1">上一页</Button>
          <span class="text-sm text-muted-foreground">{{ page }} / {{ totalPages }}</span>
          <Button variant="outline" size="sm" @click="page++" :disabled="page === totalPages">下一页</Button>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showCreateModal = false">
          <div class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative bg-card border border-border rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-bold font-heading text-base">创建新用户</h3>
              <Button variant="ghost" size="icon-sm" @click="showCreateModal = false"><X class="w-4 h-4" /></Button>
            </div>
            <form @submit.prevent="createUser" class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">用户名</label>
                <Input v-model="createForm.username" type="text" required />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">邮箱</label>
                <Input v-model="createForm.email" type="email" required />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">密码</label>
                <Input v-model="createForm.password" type="password" required />
              </div>
              <div class="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" @click="showCreateModal = false">取消</Button>
                <Button type="submit" :disabled="submitting" class="shadow-glow">{{ submitting ? '创建中...' : '创建' }}</Button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showEditModal = false">
          <div class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative bg-card border border-border rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-bold font-heading text-base">编辑用户</h3>
              <Button variant="ghost" size="icon-sm" @click="showEditModal = false"><X class="w-4 h-4" /></Button>
            </div>
            <form @submit.prevent="updateUser" class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">用户名</label>
                <Input v-model="editForm.username" type="text" required />
              </div>
              <div class="space-y-1.5">
                <label class="text-sm font-medium">邮箱</label>
                <Input v-model="editForm.email" type="email" required />
              </div>
              <div class="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" @click="showEditModal = false">取消</Button>
                <Button type="submit" :disabled="submitting" class="shadow-glow">{{ submitting ? '保存中...' : '保存' }}</Button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Reset Password Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showResetModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showResetModal = false">
          <div class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative bg-card border border-border rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-bold font-heading text-base">重置密码</h3>
              <Button variant="ghost" size="icon-sm" @click="showResetModal = false"><X class="w-4 h-4" /></Button>
            </div>
            <p class="text-sm text-muted-foreground mb-4">为用户 <strong class="text-foreground">{{ resetTarget?.username }}</strong> 设置新密码</p>
            <form @submit.prevent="submitResetPassword" class="space-y-4">
              <div class="space-y-1.5">
                <label class="text-sm font-medium">新密码</label>
                <Input v-model="resetForm.password" type="password" required />
              </div>
              <div class="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" @click="showResetModal = false">取消</Button>
                <Button type="submit" :disabled="submitting">{{ submitting ? '重置中...' : '重置密码' }}</Button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Confirm -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showDeleteConfirm = false">
          <div class="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative bg-card border border-border rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-bold font-heading text-base">确认删除</h3>
              <Button variant="ghost" size="icon-sm" @click="showDeleteConfirm = false"><X class="w-4 h-4" /></Button>
            </div>
            <p class="text-sm text-muted-foreground mb-6">确定要删除用户 <strong class="text-foreground">{{ deleteTarget?.username }}</strong> 吗？此操作不可撤销。</p>
            <div class="flex justify-end gap-3">
              <Button variant="outline" @click="showDeleteConfirm = false">取消</Button>
              <Button variant="destructive" @click="deleteUser" :disabled="submitting">{{ submitting ? '删除中...' : '删除' }}</Button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Plus, Search, RefreshCw, Loader2, Users, UserCheck, Shield, Activity, Edit2, Key, Ban, CheckCircle, Trash2, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import apiService from '@/services/apiService.js'

const loading = ref(false)
const submitting = ref(false)
const users = ref([])
const stats = ref({ totalUsers: 0, activeUsers: 0, adminCount: 0, todayLogins: 0 })
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
    if (res) stats.value = res
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
    await apiService.request('/admin/users', { method: 'POST', body: JSON.stringify(createForm.value) })
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
    await apiService.request(`/admin/users/${deleteTarget.value.id}`, { method: 'DELETE' })
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
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

watch(page, loadUsers)

onMounted(() => {
  loadStats()
  loadUsers()
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
