import { 
    getConversationHistory, 
    addMessageToHistory, 
    callAIStream
} from '../../../services/aiService.js';
import { getAgent, getOrCreateMemory, updateMemory, incrementUsageCount } from '../services/agentService.js';

/**
 * 智能体聊天控制器
 */

/**
 * 处理智能体聊天消息（支持流式响应）
 * POST /api/agent/:agentId/chat
 */
export async function handleAgentChat(req, res) {
    try {
        const { agentId } = req.params;
        const { message, userId } = req.body;
        
        if (!message || !userId) {
            return res.status(400).json({ error: 'Missing message or userId' });
        }
        
        console.log('🤖 智能体对话请求:', { agentId, userId, message: message.substring(0, 50) + '...' });
        
        // 获取智能体信息
        const agent = await getAgent(agentId);
        if (!agent) {
            return res.status(404).json({ error: '智能体不存在' });
        }

        // 构建对话 ID（智能体 + 用户）
        const conversationId = `agent_${agentId}_${userId}`;
        
        // 获取对话历史
        const conversationHistory = getConversationHistory(conversationId, agent.model);
        
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
                const memory = await getOrCreateMemory(agentId, userId);
                if (memory && memory.content) {
                    systemPrompt += `\n\n与用户的历史记忆：${memory.content}`;
                }
            } catch (error) {
                console.warn('获取用户记忆失败:', error.message);
            }
            
            addMessageToHistory(conversationId, { role: "system", content: systemPrompt }, agent.model);
            console.log('📝 系统提示词已设置:', systemPrompt.substring(0, 100) + '...');
        }
        
        // 添加用户消息到历史
        addMessageToHistory(conversationId, { role: "user", content: message }, agent.model);
        
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
        
        // 添加 AI 回复到历史
        addMessageToHistory(conversationId, { role: "assistant", content: fullResponse }, agent.model);
        
        // 更新智能体使用次数
        try {
            await incrementUsageCount(agentId);
        } catch (error) {
            console.warn('更新使用统计失败:', error.message);
        }
        
        // 更新用户记忆（异步处理，不阻塞响应）
        updateUserMemory(agentId, userId, message, fullResponse).catch(error => {
            console.warn('更新用户记忆失败:', error.message);
        });
        
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