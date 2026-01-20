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
/**
 * @api {post} /asr 语音识别
 * @apiName RecognizeAudio
 * @apiGroup ASR
 * @apiDescription 将上传的音频文件转换为文本
 *
 * @apiBody {File} audio 音频文件
 *
 * @apiSuccess {String} text 识别出的文本
 */
router.post('/', upload.single('audio'), handleRecognition);

// 健康检查
/**
 * @api {get} /asr/health ASR服务健康检查
 * @apiName ASRHealth
 * @apiGroup ASR
 * @apiDescription 检查 ASR 服务是否正常运行
 *
 * @apiSuccess {String} status 服务状态
 */
router.get('/health', healthCheck);

export default router;
