/**
 * Chart AI JavaScript SDK
 * 轻量级客户端 SDK，封装所有 API 调用
 * 
 * @version 1.0.0
 * @author Chart AI Team
 */

class ChartAI {
  /**
   * @param {object} options
   * @param {string} options.baseURL - API 基础 URL
   * @param {string} [options.token] - JWT Token
   * @param {string} [options.apiKey] - API Key（外部接入使用）
   */
  constructor(options = {}) {
    this.baseURL = options.baseURL || 'http://localhost:3002/api';
    this.token = options.token || null;
    this.apiKey = options.apiKey || null;
  }

  /**
   * 设置认证 Token
   */
  setToken(token) {
    this.token = token;
    return this;
  }

  /**
   * 构建请求头
   */
  _headers(extra = {}) {
    const headers = { 'Content-Type': 'application/json', ...extra };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    if (this.apiKey) headers['X-API-Key'] = this.apiKey;
    return headers;
  }

  /**
   * 基础请求方法
   */
  async _request(method, path, data = null, options = {}) {
    const url = `${this.baseURL}${path}`;
    const config = {
      method,
      headers: this._headers(options.headers),
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    const json = await response.json();

    if (!response.ok || json.success === false) {
      throw new Error(json.message || `请求失败: ${response.status}`);
    }

    return json.data !== undefined ? json.data : json;
  }

  get(path, options) { return this._request('GET', path, null, options); }
  post(path, data, options) { return this._request('POST', path, data, options); }
  put(path, data, options) { return this._request('PUT', path, data, options); }
  delete(path, options) { return this._request('DELETE', path, null, options); }

  // ─── 认证 ────────────────────────────────────────────────────────────────

  auth = {
    login: (username, password) =>
      this.post('/auth/login', { username, password }),

    register: (username, email, password) =>
      this.post('/auth/register', { username, email, password }),

    me: () => this.get('/auth/me'),

    logout: () => this.post('/auth/logout'),
  };

  // ─── 智能体 ───────────────────────────────────────────────────────────────

  agents = {
    list: (page = 1, limit = 10) =>
      this.get(`/agent/my-agents?page=${page}&limit=${limit}`),

    published: (page = 1, limit = 12, category = '') =>
      this.get(`/agent/published?page=${page}&limit=${limit}&category=${category}`),

    get: (agentId) => this.get(`/agent/${agentId}`),

    create: (data) => this.post('/agent/create', data),

    update: (agentId, data) => this.put(`/agent/${agentId}`, data),

    delete: (agentId) => this.delete(`/agent/${agentId}`),

    publish: (agentId) => this.post(`/agent/${agentId}/publish`),

    unpublish: (agentId) => this.post(`/agent/${agentId}/unpublish`),

    // 流式对话
    chat: (agentId, conversationId, message, onChunk, onDone) => {
      return this._streamChat(
        `/agent/${agentId}/conversations/${conversationId}/chat`,
        { message },
        onChunk,
        onDone
      );
    },

    // 对话管理
    conversations: {
      list: (agentId) => this.get(`/agent/${agentId}/conversations`),
      create: (agentId, title) => this.post(`/agent/${agentId}/conversations`, { title }),
      delete: (agentId, conversationId) =>
        this.delete(`/agent/${agentId}/conversations/${conversationId}`),
    },

    // 版本管理
    versions: {
      list: (agentId) => this.get(`/agent/${agentId}/versions`),
      create: (agentId, changelog) => this.post(`/agent/${agentId}/versions`, { changelog }),
      rollback: (agentId, versionNumber) =>
        this.post(`/agent/${agentId}/versions/${versionNumber}/rollback`),
      compare: (agentId, vA, vB) =>
        this.get(`/agent/${agentId}/versions/compare?versionA=${vA}&versionB=${vB}`),
    },
  };

  // ─── 知识库 ───────────────────────────────────────────────────────────────

  knowledge = {
    list: () => this.get('/knowledge'),
    get: (kbId) => this.get(`/knowledge/${kbId}`),
    create: (data) => this.post('/knowledge', data),
    update: (kbId, data) => this.put(`/knowledge/${kbId}`, data),
    delete: (kbId) => this.delete(`/knowledge/${kbId}`),
    documents: {
      list: (kbId) => this.get(`/knowledge/${kbId}/documents`),
      delete: (kbId, docId) => this.delete(`/knowledge/${kbId}/documents/${docId}`),
    },
  };

  // ─── 工作流 ───────────────────────────────────────────────────────────────

  workflow = {
    list: (page = 1) => this.get(`/workflow?page=${page}`),
    get: (workflowId) => this.get(`/workflow/${workflowId}`),
    create: (data) => this.post('/workflow', data),
    update: (workflowId, data) => this.put(`/workflow/${workflowId}`, data),
    delete: (workflowId) => this.delete(`/workflow/${workflowId}`),
    publish: (workflowId) => this.post(`/workflow/${workflowId}/publish`),
    execute: (workflowId, inputData) =>
      this.post(`/workflow/${workflowId}/execute`, { inputData }),
  };

  // ─── 工具 ─────────────────────────────────────────────────────────────────

  tools = {
    builtin: () => this.get('/tools/builtin'),
    list: () => this.get('/tools'),
    get: (toolId) => this.get(`/tools/${toolId}`),
    create: (data) => this.post('/tools', data),
    update: (toolId, data) => this.put(`/tools/${toolId}`, data),
    delete: (toolId) => this.delete(`/tools/${toolId}`),
    execute: (toolId, inputs) => this.post(`/tools/${toolId}/execute`, { inputs }),
    search: (q) => this.get(`/tools/search?q=${encodeURIComponent(q)}`),
  };

  // ─── 数据分析 ─────────────────────────────────────────────────────────────

  analytics = {
    overview: (days = 30) => this.get(`/analytics/overview?days=${days}`),
    dailyTrend: (days = 30) => this.get(`/analytics/trend/daily?days=${days}`),
    topAgents: (limit = 10, days = 30) =>
      this.get(`/analytics/agents/top?limit=${limit}&days=${days}`),
    hotWords: (limit = 30, days = 30) =>
      this.get(`/analytics/words/hot?limit=${limit}&days=${days}`),
    activityByHour: (days = 30) =>
      this.get(`/analytics/activity/hourly?days=${days}`),
  };

  // ─── 导出 ─────────────────────────────────────────────────────────────────

  export = {
    conversation: (conversationId, format = 'markdown') => {
      const url = `${this.baseURL}/export/${conversationId}?format=${format}`;
      window.open(url, '_blank');
    },
  };

  // ─── 工作空间 ─────────────────────────────────────────────────────────────

  workspace = {
    list: () => this.get('/workspace'),
    get: (workspaceId) => this.get(`/workspace/${workspaceId}`),
    create: (data) => this.post('/workspace', data),
    update: (workspaceId, data) => this.put(`/workspace/${workspaceId}`, data),
    delete: (workspaceId) => this.delete(`/workspace/${workspaceId}`),
    members: {
      invite: (workspaceId, userId, role) =>
        this.post(`/workspace/${workspaceId}/members`, { userId, role }),
      remove: (workspaceId, userId) =>
        this.delete(`/workspace/${workspaceId}/members/${userId}`),
      updateRole: (workspaceId, userId, role) =>
        this.put(`/workspace/${workspaceId}/members/${userId}/role`, { role }),
    },
    inviteCode: {
      generate: (workspaceId, expiryHours = 24) =>
        this.post(`/workspace/${workspaceId}/invite-code`, { expiryHours }),
      join: (code) => this.post('/workspace/join', { code }),
    },
  };

  // ─── 审计日志 ─────────────────────────────────────────────────────────────

  audit = {
    list: (options = {}) => {
      const params = new URLSearchParams(options).toString();
      return this.get(`/audit?${params}`);
    },
    stats: (days = 7) => this.get(`/audit/stats?days=${days}`),
  };

  // ─── 健康检查 ─────────────────────────────────────────────────────────────

  health = () => this.get('/health');

  // ─── 流式对话 ─────────────────────────────────────────────────────────────

  /**
   * SSE 流式对话
   * @param {string} path - API 路径
   * @param {object} body - 请求体
   * @param {function} onChunk - 每个文本块的回调
   * @param {function} onDone - 完成回调
   */
  async _streamChat(path, body, onChunk, onDone) {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`流式请求失败: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            onDone?.(fullText);
            return fullText;
          }
          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content || parsed.content || '';
            if (text) {
              fullText += text;
              onChunk?.(text, fullText);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    onDone?.(fullText);
    return fullText;
  }
}

// ES Module 导出
export default ChartAI;
export { ChartAI };

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChartAI;
  module.exports.default = ChartAI;
}
