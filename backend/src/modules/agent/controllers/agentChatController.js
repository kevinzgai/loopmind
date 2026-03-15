import { 
    getConversationHistory,
    addMessageToHistory
} from '../../../services/ai/aiService.js';
import { getModel } from '../../../services/ai/langchainService.js';
import { createRetriever } from '../../knowledge/services/langchainRetriever.js';
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { getAgent, getOrCreateMemory, updateMemory, incrementUsageCount, updateUserCount } from '../services/agentService.js';
import { 
    getAgentConversationMessages, 
    appendAgentConversationMessages,
    listAgentConversations,
    createAgentConversation,
    getAgentConversationMessagesById,
    appendMessagesByConversationId,
    deleteAgentConversation
} from '../../../services/database/conversationService.js';

/**
 * 智能体聊天控制器
 */

/**
 * 删除指定的智能体会话
 * DELETE /api/agent/:agentId/conversations/:conversationId
 */
import { success, error as errorResp } from '../../../utils/response.js';

export async function handleDeleteAgentConversation(req, res) {
    try {
        const { agentId, conversationId } = req.params;
        const dbUserId = req.user?.userId;
        if (!dbUserId) return errorResp(res, '未授权', -1, 401);

        const ok = await deleteAgentConversation(dbUserId, agentId, conversationId);
        if (!ok) return errorResp(res, '会话不存在或无权删除', -1, 404);
        return success(res, null, '会话已删除');
    } catch (err) {
        console.error('❌ 删除智能体会话失败:', err);
        return errorResp(res, 'Internal server error', -1, 500);
    }
}

/**
 * 获取智能体对话历史
 * GET /api/agent/:agentId/history
 */
