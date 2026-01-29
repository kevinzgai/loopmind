import ApiKey from '../models/ApiKeySchema.js';
import crypto from 'crypto';

/**
 * 获取当前用户的 API Key
 */
export async function getMyApiKey(req, res) {
  try {
    const userId = req.user.userId;
    let apiKey = await ApiKey.findOne({ userId });
    
    // 如果没有，自动创建一个
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

/**
 * 重置用户的 API Key
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
        lastUsedAt: null
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
