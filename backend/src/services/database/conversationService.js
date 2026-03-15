import Conversation from "../../models/ConversationSchema.js";

export async function createConversation(userId, provider) {
    const conversation = new Conversation({
        userId,
        provider,
        title: "新对话",
        messages: [],
        messageCount: 0,
    });
    await conversation.save();
    return conversation;
}

export async function getConversations(userId, provider) {
    const query = { userId };
    if (provider) {
        query.provider = provider;
    }
    // 排除 Agent 聊天记录 (如果有 agentId 则是 agent 聊天)
    query.agentId = { $exists: false };
    
    return Conversation.find(query)
        .sort({ updatedAt: -1 })
        .select('_id title messageCount updatedAt createdAt provider');
}

export async function appendConversationMessages(userId, provider, messages, conversationId) {
    if (!messages || messages.length === 0) {
        return null;
    }

    let conversation;
    if (conversationId) {
        conversation = await Conversation.findOne({ _id: conversationId, userId });
    } else {
        // 兼容旧逻辑：如果没有 ID，查找最近的一个或者创建一个
        conversation = await Conversation.findOne({ userId, provider }).sort({ updatedAt: -1 });
    }

    if (!conversation) {
        conversation = await createConversation(userId, provider);
    }

    // 自动更新标题：如果是新对话的第一条用户消息
    if (conversation.messages.length === 0 && messages.some(m => m.role === 'user')) {
        const firstUserMsg = messages.find(m => m.role === 'user');
        if (firstUserMsg && firstUserMsg.content) {
             let newTitle = firstUserMsg.content.substring(0, 20);
             if (firstUserMsg.content.length > 20) newTitle += '...';
             conversation.title = newTitle;
        }
    }

    conversation.messages.push(...messages);
    conversation.messageCount = conversation.messages.length;
    conversation.updatedAt = new Date();
    await conversation.save();
    return conversation;
}

export async function getConversationMessages(userId, provider, conversationId) {
    let conversation;
    
    if (conversationId) {
        conversation = await Conversation.findOne({ _id: conversationId, userId });
    } else {
        // 兼容旧逻辑：获取最近的一个
        conversation = await Conversation.findOne({ userId, provider }).sort({ updatedAt: -1 });
    }

    if (!conversation) {
        return [];
    }
    return conversation.messages.map((message) => ({
        role: message.role,
        content: message.content,
    }));
}

// Agent conversation functions

export async function getOrCreateAgentConversation(userId, agentId) {
    let conversation = await Conversation.findOne({ userId, agentId });
    if (!conversation) {
        conversation = new Conversation({
            userId,
            agentId,
            title: "Agent Chat",
            messages: [],
            messageCount: 0,
        });
    }
    return conversation;
}

export async function appendAgentConversationMessages(userId, agentId, messages) {
    if (!messages || messages.length === 0) {
        return null;
    }

    const conversation = await getOrCreateAgentConversation(userId, agentId);
    conversation.messages.push(...messages);
    conversation.messageCount = conversation.messages.length;
    conversation.updatedAt = new Date();
    await conversation.save();
    return conversation;
}

export async function getAgentConversationMessages(userId, agentId) {
    const conversation = await Conversation.findOne({ userId, agentId });
    if (!conversation) {
        return [];
    }
    return conversation.messages.map((message) => ({
        role: message.role,
        content: message.content,
    }));
}

// Multiple conversations for agent
export async function listAgentConversations(userId, agentId) {
    const conversations = await Conversation.find({ userId, agentId })
        .sort({ updatedAt: -1 })
        .select(['_id', 'title', 'messageCount', 'updatedAt', 'createdAt']);
    return conversations.map(c => ({
        id: c._id.toString(),
        title: c.title,
        messageCount: c.messageCount,
        updatedAt: c.updatedAt,
        createdAt: c.createdAt,
    }));
}

export async function createAgentConversation(userId, agentId, title = "新对话") {
    const conversation = new Conversation({
        userId,
        agentId,
        title,
        messages: [],
        messageCount: 0,
    });
    await conversation.save();
    return {
        id: conversation._id.toString(),
        title: conversation.title,
        messageCount: conversation.messageCount,
        updatedAt: conversation.updatedAt,
        createdAt: conversation.createdAt,
    };
}

export async function getAgentConversationMessagesById(userId, conversationId) {
    const conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
        return null;
    }
    return conversation.messages.map(m => ({ role: m.role, content: m.content }));
}

export async function appendMessagesByConversationId(conversationId, messages, totalTokens = 0, promptTokens = 0, completionTokens = 0) {
    if (!messages || messages.length === 0) return null;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return null;

    if (conversation.messageCount === 0 && conversation.title === '新对话') {
        const firstUserMsg = messages.find(m => m.role === 'user');
        if (firstUserMsg && firstUserMsg.content) {
            let newTitle = firstUserMsg.content.substring(0, 20);
            if (firstUserMsg.content.length > 20) newTitle += '...';
            conversation.title = newTitle;
        }
    }

    conversation.messages.push(...messages);
    conversation.messageCount = conversation.messages.length;
    conversation.updatedAt = new Date();
    // 累加 token 消耗
    if (totalTokens > 0) {
        if (!conversation.tokenUsage) {
            conversation.tokenUsage = { prompt: 0, completion: 0, total: 0 };
        }
        conversation.tokenUsage.prompt = (conversation.tokenUsage.prompt || 0) + promptTokens;
        conversation.tokenUsage.completion = (conversation.tokenUsage.completion || 0) + completionTokens;
        conversation.tokenUsage.total = (conversation.tokenUsage.total || 0) + totalTokens;
        conversation.markModified('tokenUsage');
    }
    await conversation.save();
    return conversation;
}

export async function deleteAgentConversation(userId, agentId, conversationId) {
    const result = await Conversation.deleteOne({ _id: conversationId, userId, agentId });
    return result.deletedCount > 0;
}

export default {
    createConversation,
    getConversations,
    appendConversationMessages,
    getConversationMessages,
    getOrCreateAgentConversation,
    appendAgentConversationMessages,
    getAgentConversationMessages,
    listAgentConversations,
    createAgentConversation,
    getAgentConversationMessagesById,
    appendMessagesByConversationId,
    deleteAgentConversation,
};
