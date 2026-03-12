import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken as authMiddleware } from '../middleware/auth.middleware.js';
import multimodalService, { imageUpload } from '../services/multimodal/multimodalService.js';
import { success, error } from '../utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
router.use(authMiddleware);

/**
 * 上传图片
 * POST /api/multimodal/upload
 */
router.post('/upload', imageUpload.array('images', 5), async (req, res) => {
  try {
    if (!req.files?.length) {
      return error(res, '请上传至少一张图片', -1, 400);
    }

    const images = req.files.map((f) => ({
      filename: f.filename,
      originalname: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
      url: `/uploads/images/${f.filename}`,
    }));

    return success(res, { images }, '图片上传成功');
  } catch (err) {
    console.error('❌ 图片上传失败:', err.message);
    return error(res, err.message, -1, 500);
  }
});

/**
 * 获取图片 base64（供前端预览）
 * GET /api/multimodal/image/:filename/base64
 */
router.get('/image/:filename/base64', async (req, res) => {
  try {
    const filePath = path.join(__dirname, '../../../uploads/images', req.params.filename);
    const base64 = await multimodalService.imageToBase64(filePath);
    const mimeType = multimodalService.getMimeType(filePath);

    return success(res, {
      base64,
      mimeType,
      dataUrl: `data:${mimeType};base64,${base64}`,
    });
  } catch (err) {
    console.error('❌ 获取图片 base64 失败:', err.message);
    return error(res, err.message, -1, 500);
  }
});

export default router;
