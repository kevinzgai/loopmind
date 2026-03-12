/**
 * 内存缓存服务
 * 基于 Map 实现的轻量级 TTL 缓存，无需额外依赖
 * 支持对话结果、嵌入向量、配置数据的缓存
 */
class CacheService {
  constructor() {
    this.store = new Map();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };

    // 每 5 分钟清理过期缓存
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} ttl - 过期时间（秒），默认 5 分钟
   */
  set(key, value, ttl = 300) {
    const expiresAt = Date.now() + ttl * 1000;
    this.store.set(key, { value, expiresAt });
    this.stats.sets++;
  }

  /**
   * 获取缓存
   */
  get(key) {
    const item = this.store.get(key);
    if (!item) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value;
  }

  /**
   * 检查缓存是否存在
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * 删除缓存
   */
  delete(key) {
    this.stats.deletes++;
    return this.store.delete(key);
  }

  /**
   * 删除匹配前缀的所有缓存
   */
  deleteByPrefix(prefix) {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    this.stats.deletes += count;
    return count;
  }

  /**
   * 清理过期缓存
   */
  cleanup() {
    const now = Date.now();
    let count = 0;
    for (const [key, item] of this.store.entries()) {
      if (now > item.expiresAt) {
        this.store.delete(key);
        count++;
      }
    }
    if (count > 0) {
      console.log(`🧹 缓存清理: 删除 ${count} 个过期条目`);
    }
  }

  /**
   * 清空所有缓存
   */
  clear() {
    this.store.clear();
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      size: this.store.size,
      hitRate: total > 0 ? `${((this.stats.hits / total) * 100).toFixed(1)}%` : '0%',
    };
  }

  /**
   * 获取或设置缓存（如果不存在则执行 fn 并缓存结果）
   */
  async getOrSet(key, fn, ttl = 300) {
    const cached = this.get(key);
    if (cached !== null) return cached;

    const value = await fn();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * 销毁缓存服务
   */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// 导出单例
export const cache = new CacheService();

/**
 * 缓存键生成器
 */
export const CacheKeys = {
  // Agent 配置缓存（5分钟）
  agent: (agentId) => `agent:${agentId}`,

  // Embedding 缓存（1小时）- 相同文本的 embedding 结果是固定的
  embedding: (text) => `emb:${Buffer.from(text).toString('base64').slice(0, 40)}`,

  // 系统配置缓存（10分钟）
  config: (key) => `cfg:${key}`,

  // 用户权限缓存（5分钟）
  userPermissions: (userId) => `perm:${userId}`,

  // Dashboard 统计缓存（5分钟）
  dashboardStats: (userId) => `dash:stats:${userId || 'global'}`,

  // 知识库列表缓存（2分钟）
  knowledgeList: (userId) => `kb:list:${userId}`,

  // 已发布 Agent 列表缓存（3分钟）
  publishedAgents: (page, category) => `agents:pub:${page}:${category || 'all'}`,

  // 热词分析缓存（30分钟）
  hotWords: (userId) => `analytics:hotwords:${userId || 'global'}`,
};

/**
 * TTL 常量（秒）
 */
export const TTL = {
  SHORT: 60,         // 1分钟
  MEDIUM: 300,       // 5分钟
  LONG: 1800,        // 30分钟
  HOUR: 3600,        // 1小时
  DAY: 86400,        // 1天
  EMBEDDING: 3600,   // Embedding 缓存1小时
  CONFIG: 600,       // 系统配置缓存10分钟
  AGENT: 300,        // Agent 配置缓存5分钟
};

export default cache;
