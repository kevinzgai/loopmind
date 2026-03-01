import { getModel } from '../services/ai/langchainService.js';
import { createRetriever } from '../modules/knowledge/services/langchainRetriever.js';
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { 
    getAgent, 
    incrementUsageCount, 
    getPublishedAgents,
    getUserAgents 
} from '../modules/agent/services/agentService.js';
import { 
    getAgentConversationMessages, 
    appendAgentConversationMessages,
    createAgentConversation,
    listAgentConversations,
    getAgentConversationMessagesById,
    appendMessagesByConversationId,
    deleteAgentConversation
} from '../services/database/conversationService.js';

/**
 * @api {get} /external/agents 获取公开智能体列表
 * @apiName GetPublicAgents
 * @apiGroup ExternalAgent
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} X-API-Key API 访问密钥
 * 
 * @apiParam {Number} [page=1] 页码
 * @apiParam {Number} [limit=20] 每页数量
 * @apiParam {String} [category] 分类过滤
 * @apiParam {String} [search] 搜索关键词
 * 
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {Object[]} agents 智能体列表
 * @apiSuccess {String} agents._id 智能体ID
 * @apiSuccess {String} agents.name 智能体名称
 * @apiSuccess {String} agents.description 智能体描述
 * @apiSuccess {String} agents.avatar 智能体头像
 * @apiSuccess {Number} total 总数
 * @apiSuccess {Number} page 当前页码
 * @apiSuccess {Number} totalPages 总页数
 */
