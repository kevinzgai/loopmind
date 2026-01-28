import apiService from './apiService.js';

const API_BASE = '/knowledge';

/**
 * 知识库服务
 */

// 获取知识库列表
export async function getKnowledgeBases() {
  return await apiService.get(API_BASE);
}

// 创建知识库
export async function createKnowledgeBase(data) {
  return await apiService.post(API_BASE, data);
}

// 获取文档列表
export async function getDocuments(kbId) {
  return await apiService.get(`${API_BASE}/${kbId}/documents`);
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
  return await apiService.get(`${API_BASE}/${kbId}/documents/${docId}/preview`);
}

// 获取文档片段
export async function getDocumentChunks(kbId, docId) {
  return await apiService.get(`${API_BASE}/${kbId}/documents/${docId}/chunks`);
}

// 删除知识库
export async function deleteKnowledgeBase(kbId) {
  return await apiService.delete(`${API_BASE}/${kbId}`);
}

// 上传文档
export async function uploadDocument(kbId, file) {
  const formData = new FormData();
  formData.append('file', file);
  
  // 注意：apiService 需要支持 FormData
  return await apiService.post(`${API_BASE}/${kbId}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// 测试检索
export async function queryKnowledgeBase(kbId, query) {
  return await apiService.post(`${API_BASE}/${kbId}/query`, { query });
}
