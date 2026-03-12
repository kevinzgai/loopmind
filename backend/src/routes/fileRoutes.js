import express from 'express';
import { authenticateToken as authMiddleware } from '../middleware/auth.middleware.js';
import fileProcessingService, { fileUpload } from '../services/multimodal/fileProcessingService.js';
import { success, error } from '../utils/response.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * 上传并解析文件（CSV、JSON、TXT）
 * POST /api/files/parse
 */
router.post('/parse', fileUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return error(res, '请上传文件', -1, 400);
    }

    const result = await fileProcessingService.parseFile(req.file.path);

    // 解析完成后清理临时文件
    await fileProcessingService.cleanupFile(req.file.path);

    return success(res, {
      filename: req.file.originalname,
      size: req.file.size,
      ...result,
    }, '文件解析成功');
  } catch (err) {
    console.error('❌ 文件解析失败:', err.message);
    // 清理失败的文件
    if (req.file?.path) await fileProcessingService.cleanupFile(req.file.path);
    return error(res, err.message, -1, 500);
  }
});

/**
 * 上传文件获取 AI 分析
 * POST /api/files/analyze
 */
router.post('/analyze', fileUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return error(res, '请上传文件', -1, 400);
    }

    const { question = '请分析这份数据的主要特征和规律' } = req.body;
    const parsed = await fileProcessingService.parseFile(req.file.path);

    // 清理临时文件
    await fileProcessingService.cleanupFile(req.file.path);

    // 返回解析结果和建议的分析提示词
    return success(res, {
      filename: req.file.originalname,
      parsedData: parsed,
      suggestedPrompt: `${question}\n\n数据概览:\n${parsed.text?.slice(0, 1000)}`,
    }, '文件分析准备完成');
  } catch (err) {
    console.error('❌ 文件分析失败:', err.message);
    if (req.file?.path) await fileProcessingService.cleanupFile(req.file.path);
    return error(res, err.message, -1, 500);
  }
});

export default router;