export async function handleGetPublicAgents(req, res) {
    try {
        const { page = 1, limit = 20, category, search } = req.query;
        
        const result = await getPublishedAgents({
            page: parseInt(page),
            limit: parseInt(limit),
            category,
            search
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('❌ 获取外部公开智能体失败:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}

/**
 * @api {get} /external/agents/my 获取我的智能体列表
 * @apiName GetMyAgents
 * @apiGroup ExternalAgent
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} X-API-Key API 访问密钥
 * 
 * @apiParam {Number} [page=1] 页码
 * @apiParam {Number} [limit=20] 每页数量
 * 
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {Object[]} agents 智能体列表
 * @apiSuccess {String} agents._id 智能体ID
 * @apiSuccess {String} agents.name 智能体名称
 * @apiSuccess {String} agents.description 智能体描述
 * @apiSuccess {String} agents.avatar 智能体头像
 * @apiSuccess {Number} total 总数
 * @apiSuccess {Number} page 当前页码
 * @apiSuccess {Number} totalPages 总页数
 */
export async function handleGetMyAgents(req, res) {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 20 } = req.query;
        
        const result = await getUserAgents(userId, {
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('❌ 获取我的智能体失败:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}

/**
 * @api {get} /external/agent/:agentId 获取智能体详情
 * @apiName GetAgentDetails
 * @apiGroup ExternalAgent
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} X-API-Key API 访问密钥
 * 
 * @apiParam {String} agentId 智能体ID
 * 
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {Object} agent 智能体详情
 * @apiSuccess {String} agent._id 智能体ID
 * @apiSuccess {String} agent.name 智能体名称
 * @apiSuccess {String} agent.description 智能体描述
 * @apiSuccess {String} agent.avatar 智能体头像
 * @apiSuccess {String} agent.model 使用的模型
 * @apiSuccess {String} agent.personality 个性化设定
 */
export async function handleGetAgentDetails(req, res) {
    try {
        const { agentId } = req.params;
        const agent = await getAgent(agentId);
        
        res.json({
            success: true,
            agent
        });
    } catch (error) {
        console.error('❌ 获取智能体详情失败:', error);
        if (error.message === '智能体不存在') {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}

/**
 * @api {post} /external/agent/:agentId/conversations 创建会话
 * @apiName CreateConversation
 * @apiGroup ExternalAgent
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} X-API-Key API 访问密钥
 * 
 * @apiParam {String} agentId 智能体ID
 * @apiBody {String} [title] 会话标题
 * 
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {Object} conversation 创建的会话对象
 * @apiSuccess {String} conversation._id 会话ID
 * @apiSuccess {String} conversation.title 会话标题
 */
export async function handleCreateConversation(req, res) {
    try {
        const { agentId } = req.params;
        const userId = req.user.userId;
        const { title } = req.body;

        const conversation = await createAgentConversation(userId, agentId, title);

        res.json({
            success: true,
            conversation
        });
    } catch (error) {
        console.error('❌ 创建会话失败:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}

/**
 * @api {get} /external/agent/:agentId/conversations 获取会话列表
 * @apiName GetConversations
 * @apiGroup ExternalAgent
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} X-API-Key API 访问密钥
 * 
 * @apiParam {String} agentId 智能体ID
 * 
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {Object[]} conversations 会话列表
 * @apiSuccess {String} conversations._id 会话ID
 * @apiSuccess {String} conversations.title 会话标题
 * @apiSuccess {String} conversations.lastMessage 最后一条消息摘要
 * @apiSuccess {Date} conversations.updatedAt 更新时间
 */
export async function handleGetConversations(req, res) {
    try {
        const { agentId } = req.params;
        const userId = req.user.userId;

        const conversations = await listAgentConversations(userId, agentId);

        res.json({
            success: true,
            conversations
        });
    } catch (error) {
        console.error('❌ 获取会话列表失败:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}

/**
 * @api {get} /external/agent/:agentId/conversations/:conversationId/messages 获取会话消息
 * @apiName GetConversationMessages
 * @apiGroup ExternalAgent
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} X-API-Key API 访问密钥
 * 
 * @apiParam {String} agentId 智能体ID
 * @apiParam {String} conversationId 会话ID
 * 
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {Object[]} messages 消息列表
 * @apiSuccess {String} messages.role 角色 (user/assistant)
 * @apiSuccess {String} messages.content 消息内容
 * @apiSuccess {Date} messages.createdAt 创建时间
 */
export async function handleGetConversationMessages(req, res) {
    try {
        const { conversationId } = req.params;
        const userId = req.user.userId;

        const messages = await getAgentConversationMessagesById(userId, conversationId);
        
        if (!messages) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('❌ 获取会话消息失败:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
}

/**
 * @api {delete} /external/agent/:agentId/conversations/:conversationId 删除会话
 * @apiName DeleteConversation
 * @apiGroup ExternalAgent
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} X-API-Key API 访问密钥
 * 
 * @apiParam {String} agentId 智能体ID
 * @apiParam {String} conversationId 会话ID
 * 
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {String} message 成功消息
 */
export async function handleDeleteConversation(req, res) {
    try {
        const { agentId, conversationId } = req.params;
        const userId = req.user.userId;

        const success = await deleteAgentConversation(userId, agentId, conversationId);

        if (!success) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json({
            success: true,
            message: 'Conversation deleted'
        });
    } catch (error) {
        console.error('❌ 删除会话失败:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
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
 * @api {post} /external/agent/:agentId/chat 智能体对话
 * @apiName ExternalAgentChat
 * @apiGroup ExternalAgent
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} X-API-Key API 访问密钥
 * 
 * @apiParam {String} agentId 智能体ID
 * @apiBody {String} message 用户发送的消息
 * @apiBody {Boolean} [stream=false] 是否启用流式响应
 * @apiBody {String} [conversationId] 会话ID (可选，指定会话上下文)
 * 
 * @apiSuccess {String} content 智能体回复内容 (非流式模式)
 * @apiSuccess {Object} agent 智能体基本信息
 */
export async function handleExternalAgentChat(req, res) {
    try {
        const { agentId } = req.params;
        const { message, stream = false, conversationId } = req.body;
        const dbUserId = req.user.userId;

        if (!message) {
            return res.status(400).json({ error: 'Missing message parameter' });
        }

        // 获取智能体信息
        const agent = await getAgent(agentId);
        if (!agent) {
            return res.status(404).json({ error: '智能体不存在' });
        }

        // 获取历史记录
        let conversationHistory = [];
        if (conversationId) {
            conversationHistory = await getAgentConversationMessagesById(dbUserId, conversationId);
            if (!conversationHistory) {
                return res.status(404).json({ error: '会话不存在或无权访问' });
            }
        } else {
            // 兼容旧逻辑（默认会话）
            conversationHistory = await getAgentConversationMessages(dbUserId, agentId);
        }
        
        const model = await getModel(agent.model);
        const kbId = agent.knowledgeBaseId;
        
        // 1. 准备检索器
        let retriever = null;
        if (kbId && !isGreeting(message)) {
            const id = (typeof kbId === 'object') ? (kbId.id || kbId._id) : kbId;
            retriever = createRetriever(id.toString());
        }

        // 2. 转换历史记录
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
                    const docs = await retriever.invoke(input);
                    if (!docs.length) return "";
                    const context = docs.map(d => d.pageContent).join("\n---\n");
                    return `\n\n请参考以下背景知识来回答问题：\n${context}`;
                }
            },
            prompt,
            model,
            new StringOutputParser(),
        ]);

        if (stream) {
            // 流式输出
            res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const resultStream = await chain.stream(message);
            let fullResponse = "";
            
            for await (const chunk of resultStream) {
                fullResponse += chunk;
                res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            }
            
            res.write(`data: [DONE]\n\n`);
            res.end();

            // 保存对话
            await saveChat(dbUserId, agent._id, message, fullResponse, conversationId);
        } else {
            // 非流式输出
            const response = await chain.invoke(message);
            
            res.status(200).json({
                content: response,
                agent: {
                    id: agent._id,
                    name: agent.name
                }
            });

            // 保存对话
            await saveChat(dbUserId, agent._id, message, response, conversationId);
        }

    } catch (error) {
        console.error('❌ 第三方智能体对话错误:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error', message: error.message });
        } else {
            res.end();
        }
    }
}

/**
 * 保存对话记录
 */
async function saveChat(userId, agentId, userMessage, aiResponse, conversationId) {
    const assistantMsg = { role: "assistant", content: aiResponse };
    const userMsg = { role: "user", content: userMessage };
    
    try {
        if (conversationId) {
            await appendMessagesByConversationId(conversationId, [userMsg, assistantMsg]);
        } else {
            await appendAgentConversationMessages(userId, agentId, [userMsg, assistantMsg]);
        }
        await incrementUsageCount(agentId);
    } catch (error) {
        console.error('❌ 保存外部对话记录失败:', error);
    }
}
