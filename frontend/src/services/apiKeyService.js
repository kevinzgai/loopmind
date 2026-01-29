import apiService from './apiService';

const API_BASE = '/api-key';

/**
 * 获取我的 API Key
 */
export async function getMyApiKey() {
  return await apiService.get(`${API_BASE}/my-key`);
}

/**
 * 重置我的 API Key
 */
export async function resetMyApiKey() {
  return await apiService.post(`${API_BASE}/reset-key`);
}

export default {
  getMyApiKey,
  resetMyApiKey
};
