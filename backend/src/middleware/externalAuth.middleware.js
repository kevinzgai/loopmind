import ApiKey from '../models/ApiKeySchema.js';

/**
 * 第三方 API 授权中间件
 * 验证请求头中的 X-API-Key
 */
export const verifyApiKey = async (req, res, next) => {
  try {
    const apiKeyString = req.headers['x-api-key'] || req.query.api_key;

    if (!apiKeyString) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '缺少 API Key。请在请求头中包含 X-API-Key 或在查询参数中包含 api_key。'
      });
    }

    const apiKeyDoc = await ApiKey.findOne({ key: apiKeyString, isActive: true });

    if (!apiKeyDoc) {
      return res.status(403).json({
        error: 'Forbidden',
        message: '无效或已禁用的 API Key。'
      });
    }

    if (apiKeyDoc.expiresAt && apiKeyDoc.expiresAt < new Date()) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'API Key 已过期。'
      });
    }

    req.user = {
      userId: apiKeyDoc.userId.toString(),
      apiKeyId: apiKeyDoc._id.toString(),
      isExternal: true
    };

    const updateData = {
      lastUsedAt: new Date(),
      requestCount: apiKeyDoc.requestCount + 1
    };

    if (req.ip) {
      updateData.lastUsedIp = req.ip;
    }

    if (req.headers['user-agent']) {
      updateData.lastUsedUserAgent = req.headers['user-agent'];
    }

    ApiKey.updateOne({ _id: apiKeyDoc._id }, updateData).catch(err => 
      console.error('❌ 更新 API Key 使用统计失败:', err)
    );

    next();
  } catch (error) {
    console.error('❌ API Key 验证过程出错:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
