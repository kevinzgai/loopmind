/**
 * 智能体服务
 */

const API_BASE = 'http://localhost:3000/api/agent';

/**
 * 创建智能体
 */
export async function createAgent(agentData, token) {
  const response = await fetch(`${API_BASE}/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(agentData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || '创建智能体失败');
  }

  return data.agent;
}

/**
 * 获取用户的智能体列表
 */
export async function getUserAgents(token, page = 1, limit = 10) {
  const response = await fetch(`${API_BASE}/my-agents?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || '获取智能体列表失败');
  }

  return data;
}

/**
 * 获取已发布的智能体列表（广场）
 */
export async function getPublishedAgents(page = 1, limit = 10) {
  const response = await fetch(`${API_BASE}/published?page=${page}&limit=${limit}`, {
    method: 'GET'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || '获取已发布智能体列表失败');
  }

  return data;
}

/**
 * 获取智能体详情
 */
export async function getAgent(agentId) {
  const response = await fetch(`${API_BASE}/${agentId}`, {
    method: 'GET'
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || '获取智能体详情失败');
  }

  return data.agent;
}

/**
 * 更新智能体
 */
export async function updateAgent(agentId, updateData, token) {
  const response = await fetch(`${API_BASE}/${agentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || '更新智能体失败');
  }

  return data.agent;
}

/**
 * 发布智能体
 */
export async function publishAgent(agentId, token) {
  const response = await fetch(`${API_BASE}/${agentId}/publish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || '发布智能体失败');
  }

  return data.agent;
}

/**
 * 下架智能体
 */
export async function unpublishAgent(agentId, token) {
  const response = await fetch(`${API_BASE}/${agentId}/unpublish`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || '下架智能体失败');
  }

  return data.agent;
}
export async function deleteAgent(agentId, token) {
  const response = await fetch(`${API_BASE}/${agentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || '删除智能体失败');
  }

  return data;
}

/**
 * 获取用户与智能体的记忆
 */
export async function getMemory(agentId, token) {
  const response = await fetch(`${API_BASE}/${agentId}/memory`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || '获取记忆失败');
  }

  return data.memory;
}
