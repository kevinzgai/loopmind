import { 
    callAIStream,
    getConversationHistory,
    addMessageToHistory
} from '../../../services/aiService.js';
import { getModel } from '../../../services/langchainService.js';
import { createRetriever } from '../../knowledge/services/langchainRetriever.js';
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { getAgent, getOrCreateMemory, updateMemory, incrementUsageCount } from '../services/agentService.js';
import { searchKnowledge } from '../../knowledge/services/knowledgeService.js';
import { generateEmbedding } from '../../knowledge/services/embeddingService.js';
import { 
    getAgentConversationMessages, 
    appendAgentConversationMessages,
    listAgentConversations,
    createAgentConversation,
    getAgentConversationMessagesById,
    appendMessagesByConversationId,
    deleteAgentConversation
} from '../../../services/conversationService.js';

/**
 * 智能体聊天控制器
 */

/**
 * 删除指定的智能体会话
 * DELETE /api/agent/:agentId/conversations/:conversationId
 */
export async function handleDeleteAgentConversation(req, res) {
    try {
        const { agentId, conversationId } = req.params;
        const dbUserId = req.user?.userId;
        if (!dbUserId) return res.status(401).json({ error: '未授权' });

        const success = await deleteAgentConversation(dbUserId, agentId, conversationId);
        if (!success) {
            return res.status(404).json({ error: '会话不存在或无权删除' });
        }
        res.status(200).json({ message: '会话已删除' });
    } catch (error) {
        console.error('❌ 删除智能体会话失败:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

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
 * 获取 RAG 上下文
 */
async function getRAGContext(agent, userMessage) {
    if (agent.knowledgeBaseId && userMessage) {
        try {
            // 检查是否需要调用知识库（简单的启发式方法：消息长度或关键词）
            // 以后可以升级为 AI 意图识别，但目前先做一个基础过滤
            const query = userMessage.trim();
            
            // 如果消息太短（例如：你好、哈哈、OK），不触发知识库检索
            if (query.length < 2) return '';
            
            // 排除一些过于通用的闲聊词
            const generalChatWords = ['你好', '您好', '在吗', 'hello', 'hi', 'hey', '谢谢', '感谢', '再见', 'bye'];
            if (generalChatWords.some(word => query.toLowerCase() === word)) {
                return '';
            }

            // 提取知识库 ID（处理 populate 后的对象情况）
            const kbId = (typeof agent.knowledgeBaseId === 'object' && agent.knowledgeBaseId !== null) 
                ? (agent.knowledgeBaseId.id || agent.knowledgeBaseId._id) 
                : agent.knowledgeBaseId;

            console.log('🔍 正在检索知识库:', kbId);
            const queryVector = await generateEmbedding(userMessage);
            const chunks = await searchKnowledge(kbId, queryVector, 3);
            
            if (chunks && chunks.length > 0) {
                const context = chunks.map(c => c.content).join('\n---\n');
                console.log('✅ 知识库检索完成，注入上下文');
                return `\n\n请参考以下背景知识来回答用户的问题。如果背景知识中没有相关信息，请诚实告知用户，不要编造。\n\n背景知识：\n${context}`;
            }
        } catch (error) {
            console.warn('⚠️ 知识库检索失败:', error.message);
        }
    }
    return '';
}

/**
 * 生成基础系统提示词（人设 + 记忆，不含 RAG）
 */
async function getBaseSystemPrompt(agent, userId) {
    let systemPrompt = `你是 ${agent.name}`;
    
    if (agent.personality) {
        systemPrompt += `\n\n人设：${agent.personality}`;
    }
    
    if (agent.initialMemory) {
        systemPrompt += `\n\n初始记忆：${agent.initialMemory}`;
    }

    // 获取用户历史记忆
    try {
        const memory = await getOrCreateMemory(agent.id, userId);
        if (memory && memory.content) {
            systemPrompt += `\n\n与用户的历史记忆：${memory.content}`;
        }
    } catch (error) {}

    return systemPrompt;
}

/**
 * 判断是否为问候语（跳过 RAG）
 */
const isGreeting = (text) => {
    const query = text.trim().toLowerCase();
    const greetings = ['你好', '您好', '在吗', 'hello', 'hi', 'hey', '谢谢', '感谢', '再见', 'bye'];
    return query.length < 2 || greetings.some(g => query === g);
};

/**
 * 使用 LangChain 处理智能体对话
 */
async function handleAgentChatLangChain(req, res, agent, conversationHistory, message, dbUserId, conversationId) {
    const model = await getModel(agent.model);
    const kbId = agent.knowledgeBaseId;
    
    // 1. 准备检索器 (如果有关联知识库)
    let retriever = null;
    if (kbId && !isGreeting(message)) {
        const id = (typeof kbId === 'object') ? (kbId.id || kbId._id) : kbId;
        retriever = createRetriever(id.toString());
    }

    // 2. 转换历史记录格式
    const chatHistory = conversationHistory.map(msg => {
        if (msg.role === 'system') return new SystemMessage(msg.content);
        if (msg.role === 'user') return new HumanMessage(msg.content);
        return new AIMessage(msg.content);
    });

    // 3. 构建 Prompt
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", agent.personality || "你是一个专业的 AI 助手。"],
        new MessagesPlaceholder("chat_history"),
        ["system", "{rag_context}"],
        ["user", "{input}"],
    ]);

    // 4. 构建 Chain
    const chain = RunnableSequence.from([
        {
            input: new RunnablePassthrough(),
            chat_history: () => chatHistory,
            rag_context: async (input) => {
                if (!retriever) return "";
                const docs = await retriever.getRelevantDocuments(input);
                if (!docs.length) return "";
                const context = docs.map(d => d.pageContent).join("\n---\n");
                return `\n\n请参考以下背景知识来回答问题：\n${context}`;
            }
        },
        prompt,
        model,
        new StringOutputParser(),
    ]);

    // 5. 流式输出
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    const stream = await chain.stream(message);
    let fullResponse = "";
    
    for await (const chunk of stream) {
        fullResponse += chunk;
        res.write(chunk);
    }

    // 6. 保存结果
    const assistantMsg = { role: "assistant", content: fullResponse };
    const userMsg = { role: "user", content: message };
    
    if (dbUserId) {
        if (conversationId) {
            await appendMessagesByConversationId(conversationId, [userMsg, assistantMsg]);
        } else {
            await appendAgentConversationMessages(dbUserId, agent._id, [userMsg, assistantMsg]);
        }
    } else {
        addMessageToHistory(req.body.userId || 'anonymous', userMsg, `agent_${agent._id}`);
        addMessageToHistory(req.body.userId || 'anonymous', assistantMsg, `agent_${agent._id}`);
    }

    // 更新智能体使用次数
    try {
        await incrementUsageCount(agent._id);
    } catch (error) {}

    res.end();
    return fullResponse;
}

/**
 * 处理智能体聊天消息（支持流式响应）
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
        if (dbUserId) {
            // 已登录：从数据库加载历史
            const dbHistory = await getAgentConversationMessages(dbUserId, agentId);
            conversationHistory = [...dbHistory];
        } else {
            // 未登录：从内存加载历史
            conversationHistory = getConversationHistory(effectiveUserId, `agent_${agentId}`);
        }

        // 全部切换到 LangChain 处理
        console.log(`🦜 LangChain Flow triggered for model: ${agent.model}`);
        return await handleAgentChatLangChain(req, res, agent, conversationHistory, message, dbUserId, null);
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

        // 全部切换到 LangChain 处理
        console.log(`🦜 LangChain Flow triggered for model: ${agent.model} (in conversation)`);
        return await handleAgentChatLangChain(req, res, agent, conversationHistory, message, dbUserId, conversationId);
    } catch (error) {
        console.error('❌ 智能体指定会话聊天错误:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.end();
        }
    }
}
