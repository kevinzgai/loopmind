<template>
  <div class="knowledge-page">
    <div class="header-section">
      <div class="header-content">
        <h1>知识库管理</h1>
        <p class="subtitle">上传并管理你的私有文档，让智能体具备专业知识。</p>
      </div>
      <button @click="showCreateKBModal = true" class="btn-primary">
        <span class="icon">➕</span> 新建知识库
      </button>
    </div>

    <!-- 知识库列表 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>正在加载知识库...</p>
    </div>

    <div v-else-if="kbs.length === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>暂无知识库</h3>
      <p>创建一个知识库并上传文档，开始构建你的 RAG 应用。</p>
      <button @click="showCreateKBModal = true" class="btn-outline">立即创建</button>
    </div>

      <div class="kb-grid">
        <div 
          v-for="kb in kbs" 
          :key="kb.id" 
          class="kb-card"
          :class="{ active: selectedKB?.id === kb.id }"
          @click="selectKB(kb)"
        >
          <div class="kb-icon">📚</div>
          <div class="kb-info">
            <div class="kb-title-row">
              <h3>{{ kb.name }}</h3>
              <button class="btn-icon-delete" @click.stop="handleDeleteKB(kb)" title="删除知识库">🗑️</button>
            </div>
            <p class="kb-desc">{{ kb.description || '暂无描述' }}</p>
            <div class="kb-meta">
              <span>📄 {{ kb.documentCount }} 文档</span>
              <span>🧩 {{ kb.chunkCount }} 片段</span>
            </div>
          </div>
        </div>
      </div>

    <!-- 文档详情部分 -->
    <div v-if="selectedKB" class="doc-section">
      <div class="section-header">
        <h2>{{ selectedKB.name }} - 文档列表</h2>
        <div class="actions">
          <button @click="selectKB(selectedKB)" class="btn-refresh" :disabled="docsLoading">
            <span class="icon">🔄</span> 刷新列表
          </button>
          <input 
            type="file" 
            ref="fileInput" 
            style="display: none" 
            accept=".pdf,.docx,.txt"
            @change="handleFileUpload"
          />
          <button @click="$refs.fileInput.click()" class="btn-upload" :disabled="uploading">
            <span v-if="uploading" class="spinner-small"></span>
            <span v-else>📤</span> 上传文档
          </button>
        </div>
      </div>

      <div v-if="docsLoading" class="loading-state-small">
        <p>正在加载文档...</p>
      </div>

      <div v-else-if="documents.length === 0" class="empty-docs">
        <p>该知识库下暂无文档，请点击上方按钮上传。</p>
      </div>

      <div v-else class="doc-table-wrapper">
        <table class="doc-table">
          <thead>
            <tr>
              <th width="30%">文件名</th>
              <th width="80px">类型</th>
              <th width="100px">大小</th>
              <th width="100px">状态</th>
              <th width="100px">解析进度</th>
              <th width="160px">上传时间</th>
              <th width="200px">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in documents" :key="doc.id">
              <td class="doc-name">
                <div class="name-with-icon">
                  <span class="file-icon">📄</span>
                  <span class="name-text" :title="doc.name">{{ doc.name }}</span>
                </div>
              </td>
              <td>
                <span class="type-badge">{{ formatDocType(doc.type, doc.name) }}</span>
              </td>
              <td>{{ formatFileSize(doc.fileSize) }}</td>
              <td>
                <div class="status-cell">
                  <span :class="['status-tag', doc.status]">
                    {{ formatStatus(doc.status) }}
                  </span>
                  <span v-if="doc.status === 'failed'" class="error-tip" :title="'失败原因: ' + (doc.error || '未知错误')">❌</span>
                </div>
              </td>
              <td>
                <button 
                  v-if="doc.status === 'completed'" 
                  class="chunk-count-link" 
                  @click="handleViewChunks(doc)"
                  title="点击查看片段"
                >
                  {{ doc.chunkCount }} 片段
                </button>
                <span v-else>{{ doc.chunkCount || 0 }} 片段</span>
              </td>
              <td class="time-cell">{{ new Date(doc.createdAt).toLocaleString() }}</td>
              <td>
                <div class="table-actions">
                  <button 
                    v-if="doc.status === 'pending' || doc.status === 'failed'"
                    class="btn-text-primary"
                    @click="handlePreviewChunks(doc)"
                    title="查看切分结果"
                  >
                    预览分段
                  </button>
                  <button 
                    v-if="doc.status === 'pending' || doc.status === 'failed'"
                    class="btn-text-primary"
                    @click="handleProcessDoc(doc)"
                    title="调用 Embedding 进行向量化"
                  >
                    执行解析
                  </button>
                  <button class="btn-text-danger" @click="handleDeleteDoc(doc)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 查看片段 Modal -->
    <div v-if="showChunksModal" class="modal-overlay" @click.self="showChunksModal = false">
      <div class="modal-content chunks-modal">
        <div class="modal-header">
          <h2>{{ isPreviewMode ? '文档切分预览 (本地处理)' : '文档片段可视化 (已向量化)' }} - {{ viewingDoc?.name }}</h2>
          <button class="close-btn" @click="showChunksModal = false">✕</button>
        </div>
        <div v-if="chunksLoading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ isPreviewMode ? '正在读取文件并进行切分...' : '加载片段中...' }}</p>
        </div>
        <div v-else class="chunks-container">
          <div class="preview-tip" v-if="isPreviewMode">
             ℹ️ 当前为预览模式，仅展示文本切分结果。点击“执行解析”后才会消耗 Token 进行向量化。
          </div>
          <div v-for="(chunk, index) in chunks" :key="index" class="chunk-item">
            <div class="chunk-header">
              <span class="chunk-index">#{{ index + 1 }}</span>
              <span class="chunk-meta">字符数: {{ chunk.content.length }}</span>
            </div>
            <div class="chunk-content">{{ chunk.content }}</div>
          </div>
          <div v-if="chunks.length === 0" class="empty-chunks">
            未找到解析片段
          </div>
        </div>
      </div>
    </div>

    <!-- 创建知识库 Modal -->
    <div v-if="showCreateKBModal" class="modal-overlay" @click.self="showCreateKBModal = false">
      <div class="modal-content">
        <h2>新建知识库</h2>
        <div class="form-group">
          <label>名称</label>
          <input v-model="newKB.name" placeholder="例如：产品说明书" />
        </div>
        <div class="form-group">
          <label>描述</label>
          <textarea v-model="newKB.description" placeholder="简单介绍一下这个知识库的内容..."></textarea>
        </div>
        <div class="modal-footer">
          <button @click="showCreateKBModal = false" class="btn-cancel">取消</button>
          <button @click="handleCreateKB" class="btn-confirm" :disabled="!newKB.name">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { 
  getKnowledgeBases, 
  createKnowledgeBase, 
  getDocuments, 
  uploadDocument,
  deleteDocument,
  processDocument,
  deleteKnowledgeBase,
  getDocumentChunks,
  previewDocumentChunks
} from '@/services/knowledgeService';

