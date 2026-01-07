import express from 'express';
import { handleVoiceChat, handleVoiceChatStream } from '../controllers/voiceController.js';

const router = express.Router();

// 完整语音对话（返回 JSON）
router.post('/chat', handleVoiceChat);

// 完整语音对话（返回音频流）
router.post('/chat/stream', handleVoiceChatStream);

export default router;
