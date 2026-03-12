import apiService from './apiService.js';

const API_BASE = '/knowledge';

/**
 * 知识库服务
 */

// 获取知识库列表
export async function getKnowledgeBases() {
  const res = await apiService.get(API_BASE);
  // apiService 拦截器返回 { code, data, message }，实际数据在 data 字段
  const kbs = res?.data?.kbs ?? res?.kbs ?? [];
  return { kbs };
}

// 创建知识库
export async function createKnowledgeBase(data) {
  const res = await apiService.post(API_BASE, data);
  return res?.data ?? res;
}

// 获取文档列表
export async function getDocuments(kbId) {
  const res = await apiService.get(`${API_BASE}/${kbId}/documents`);
  const docs = res?.data?.docs ?? res?.docs ?? [];
  return { docs };
}

// 删除文档
export async function deleteDocument(kbId, docId) {
  return await apiService.delete(`${API_BASE}/${kbId}/documents/${docId}`);
}

// 解析文档
export async function processDocument(kbId, docId) {
  return await apiService.post(`${API_BASE}/${kbId}/documents/${docId}/process`);
}

// 预览分段
export async function previewDocumentChunks(kbId, docId) {
  const res = await apiService.get(`${API_BASE}/${kbId}/documents/${docId}/preview`);
  const chunks = res?.data?.chunks ?? res?.chunks ?? [];
  return { chunks };
}

// 获取文档片段
export async function getDocumentChunks(kbId, docId) {
  const res = await apiService.get(`${API_BASE}/${kbId}/documents/${docId}/chunks`);
  const chunks = res?.data?.chunks ?? res?.chunks ?? [];
  return { chunks };
}

// 删除知识库
export async function deleteKnowledgeBase(kbId) {
  return await apiService.delete(`${API_BASE}/${kbId}`);
}

// 上传文档
export async function uploadDocument(kbId, file) {
  const formData = new FormData();
  formData.append('file', file);
  return await apiService.post(`${API_BASE}/${kbId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// 测试检索
export async function queryKnowledgeBase(kbId, query) {
  const res = await apiService.post(`${API_BASE}/${kbId}/query`, { query });
  return res?.data ?? res;
}
