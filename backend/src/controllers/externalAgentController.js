import { getModel } from '../services/langchainService.js';
import { createRetriever } from '../modules/knowledge/services/langchainRetriever.js';
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { getAgent, incrementUsageCount } from '../modules/agent/services/agentService.js';
import { 
    getAgentConversationMessages, 
    appendAgentConversationMessages 
} from '../services/conversationService.js';

/**
 * 判断是否为问候语（跳过 RAG）
 */
const isGreeting = (text) => {
    const query = text.trim().toLowerCase();
    const greetings = ['你好', '您好', '在吗', 'hello', 'hi', 'hey', '谢谢', '感谢', '再见', 'bye'];
    return query.length < 2 || greetings.some(g => query === g);
};

/**
 * 处理第三方智能体对话请求
 * POST /api/external/agent/:agentId/chat
 */
export async function handleExternalAgentChat(req, res) {
    try {
        const { agentId } = req.params;
        const { message, stream = false } = req.body;
        const dbUserId = req.user.userId;

        if (!message) {
            return res.status(400).json({ error: 'Missing message parameter' });
        }

        // 获取智能体信息
        const agent = await getAgent(agentId);
        if (!agent) {
            return res.status(404).json({ error: '智能体不存在' });
        }

        // 获取历史记录（默认只获取最近的对话）
        const conversationHistory = await getAgentConversationMessages(dbUserId, agentId);
        
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
            await saveChat(dbUserId, agent._id, message, fullResponse);
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
            await saveChat(dbUserId, agent._id, message, response);
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
async function saveChat(userId, agentId, userMessage, aiResponse) {
    const assistantMsg = { role: "assistant", content: aiResponse };
    const userMsg = { role: "user", content: userMessage };
    
    try {
        await appendAgentConversationMessages(userId, agentId, [userMsg, assistantMsg]);
        await incrementUsageCount(agentId);
    } catch (error) {
        console.error('❌ 保存外部对话记录失败:', error);
    }
}