const kbs = ref([]);
const loading = ref(true);
const selectedKB = ref(null);
const documents = ref([]);
const docsLoading = ref(false);
const showCreateKBModal = ref(false);
const uploading = ref(false);

// 查看片段相关
const showChunksModal = ref(false);
const chunksLoading = ref(false);
const chunks = ref([]);
const viewingDoc = ref(null);
const isPreviewMode = ref(false); // 区分是查看已解析片段还是预览未解析片段

const newKB = reactive({
  name: '',
  description: ''
});

const loadKBs = async () => {
  try {
    loading.value = true;
    const res = await getKnowledgeBases();
    kbs.value = res.kbs;
    if (kbs.value.length > 0 && !selectedKB.value) {
      selectKB(kbs.value[0]);
    } else if (selectedKB.value) {
      // 刷新当前选中的 KB 信息（统计数据）
      const updated = kbs.value.find(k => k.id === selectedKB.value.id);
      if (updated) selectedKB.value = updated;
    }
  } catch (error) {
    console.error('获取知识库失败:', error);
  } finally {
    loading.value = false;
  }
};

const selectKB = async (kb) => {
  selectedKB.value = kb;
  docsLoading.value = true;
  try {
    const res = await getDocuments(kb.id);
    documents.value = res.docs;
  } catch (error) {
    console.error('获取文档失败:', error);
  } finally {
    docsLoading.value = false;
  }
};