export async function handleGetAgentChatHistory(req, res) {
    try {
        const { agentId } = req.params;
        const { userId } = req.query;
        
        const dbUserId = req.user ? req.user.userId : null;
        const effectiveUserId = dbUserId || userId;

        if (!effectiveUserId) {
            return success(res, { history: [] }, 'No user identified');
        }

        let history = [];
        
        if (dbUserId) {
            history = await getAgentConversationMessages(dbUserId, agentId);
        } else {
            history = getConversationHistory(effectiveUserId, `agent_${agentId}`);
        }
        
        const filteredHistory = history.filter(msg => msg.role !== 'system');
        return success(res, { history: filteredHistory }, '获取对话历史成功');
    } catch (err) {
        console.error('❌ 获取对话历史失败:', err);
        return errorResp(res, 'Internal server error', -1, 500);
    }
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
    console.log(`\n--- 🦜 LangChain Agent Pipeline Start ---`);
    console.log(`[1/6] 🤖 智能体信息:`, { name: agent.name, model: agent.model, hasKB: !!agent.knowledgeBaseId });
    
    const model = await getModel(agent.model);
    const kbId = agent.knowledgeBaseId;
    // 支持多知识库 knowledgeBaseIds 数组
    const kbIds = agent.knowledgeBaseIds && agent.knowledgeBaseIds.length > 0
        ? agent.knowledgeBaseIds
        : (kbId ? [kbId] : []);
    
    // 1. 准备检索器 (如果有关联知识库)
    let retriever = null;
    const enableKB = agent.enableKnowledgeBase !== false && kbIds.length > 0;
    if (enableKB && !isGreeting(message)) {
        const id = kbIds[0];
        let idStr;
        if (typeof id === 'string') {
            idStr = id;
        } else if (typeof id === 'object' && id !== null) {
            idStr = (id.id || id._id || id).toString();
        } else {
            idStr = String(id);
        }
        console.log(`[2/6] 🔍 知识库检索准备中, ID: ${idStr}`);
        retriever = createRetriever(idStr);
    } else {
        console.log(`[2/6] ⏭️ 跳过知识库检索 (未关联或为问候语)`);
    }

    // 2. 转换历史记录格式
    console.log(`[3/6] 📜 历史对话加载中, 记录数: ${conversationHistory.length}`);
    const chatHistory = conversationHistory.map(msg => {
        if (msg.role === 'system') return new SystemMessage(msg.content);
        if (msg.role === 'user') return new HumanMessage(msg.content);
        return new AIMessage(msg.content);
    });

    // 3. 构建 Prompt
    console.log(`[4/6] 📝 构建 Prompt Template...`);
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", agent.personality || "你是一个专业的 AI 助手。"],
        new MessagesPlaceholder("chat_history"),
        ["system", "{rag_context}"],
        ["user", "{input}"],
    ]);

    // 4. 构建 Chain
    console.log(`[5/6] ⛓️ 组装 LangChain RunnableSequence...`);
    const chain = RunnableSequence.from([
        {
            input: new RunnablePassthrough(),
            chat_history: () => chatHistory,
            rag_context: async (input) => {
                if (!retriever) return "";
                console.log(`   -> 🔎 正在执行向量检索: "${input.substring(0, 30)}..."`);
                const docs = await retriever.invoke(input);
                if (!docs.length) {
                    console.log(`   -> ⚠️ 检索完成, 未找到相关内容`);
                    return "";
                }
                const context = docs.map(d => d.pageContent).join("\n---\n");
                console.log(`   -> ✅ 检索成功, 找到 ${docs.length} 个相关片段`);
                return `\n\n请参考以下背景知识来回答问题：\n${context}`;
            }
        },
        prompt,
        model,
        new StringOutputParser(),
    ]);

    // 5. 流式输出
    console.log(`[6/6] 🚀 发起模型请求并开始流式响应...`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    if (conversationId) {
        res.setHeader('X-Conversation-Id', conversationId.toString());
    }
    const stream = await chain.stream(message);
    let fullResponse = "";
    
    for await (const chunk of stream) {
        fullResponse += chunk;
        res.write(chunk);
    }
    console.log(`\n--- ✅ LangChain Agent Pipeline End (Response: ${fullResponse.length} chars) ---\n`);

    // 6. 保存结果（含 token 估算）
    const assistantMsg = { role: "assistant", content: fullResponse };
    const userMsg = { role: "user", content: message };

    // 估算 token：中文约 1.5 字/token，英文约 4 字/token
    function estimateTokens(text) {
        if (!text) return 0;
        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const otherChars = text.length - chineseChars;
        return Math.ceil(chineseChars / 1.5 + otherChars / 4);
    }
    const promptTokens = estimateTokens(message);
    const completionTokens = estimateTokens(fullResponse);
    const totalTokens = promptTokens + completionTokens;
    
    if (dbUserId) {
        if (conversationId) {
            await appendMessagesByConversationId(conversationId, [userMsg, assistantMsg], totalTokens, promptTokens, completionTokens);
        } else {
            await appendAgentConversationMessages(dbUserId, agent._id, [userMsg, assistantMsg]);
        }
    } else {
        addMessageToHistory(req.body.userId || 'anonymous', userMsg, `agent_${agent._id}`);
        addMessageToHistory(req.body.userId || 'anonymous', assistantMsg, `agent_${agent._id}`);
    }

    // 更新智能体使用次数和用户数
    try {
        await incrementUsageCount(agent.id || agent._id);
        await updateUserCount(agent.id || agent._id);
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
        let { message, userId, conversationId, previewConfig } = req.body;
        
        const dbUserId = req.user ? req.user.userId : null;
        const effectiveUserId = dbUserId || userId;

        if (!message || !effectiveUserId) {
            return errorResp(res, 'Missing message or userId', -1, 400);
        }
        
        // 获取智能体信息（preview 模式只用 previewConfig）
        let agent;
        if (agentId === 'preview') {
            // 纯预览模式：没有保存到数据库，用 previewConfig 构造虚拟 agent
            if (!previewConfig) {
                return res.status(400).json({ error: '预览模式需要提供 previewConfig' });
            }
            agent = {
                id: 'preview',
                name: '预览智能体',
                model: previewConfig.model || 'deepseek',
                personality: previewConfig.personality || '你是一个专业的 AI 助手。',
                knowledgeBaseId: previewConfig.knowledgeBaseId || null,
                knowledgeBaseIds: previewConfig.knowledgeBaseIds || [],
                enableKnowledgeBase: previewConfig.enableKnowledgeBase || false,
                features: { contentModeration: false },
            };
        } else {
            agent = await getAgent(agentId);
            if (!agent) {
                return errorResp(res, '智能体不存在', -1, 404);
            }
            // 用 previewConfig 覆盖（未保存的最新修改实时生效）
            if (previewConfig) {
                if (previewConfig.personality !== undefined) agent = { ...agent, personality: previewConfig.personality };
                if (previewConfig.model !== undefined) agent = { ...agent, model: previewConfig.model };
                if (previewConfig.knowledgeBaseIds !== undefined) agent = { ...agent, knowledgeBaseIds: previewConfig.knowledgeBaseIds };
                if (previewConfig.knowledgeBaseId !== undefined) agent = { ...agent, knowledgeBaseId: previewConfig.knowledgeBaseId };
                if (previewConfig.enableKnowledgeBase !== undefined) agent = { ...agent, enableKnowledgeBase: previewConfig.enableKnowledgeBase };
            }
        }

        // 内容审查
        if (agent.features?.contentModeration) {
            const { filterContent, hasSensitiveContent } = await import('../services/agentFeaturesService.js');
            if (hasSensitiveContent(message)) {
                console.warn('⚠️ 检测到敏感内容:', message);
                message = filterContent(message);
            }
        }

        console.log('🤖 智能体对话请求:', { agentId, userId: effectiveUserId, conversationId, message: message.substring(0, 50) + '...', isAuth: !!dbUserId, hasPreviewConfig: !!previewConfig });
        
        let conversationHistory;
        if (dbUserId && agentId !== 'preview') {
            // 如果没有 conversationId，自动创建新会话
            if (!conversationId) {
                const newConv = await createAgentConversation(dbUserId, agentId, '新对话');
                conversationId = newConv.id;
                console.log(`📝 自动创建新会话: ${conversationId}`);
            }
            const dbHistory = await getAgentConversationMessagesById(dbUserId, conversationId);
            conversationHistory = dbHistory || [];
        } else {
            // 匿名/预览模式：使用内存临时记忆
            conversationHistory = getConversationHistory(effectiveUserId, `agent_${agentId}`);
        }

        console.log(`🦜 LangChain Flow triggered for model: ${agent.model}`);
        return await handleAgentChatLangChain(req, res, agent, conversationHistory, message, dbUserId && agentId !== 'preview' ? dbUserId : null, conversationId);
    } catch (err) {
        console.error('❌ 智能体对话错误:', err);
        if (!res.headersSent) return errorResp(res, 'Internal server error', -1, 500);
        else res.end();
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
        if (!dbUserId) return errorResp(res, '未授权', -1, 401);
        const list = await listAgentConversations(dbUserId, agentId);
        return success(res, { conversations: list }, '获取会话列表成功');
    } catch (err) {
        console.error('❌ 列出智能体会话失败:', err);
        return errorResp(res, 'Internal server error', -1, 500);
    }
}

