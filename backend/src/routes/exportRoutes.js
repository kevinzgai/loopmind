import express from 'express';
import exportService from '../services/export/exportService.js';
import { authenticateToken as authMiddleware } from '../middleware/auth.middleware.js';
import { error } from '../utils/response.js';

const router = express.Router();
router.use(authMiddleware);

/**
 * 导出单个对话
 * GET /api/export/:conversationId?format=markdown|json|csv|txt
 */
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { format = 'json' } = req.query;
    const userId = req.user.id;

    let result;
    switch (format) {
      case 'markdown':
        result = await exportService.exportToMarkdown(conversationId, userId);
        break;
      case 'csv':
        result = await exportService.exportToCSV(conversationId, userId);
        break;
      case 'txt':
        result = await exportService.exportToTxt(conversationId, userId);
        break;
      case 'json':
      default:
        result = await exportService.exportToJSON(conversationId, userId);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Type', `${result.mimeType}; charset=utf-8`);
    res.send(result.content);
  } catch (err) {
    console.error('❌ 导出对话失败:', err.message);
    return error(res, err.message, -1, 500);
  }
});

/**
 * 批量导出
 * POST /api/export/batch
 */
router.post('/batch', async (req, res) => {
  try {
    const { conversationIds, format = 'json' } = req.body;
    const userId = req.user.id;

    if (!conversationIds?.length) {
      return error(res, '请提供对话 ID 列表', -1, 400);
    }

    const results = await exportService.exportMultiple(conversationIds, userId, format);

    res.json({ success: true, data: results });
  } catch (err) {
    console.error('❌ 批量导出失败:', err.message);
    return error(res, err.message, -1, 500);
  }
});

export default router;
