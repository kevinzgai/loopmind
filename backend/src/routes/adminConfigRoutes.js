import express from 'express';
import { authenticateToken } from '../shared/middleware/authMiddleware.js';
import { authorizeAdmin } from '../shared/middleware/authMiddleware.js';
import { getConfigMasked, updateConfig } from '../services/configService.js';

const router = express.Router();

router.get('/config', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const cfg = await getConfigMasked();
    res.json({ message: '获取系统配置成功', config: cfg });
  } catch (err) {
    console.error('❌ 获取系统配置失败:', err.message);
    res.status(500).json({ error: { message: '服务器错误' } });
  }
});

router.put('/config', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const payload = req.body || {};
    await updateConfig(payload);
    res.json({ message: '系统配置已更新' });
  } catch (err) {
    console.error('❌ 更新系统配置失败:', err.message);
    res.status(400).json({ error: { message: err.message || '请求参数错误' } });
  }
});

export default router;