export async function handleCreateAgentConversation(req, res) {
    try {
        const { agentId } = req.params;
        const { title } = req.body || {};
        const dbUserId = req.user?.userId;
        if (!dbUserId) return errorResp(res, '未授权', -1, 401);
        const conv = await createAgentConversation(dbUserId, agentId, title || '新对话');
        return success(res, { conversation: conv }, '创建会话成功', 201);
    } catch (err) {
        console.error('❌ 创建智能体会话失败:', err);
        return errorResp(res, 'Internal server error', -1, 500);
    }
}

export async function handleGetAgentConversationMessages(req, res) {
    try {
        const { conversationId } = req.params;
        const dbUserId = req.user?.userId;
        if (!dbUserId) return errorResp(res, '未授权', -1, 401);
        const msgs = await getAgentConversationMessagesById(dbUserId, conversationId);
        if (!msgs) return errorResp(res, '会话不存在', -1, 404);
        const filtered = msgs.filter(m => m.role !== 'system');
        return success(res, { messages: filtered }, '获取消息成功');
    } catch (err) {
        console.error('❌ 获取智能体会话消息失败:', err);
        return errorResp(res, 'Internal server error', -1, 500);
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
        if (!dbUserId) return errorResp(res, '未授权', -1, 401);
        if (!message) return errorResp(res, '缺少消息', -1, 400);

        const agent = await getAgent(agentId);
        if (!agent) return errorResp(res, '智能体不存在', -1, 404);

        const dbHistory = await getAgentConversationMessagesById(dbUserId, conversationId);
        if (dbHistory === null) return errorResp(res, '会话不存在', -1, 404);
        const conversationHistory = [...dbHistory];

        console.log(`🦜 LangChain Flow triggered for model: ${agent.model} (in conversation)`);
        return await handleAgentChatLangChain(req, res, agent, conversationHistory, message, dbUserId, conversationId);
    } catch (err) {
        console.error('❌ 智能体指定会话聊天错误:', err);
        if (!res.headersSent) return errorResp(res, 'Internal server error', -1, 500);
        else res.end();
    }
}
