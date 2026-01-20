import express from 'express';
import { 
    handleTextToSpeech, 
    handleTextToSpeechStream,
    handleGetVoices 
} from '../controllers/ttsController.js';

const router = express.Router();

/**
 * @api {post} /tts 文字转语音(标准)
 * @apiName TextToSpeech
 * @apiGroup TTS
 * @apiDescription 将文本转换为语音（返回音频文件）
 *
 * @apiBody {String} text 要转换的文本
 * @apiBody {String} [voice] 音色 (默认 xiaoxian)
 * @apiBody {Number} [speed] 语速
 *
 * @apiSuccess {File} audio 音频文件数据
 */
router.post('/', handleTextToSpeech);

/**
 * @api {post} /tts/stream 文字转语音(流式)
 * @apiName TextToSpeechStream
 * @apiGroup TTS
 * @apiDescription 将文本转换为语音（返回音频流）
 *
 * @apiBody {String} text 要转换的文本
 * @apiBody {String} [voice] 音色
 * @apiBody {Number} [speed] 语速
 *
 * @apiSuccess {Stream} stream 音频流数据
 */
router.post('/stream', handleTextToSpeechStream);

/**
 * @api {get} /tts/voices 获取语音列表
 * @apiName GetVoices
 * @apiGroup TTS
 * @apiDescription 获取系统支持的所有音色列表
 *
 * @apiSuccess {Array} voices 音色列表
 */
router.get('/voices', handleGetVoices);

export default router;