const handleCreateKB = async () => {
  try {
    await createKnowledgeBase(newKB);
    showCreateKBModal.value = false;
    newKB.name = '';
    newKB.description = '';
    await loadKBs();
  } catch (error) {
    alert('创建失败: ' + error.message);
  }
};

const handleDeleteKB = async (kb) => {
  if (!confirm(`确定要删除知识库 "${kb.name}" 吗？这将删除该库下的所有文档及向量数据。`)) return;
  try {
    await deleteKnowledgeBase(kb.id);
    if (selectedKB.value?.id === kb.id) selectedKB.value = null;
    await loadKBs();
  } catch (error) {
    alert('删除失败: ' + error.message);
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file || !selectedKB.value) return;

  try {
    uploading.value = true;
    await uploadDocument(selectedKB.value.id, file);
    await selectKB(selectedKB.value);
    await loadKBs();
  } catch (error) {
    alert('上传失败: ' + error.message);
  } finally {
    uploading.value = false;
    event.target.value = '';
  }
};

const handleProcessDoc = async (doc) => {
  try {
    doc.status = 'processing';
    await processDocument(selectedKB.value.id, doc.id);
    // 解析是异步的，我们可以通过轮询或简单的提示
    alert('解析任务已启动，请稍后刷新查看状态');
    await selectKB(selectedKB.value);
  } catch (error) {
    alert('启动解析失败: ' + error.message);
  }
};

const handleViewChunks = async (doc) => {
  viewingDoc.value = doc;
  showChunksModal.value = true;
  chunksLoading.value = true;
  chunks.value = [];
  isPreviewMode.value = false;
  try {
    const res = await getDocumentChunks(selectedKB.value.id, doc.id);
    chunks.value = res.chunks;
  } catch (error) {
    alert('获取片段失败: ' + error.message);
  } finally {
    chunksLoading.value = false;
  }
};

const handlePreviewChunks = async (doc) => {
  viewingDoc.value = doc;
  showChunksModal.value = true;
  chunksLoading.value = true;
  chunks.value = [];
  isPreviewMode.value = true;
  
  try {
    const res = await previewDocumentChunks(selectedKB.value.id, doc.id);
    // 预览接口返回的是字符串数组，统一转为对象格式方便展示
    chunks.value = res.chunks.map(text => ({ content: text }));
  } catch (error) {
    console.error('预览分段失败:', error);
    alert('预览分段失败: ' + (error.response?.data?.error || error.message));
  } finally {
    chunksLoading.value = false;
  }
};

const handleDeleteDoc = async (doc) => {
  if (!confirm(`确定要删除文档 "${doc.name}" 吗？`)) return;
  try {
    await deleteDocument(selectedKB.value.id, doc.id);
    await selectKB(selectedKB.value);
    await loadKBs();
  } catch (error) {
    alert('删除失败: ' + error.message);
  }
};

const formatDocType = (type, name) => {
  if (name?.endsWith('.docx')) return 'DOCX';
  if (name?.endsWith('.pdf')) return 'PDF';
  if (name?.endsWith('.txt')) return 'TXT';
  if (type?.includes('pdf')) return 'PDF';
  if (type?.includes('word')) return 'DOCX';
  return 'TXT';
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatStatus = (status) => {
  const maps = {
    'pending': '等待处理',
    'processing': '正在解析',
    'completed': '解析成功',
    'failed': '解析失败'
  };
  return maps[status] || status;
};

onMounted(loadKBs);
</script>

<style scoped>
.knowledge-page {
  padding: 24px;
  @apply bg-background text-foreground;
}

.table-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  white-space: nowrap;
}

