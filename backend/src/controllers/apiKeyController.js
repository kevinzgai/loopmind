import ApiKey from '../models/ApiKeySchema.js';
import crypto from 'crypto';

const MAX_KEYS_PER_USER = 20;

/**
 * 获取当前用户的所有 API Keys
 */
export async function getMyApiKeys(req, res) {
  try {
    const userId = req.user.userId;
    const apiKeys = await ApiKey.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({
      apiKeys,
      total: apiKeys.length,
      maxKeys: MAX_KEYS_PER_USER
    });
  } catch (error) {
    console.error('❌ 获取 API Keys 失败:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * 创建新的 API Key
 */
export async function createApiKey(req, res) {
  try {
    const userId = req.user.userId;
    const { name, expiresAt } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '密钥名称不能为空' });
    }

    const count = await ApiKey.countDocuments({ userId });
    if (count >= MAX_KEYS_PER_USER) {
      return res.status(400).json({ 
        error: `每个用户最多只能创建 ${MAX_KEYS_PER_USER} 个 API Key` 
      });
    }

    const key = `sk-${crypto.randomBytes(24).toString('hex')}`;
    const apiKey = await ApiKey.create({
      name: name.trim(),
      key,
      userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    res.status(201).json({
      apiKey,
      message: 'API Key 创建成功'
    });
  } catch (error) {
    console.error('❌ 创建 API Key 失败:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * 删除 API Key
 */
export async function deleteApiKey(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const apiKey = await ApiKey.findOneAndDelete({ _id: id, userId });
    
    if (!apiKey) {
      return res.status(404).json({ error: 'API Key 不存在' });
    }

    res.json({ message: 'API Key 已删除' });
  } catch (error) {
    console.error('❌ 删除 API Key 失败:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * 切换 API Key 激活状态
 */
export async function toggleApiKeyStatus(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const apiKey = await ApiKey.findOne({ _id: id, userId });
    
    if (!apiKey) {
      return res.status(404).json({ error: 'API Key 不存在' });
    }

    apiKey.isActive = !apiKey.isActive;
    await apiKey.save();

    res.json({
      apiKey,
      message: apiKey.isActive ? 'API Key 已启用' : 'API Key 已禁用'
    });
  } catch (error) {
    console.error('❌ 切换 API Key 状态失败:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * 获取 API Key 使用统计
 */
export async function getApiKeyStats(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const apiKey = await ApiKey.findOne({ _id: id, userId });
    
    if (!apiKey) {
      return res.status(404).json({ error: 'API Key 不存在' });
    }

    res.json({
      apiKeyId: apiKey._id,
      name: apiKey.name,
      requestCount: apiKey.requestCount,
      errorCount: apiKey.errorCount,
      lastUsedAt: apiKey.lastUsedAt,
      lastUsedIp: apiKey.lastUsedIp,
      lastUsedUserAgent: apiKey.lastUsedUserAgent,
      createdAt: apiKey.createdAt,
      isActive: apiKey.isActive
    });
  } catch (error) {
    console.error('❌ 获取 API Key 统计失败:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * 获取所有 API Keys 的统计概览
 */
export async function getAllApiKeysStats(req, res) {
  try {
    const userId = req.user.userId;
    const apiKeys = await ApiKey.find({ userId })
      .select('name requestCount errorCount lastUsedAt createdAt isActive');

    const totalRequests = apiKeys.reduce((sum, key) => sum + key.requestCount, 0);
    const totalErrors = apiKeys.reduce((sum, key) => sum + key.errorCount, 0);
    const activeKeys = apiKeys.filter(key => key.isActive).length;

    res.json({
      summary: {
        totalKeys: apiKeys.length,
        activeKeys,
        totalRequests,
        totalErrors,
        successRate: totalRequests > 0 
          ? ((totalRequests - totalErrors) / totalRequests * 100).toFixed(2) + '%'
          : '0%'
      },
      apiKeys
    });
  } catch (error) {
    console.error('❌ 获取 API Keys 统计失败:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * 重置 API Key（保留向后兼容）
 */
export async function resetMyApiKey(req, res) {
  try {
    const userId = req.user.userId;
    const newKey = `sk-${crypto.randomBytes(24).toString('hex')}`;
    
    const apiKey = await ApiKey.findOneAndUpdate(
      { userId },
      { 
        key: newKey,
        createdAt: new Date(),
        lastUsedAt: null,
        requestCount: 0,
        errorCount: 0
      },
      { upsert: true, new: true }
    );

    res.json({
      apiKey: apiKey.key,
      createdAt: apiKey.createdAt,
      message: 'API Key 已重置'
    });
  } catch (error) {
    console.error('❌ 重置 API Key 失败:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/**
 * 获取当前用户的 API Key（保留向后兼容）
 */
export async function getMyApiKey(req, res) {
  try {
    const userId = req.user.userId;
    let apiKey = await ApiKey.findOne({ userId });
    
    if (!apiKey) {
      const key = `sk-${crypto.randomBytes(24).toString('hex')}`;
      apiKey = await ApiKey.create({
        name: 'Default Key',
        key,
        userId
      });
    }

    res.json({
      apiKey: apiKey.key,
      createdAt: apiKey.createdAt,
      lastUsedAt: apiKey.lastUsedAt
    });
  } catch (error) {
    console.error('❌ 获取 API Key 失败:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
