import express from 'express';
import { 
    handleTextToSpeech, 
    handleTextToSpeechStream,
    handleGetVoices 
} from '../controllers/ttsController.js';

const router = express.Router();

// 文字转语音（标准）
router.post('/', handleTextToSpeech);

// 文字转语音（流式）
router.post('/stream', handleTextToSpeechStream);

// 获取支持的语音列表
router.get('/voices', handleGetVoices);

export default router;