.doc-name {
  max-width: 0; /* 允许 flex 缩放 */
}

.name-with-icon {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  flex: 1;
}

.btn-text-primary, .btn-text-danger {
  padding: 4px 8px;
  white-space: nowrap;
}

.preview-tip {
  @apply bg-primary/10 text-primary;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 6px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  @apply text-foreground;
}

.subtitle {
  @apply text-muted-foreground;
}

.btn-primary {
  @apply bg-primary text-primary-foreground;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.kb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.kb-card {
  @apply bg-card border-border;
  border-width: 1px;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.kb-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.kb-card.active {
  @apply border-primary bg-primary/5;
}

.kb-icon {
  font-size: 2rem;
}

.kb-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.kb-info h3 {
  margin: 0;
  @apply text-foreground;
}

.btn-icon-delete {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
  padding: 4px;
  border-radius: 4px;
}

.kb-card:hover .btn-icon-delete {
  opacity: 0.5;
}

.btn-icon-delete:hover {
  opacity: 1 !important;
  @apply bg-destructive/10;
}

.kb-desc {
  font-size: 0.875rem;
  @apply text-muted-foreground;
  margin-bottom: 1rem;
}

.kb-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  @apply text-muted-foreground/60;
}

.doc-section {
  @apply bg-card border-border;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border-width: 1px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.actions {
  display: flex;
  gap: 1rem;
}

.btn-refresh {
  @apply bg-background border-border text-muted-foreground;
  border-width: 1px;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.btn-refresh:hover {
  @apply bg-muted border-input;
}

.btn-upload {
  @apply bg-primary/10 text-primary;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
}

.doc-table th {
  text-align: left;
  padding: 1rem;
  @apply border-b-2 border-border text-muted-foreground;
  font-weight: 500;
  font-size: 0.875rem;
}

.doc-table td {
  padding: 1rem;
  @apply border-b border-border text-foreground;
  font-size: 0.875rem;
  vertical-align: middle;
}

.name-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 100%;
}

.name-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @apply text-foreground;
  font-weight: 500;
}

.type-badge {
  @apply bg-muted text-muted-foreground;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.error-tip {
  cursor: help;
  @apply text-destructive;
}

.chunk-count-link {
  background: none;
  border: none;
  @apply text-primary;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  text-decoration: underline;
}

.chunk-count-link:hover {
  @apply text-primary/80;
}

.time-cell {
  @apply text-muted-foreground/60;
  font-size: 0.8rem;
}

.status-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.status-tag.pending { @apply bg-muted text-muted-foreground; }
.status-tag.processing { @apply bg-yellow-500/10 text-yellow-600; }
.status-tag.completed { @apply bg-green-500/10 text-green-600; }
.status-tag.failed { @apply bg-destructive/10 text-destructive; }

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-text-primary {
  background: none;
  border: none;
  @apply text-primary;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0;
}

.btn-text-danger {
  background: none;
  border: none;
  @apply text-destructive;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0;
}

.btn-text-primary:hover, .btn-text-danger:hover {
  text-decoration: underline;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  @apply bg-card text-card-foreground;
  padding: 2rem;
  border-radius: 12px;
  width: 400px;
}

.chunks-modal {
  width: 800px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.modal-header {
  padding: 1.5rem;
  @apply border-b border-border;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  @apply text-muted-foreground;
}

.chunks-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  @apply bg-background;
}

.chunk-item {
  @apply bg-card border-border;
  border-width: 1px;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.chunk-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  @apply text-muted-foreground/60;
}

.chunk-index {
  font-weight: 600;
  @apply text-primary;
}

.chunk-content {
  font-size: 0.9rem;
  line-height: 1.6;
  @apply text-foreground;
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-chunks {
  text-align: center;
  padding: 3rem;
  @apply text-muted-foreground/60;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  @apply text-foreground;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  @apply border-input bg-background text-foreground;
  border-width: 1px;
  border-radius: 6px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.spinner-small {
  width: 16px;
  height: 16px;
  @apply border-2 border-primary border-t-transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
