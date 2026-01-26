import { 
    callAIStream,
    getConversationHistory,
    addMessageToHistory
} from '../../../services/aiService.js';
import { getAgent, getOrCreateMemory, updateMemory, incrementUsageCount } from '../services/agentService.js';
import { 
    getAgentConversationMessages, 
    appendAgentConversationMessages,
    listAgentConversations,
    createAgentConversation,
    getAgentConversationMessagesById,
    appendMessagesByConversationId
} from '../../../services/conversationService.js';

/**
 * 智能体聊天控制器
 */

/**
 * 获取智能体对话历史
 * GET /api/agent/:agentId/history
 */
export async function handleGetAgentChatHistory(req, res) {
    try {
        const { agentId } = req.params;
        const { userId } = req.query; // 用于匿名用户的 history
        
        const dbUserId = req.user ? req.user.userId : null;
        const effectiveUserId = dbUserId || userId;

        if (!effectiveUserId) {
             return res.status(200).json({ message: 'No user identified', history: [] });
        }

        let history = [];
        
        if (dbUserId) {
            // 已登录用户，从数据库获取
            history = await getAgentConversationMessages(dbUserId, agentId);
        } else {
            // 匿名用户，从内存获取
            // 使用 agent_前缀作为 provider key 区分普通对话
            history = getConversationHistory(effectiveUserId, `agent_${agentId}`);
        }
        
        // 过滤掉系统提示词，只返回用户和助手的对话
        const filteredHistory = history.filter(msg => msg.role !== 'system');

        res.status(200).json({
            message: '获取对话历史成功',
            history: filteredHistory
        });
    } catch (error) {
        console.error('❌ 获取对话历史失败:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 处理智能体聊天消息（支持流式响应）
 * POST /api/agent/:agentId/chat
 */
export async function handleAgentChat(req, res) {
    try {
        const { agentId } = req.params;
        const { message, userId } = req.body;
        
        const dbUserId = req.user ? req.user.userId : null;
        const effectiveUserId = dbUserId || userId;

        if (!message || !effectiveUserId) {
            return res.status(400).json({ error: 'Missing message or userId' });
        }
        
        console.log('🤖 智能体对话请求:', { agentId, userId: effectiveUserId, message: message.substring(0, 50) + '...', isAuth: !!dbUserId });
        
        // 获取智能体信息
        const agent = await getAgent(agentId);
        if (!agent) {
            return res.status(404).json({ error: '智能体不存在' });
        }

        let conversationHistory;
        let newMessages = [];
        
        if (dbUserId) {
            // 已登录：从数据库加载历史
            const dbHistory = await getAgentConversationMessages(dbUserId, agentId);
            conversationHistory = [...dbHistory]; // Copy to avoid mutation issues if any
        } else {
            // 未登录：从内存加载历史
            conversationHistory = getConversationHistory(effectiveUserId, `agent_${agentId}`);
        }
        
        // 如果是新对话（没有系统提示词），添加系统提示词
        const hasSystemPrompt = conversationHistory.some(msg => msg.role === 'system');
        if (!hasSystemPrompt) {
            let systemPrompt = `你是 ${agent.name}`;
            
            if (agent.personality) {
                systemPrompt += `\n\n人设：${agent.personality}`;
            }
            
            if (agent.initialMemory) {
                systemPrompt += `\n\n初始记忆：${agent.initialMemory}`;
            }
            
            // 获取用户记忆（如果存在）
            try {
                // 只有登录用户才有持久化记忆？ getOrCreateMemory 需要 userId 吗？
                // 假设 memoryService 也依赖 userId。如果是匿名用户，可能没有记忆或使用临时ID。
                // 暂时尝试获取，失败忽略。
                const memory = await getOrCreateMemory(agentId, effectiveUserId);
                if (memory && memory.content) {
                    systemPrompt += `\n\n与用户的历史记忆：${memory.content}`;
                }
            } catch (error) {
                // console.warn('获取用户记忆失败 (可能是匿名用户):', error.message);
            }
            
            const systemMsg = { role: "system", content: systemPrompt };
            
            if (dbUserId) {
                newMessages.push(systemMsg);
            } else {
                addMessageToHistory(effectiveUserId, systemMsg, `agent_${agentId}`);
            }
            // 确保 memory context 在 conversationHistory 中
            if (!conversationHistory.some(msg => msg.role === 'system')) {
                 conversationHistory.push(systemMsg);
            }
            
            console.log('📝 系统提示词已设置');
        }
        
        // 添加用户消息
        const userMsg = { role: "user", content: message };
        conversationHistory.push(userMsg);
        
        if (dbUserId) {
            newMessages.push(userMsg);
        } else {
            addMessageToHistory(effectiveUserId, userMsg, `agent_${agentId}`);
        }
        
        // 设置流式响应头
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        // 调用 AI 流式响应
        const streamResponse = await callAIStream(conversationHistory, agent.model);
        
        let fullResponse = "";
        
        for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                fullResponse += content;
                res.write(content);
            }
        }
        
        // 添加 AI 回复
        const assistantMsg = { role: "assistant", content: fullResponse };
        
        if (dbUserId) {
            newMessages.push(assistantMsg);
            // 批量保存到数据库
            await appendAgentConversationMessages(dbUserId, agentId, newMessages);
        } else {
            addMessageToHistory(effectiveUserId, assistantMsg, `agent_${agentId}`);
        }
        
        // 更新智能体使用次数
        try {
            await incrementUsageCount(agentId);
        } catch (error) {
            // console.warn('更新使用统计失败:', error.message);
        }
        
        // 更新用户记忆（异步处理，不阻塞响应）
        // 仅对登录用户更新记忆？或者匿名用户也更新（存疑，因为 getOrCreateMemory 可能失败）
        if (dbUserId) {
            updateUserMemory(agentId, dbUserId, message, fullResponse).catch(error => {
                console.warn('更新用户记忆失败:', error.message);
            });
        }
        
        console.log('✅ 智能体对话完成');
        res.end();
    } catch (error) {
        console.error('❌ 智能体对话错误:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.end();
        }
    }
}

/**
 * 更新用户记忆（异步处理）
 */
async function updateUserMemory(agentId, userId, userMessage, aiResponse) {
    try {
        // 获取当前记忆
        const memory = await getOrCreateMemory(agentId, userId);
        
        // 生成新的记忆条目
        const newEntry = `用户: ${userMessage}\n助手: ${aiResponse}\n`;
        
        let updatedContent = memory.content || '';
        updatedContent += newEntry;
        
        // 如果记忆超过 2000 字，进行压缩
        if (updatedContent.length > 2000) {
            updatedContent = await compressMemory(updatedContent);
        }
        
        // 更新记忆
        await updateMemory(agentId, userId, updatedContent);
        
        console.log('📝 用户记忆已更新');
    } catch (error) {
        console.error('❌ 更新用户记忆失败:', error);
        throw error;
    }
}

/**
 * 压缩记忆内容（简化版本）
 */
async function compressMemory(content) {
    try {
        // 简单的压缩策略：保留最近的对话，总结较早的对话
        const lines = content.split('\n').filter(line => line.trim());
        
        if (lines.length <= 20) {
            return content; // 内容不多，不需要压缩
        }
        
        // 保留最近的 10 条对话
        const recentLines = lines.slice(-20);
        const olderLines = lines.slice(0, -20);
        
        // 简单总结：提取关键信息
        const summary = `[历史对话总结: 共${Math.floor(olderLines.length/2)}轮对话]`;
        
        const compressedContent = summary + '\n' + recentLines.join('\n');
        
        console.log('🗜️ 记忆已压缩:', `${content.length} -> ${compressedContent.length} 字符`);
        
        return compressedContent;
    } catch (error) {
        console.error('❌ 记忆压缩失败:', error);
        // 压缩失败时，简单截取最后 1500 字符
        return content.slice(-1500);
    }
}

export default {
    handleAgentChat
};

/**
 * 列出用户与指定智能体的所有会话
 * GET /api/agent/:agentId/conversations
 */
export async function handleListAgentConversations(req, res) {
    try {
        const { agentId } = req.params;
        const dbUserId = req.user?.userId;
        if (!dbUserId) return res.status(401).json({ error: '未授权' });
        const list = await listAgentConversations(dbUserId, agentId);
        res.status(200).json({ conversations: list });
    } catch (error) {
        console.error('❌ 列出智能体会话失败:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 创建新的智能体会话
 * POST /api/agent/:agentId/conversations
 */
export async function handleCreateAgentConversation(req, res) {
    try {
        const { agentId } = req.params;
        const { title } = req.body || {};
        const dbUserId = req.user?.userId;
        if (!dbUserId) return res.status(401).json({ error: '未授权' });
        const conv = await createAgentConversation(dbUserId, agentId, title || '新对话');
        res.status(201).json({ conversation: conv });
    } catch (error) {
        console.error('❌ 创建智能体会话失败:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 获取指定会话的消息
 * GET /api/agent/:agentId/conversations/:conversationId
 */
export async function handleGetAgentConversationMessages(req, res) {
    try {
        const { agentId, conversationId } = req.params;
        const dbUserId = req.user?.userId;
        if (!dbUserId) return res.status(401).json({ error: '未授权' });
        const msgs = await getAgentConversationMessagesById(dbUserId, conversationId);
        if (!msgs) return res.status(404).json({ error: '会话不存在' });
        const filtered = msgs.filter(m => m.role !== 'system');
        res.status(200).json({ messages: filtered });
    } catch (error) {
        console.error('❌ 获取智能体会话消息失败:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * 在指定会话中进行智能体聊天（流式）
 * POST /api/agent/:agentId/conversations/:conversationId/chat
 */
export async function handleAgentChatInConversation(req, res) {
    try {
        const { agentId, conversationId } = req.params;
        const { message } = req.body;
        const dbUserId = req.user?.userId;
        if (!dbUserId) return res.status(401).json({ error: '未授权' });
        if (!message) return res.status(400).json({ error: '缺少消息' });

        const agent = await getAgent(agentId);
        if (!agent) return res.status(404).json({ error: '智能体不存在' });

        const dbHistory = await getAgentConversationMessagesById(dbUserId, conversationId);
        if (dbHistory === null) return res.status(404).json({ error: '会话不存在' });
        const conversationHistory = [...dbHistory];
        const newMessages = [];

        const hasSystemPrompt = conversationHistory.some(msg => msg.role === 'system');
        if (!hasSystemPrompt) {
            let systemPrompt = `你是 ${agent.name}`;
            if (agent.personality) systemPrompt += `\n\n人设：${agent.personality}`;
            if (agent.initialMemory) systemPrompt += `\n\n初始记忆：${agent.initialMemory}`;
            try {
                const memory = await getOrCreateMemory(agentId, dbUserId);
                if (memory && memory.content) {
                    systemPrompt += `\n\n与用户的历史记忆：${memory.content}`;
                }
            } catch {}
            const systemMsg = { role: 'system', content: systemPrompt };
            newMessages.push(systemMsg);
            conversationHistory.push(systemMsg);
        }

        const userMsg = { role: 'user', content: message };
        newMessages.push(userMsg);
        conversationHistory.push(userMsg);

        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const streamResponse = await callAIStream(conversationHistory, agent.model);
        let fullResponse = '';
        for await (const chunk of streamResponse) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                fullResponse += content;
                res.write(content);
            }
        }

        const assistantMsg = { role: 'assistant', content: fullResponse };
        newMessages.push(assistantMsg);
        await appendMessagesByConversationId(conversationId, newMessages);

        try {
            await incrementUsageCount(agentId);
        } catch {}

        updateUserMemory(agentId, dbUserId, message, fullResponse).catch(() => {});
        res.end();
    } catch (error) {
        console.error('❌ 智能体指定会话聊天错误:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.end();
        }
    }
}
