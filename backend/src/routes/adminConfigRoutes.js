import express from 'express';
import { authenticateToken } from '../shared/middleware/authMiddleware.js';
import { authorizeAdmin } from '../shared/middleware/authMiddleware.js';
import { getConfigUnmasked, updateConfig } from '../services/configService.js';

const router = express.Router();

/**
 * @api {get} /admin/config 获取系统配置
 * @apiName GetSystemConfig
 * @apiGroup Admin
 * @apiDescription 获取系统全局配置（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {String} message 成功消息
 * @apiSuccess {Object} config 系统配置对象
 * @apiSuccess {Object} config.provider 默认 AI 提供商
 * @apiSuccess {Object} config.deepseek DeepSeek 配置
 * @apiSuccess {Object} config.qwen 通义千问配置
 * @apiSuccess {Object} config.doubao 火山引擎配置
 * @apiSuccess {Object} config.glm 智谱GLM配置
 * @apiSuccess {Object} config.moonshot Moonshot配置
 * @apiSuccess {Object} config.modelscope ModelScope (魔搭) 配置
 * @apiSuccess {Object} config.minimax MiniMax配置
 * @apiSuccess {Object} config.seedAsr SeedASR 语音配置
 */
router.get('/config', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const cfg = await getConfigUnmasked();
    res.json({ message: '获取系统配置成功', config: cfg });
  } catch (err) {
    console.error('❌ 获取系统配置失败:', err.message);
    res.status(500).json({ error: { message: '服务器错误' } });
  }
});

/**
 * @api {put} /admin/config 更新系统配置
 * @apiName UpdateSystemConfig
 * @apiGroup Admin
 * @apiDescription 更新系统全局配置（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiBody {String} [provider] 默认 AI 提供商
 * @apiBody {Object} [deepseek] DeepSeek 配置
 * @apiBody {Object} [qwen] 通义千问配置
 * @apiBody {Object} [doubao] 火山引擎配置
 * @apiBody {Object} [glm] 智谱GLM配置
 * @apiBody {Object} [moonshot] Moonshot配置
 * @apiBody {Object} [modelscope] ModelScope (魔搭) 配置
 * @apiBody {Object} [minimax] MiniMax配置
 * @apiBody {Object} [seedAsr] SeedASR 语音配置
 *
 * @apiSuccess {String} message 成功消息
 */
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
