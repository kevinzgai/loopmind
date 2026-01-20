import express from 'express';
import { handleVoiceChat, handleVoiceChatStream } from '../controllers/voiceController.js';

const router = express.Router();

/**
 * @api {post} /voice/chat 语音对话(JSON)
 * @apiName VoiceChat
 * @apiGroup Voice
 * @apiDescription 发送语音进行对话，返回文本和JSON数据
 *
 * @apiBody {File} audio 语音文件
 *
 * @apiSuccess {Object} response 对话响应数据
 */
router.post('/chat', handleVoiceChat);

/**
 * @api {post} /voice/chat/stream 语音对话(流式)
 * @apiName VoiceChatStream
 * @apiGroup Voice
 * @apiDescription 发送语音进行对话，直接返回合成的语音流
 *
 * @apiBody {File} audio 语音文件
 *
 * @apiSuccess {Stream} stream 语音流数据
 */
router.post('/chat/stream', handleVoiceChatStream);

export default router;
