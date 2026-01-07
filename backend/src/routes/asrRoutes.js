import express from 'express';
import multer from 'multer';
import { handleRecognition, healthCheck } from '../controllers/asrController.js';

const router = express.Router();

// 配置 multer 用于处理文件上传
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
});

// 语音识别接口
router.post('/', upload.single('audio'), handleRecognition);

// 健康检查
router.get('/health', healthCheck);

export default router;
