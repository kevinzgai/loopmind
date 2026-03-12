import {
  callAIStream,
  callAI,
  getAvailableProviders
} from '../services/ai/aiService.js';
import {
  getConversationMessages,
  appendConversationMessages,
  getConversations
} from '../services/database/conversationService.js';
import { DEFAULT_AI_PROVIDER } from '../config/config.js';

/**
 * 聊天控制器
 * 处理 AI 聊天消息、历史记录和提供商列表
 */

/**
 * 处理聊天消息（流式 SSE）
 * POST /api/chat
 */
export async function handleChatMessage(req, res, next) {
  try {
    const { message, provider, systemPrompt, conversationId } = req.body;
    const userId = req.user?.userId || req.body.userId || 'anonymous';
    const aiProvider = provider || DEFAULT_AI_PROVIDER;

    if (!message) {
      return res.status(400).json({
        error: { message: '消息不能为空', code: 'MISSING_MESSAGE' }
      });
    }

    // 获取历史消息
    let history = [];
    try {
      history = await getConversationMessages(userId, aiProvider, conversationId);
    } catch (e) {
      // 数据库不可用时使用空历史
      history = [];
    }

    // 构造消息列表
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push(...history);
    messages.push({ role: 'user', content: message });

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullReply = '';

    try {
      const stream = await callAIStream(messages, aiProvider);

      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content || '';
        if (content) {
          fullReply += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }
    } catch (streamError) {
      res.write(`data: ${JSON.stringify({ error: streamError.message })}\n\n`);
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    // 异步保存消息到数据库（不阻塞响应）
    if (userId !== 'anonymous') {
      const newMessages = [
        { role: 'user', content: message },
        { role: 'assistant', content: fullReply }
      ];
      appendConversationMessages(userId, aiProvider, newMessages, conversationId).catch(
        err => console.error('保存对话消息失败:', err)
      );
    }
  } catch (error) {
    next(error);
  }
}

/**
 * 获取聊天历史
 * GET /api/chat/history
 */
export async function getChatHistory(req, res, next) {
  try {
    const userId = req.user?.userId || req.query.userId || 'anonymous';
    const { provider, conversationId } = req.query;
    const aiProvider = provider || DEFAULT_AI_PROVIDER;

    const messages = await getConversationMessages(userId, aiProvider, conversationId);

    res.status(200).json({ history: messages });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取用户对话列表
 * GET /api/chat/conversations
 */
export async function getUserConversations(req, res, next) {
  try {
    const userId = req.user?.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        error: { message: '需要用户身份', code: 'MISSING_USER' }
      });
    }

    const { provider } = req.query;
    const conversations = await getConversations(userId, provider);

    res.status(200).json({ conversations });
  } catch (error) {
    next(error);
  }
}

/**
 * 获取 AI 提供商列表
 * GET /api/chat/providers
 */
export async function getProviders(req, res, next) {
  try {
    const providers = getAvailableProviders();
    res.status(200).json({ providers });
  } catch (error) {
    next(error);
  }
}

export default {
  handleChatMessage,
  getChatHistory,
  getUserConversations,
  getProviders
};
