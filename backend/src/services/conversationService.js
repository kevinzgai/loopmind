import Conversation from "../models/ConversationSchema.js";

export async function getOrCreateConversation(userId, provider) {
    let conversation = await Conversation.findOne({ userId, provider });
    if (!conversation) {
        conversation = new Conversation({
            userId,
            provider,
            title: "新对话",
            messages: [],
            messageCount: 0,
        });
    }
    return conversation;
}

export async function appendConversationMessages(userId, provider, messages) {
    if (!messages || messages.length === 0) {
        return null;
    }

    const conversation = await getOrCreateConversation(userId, provider);
    conversation.messages.push(...messages);
    conversation.messageCount = conversation.messages.length;
    conversation.updatedAt = new Date();
    await conversation.save();
    return conversation;
}

export async function getConversationMessages(userId, provider) {
    const conversation = await Conversation.findOne({ userId, provider });
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

export async function appendMessagesByConversationId(conversationId, messages) {
    if (!messages || messages.length === 0) return null;
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return null;

    // 如果是新对话（messageCount 为 0），且 title 为 "新对话"，尝试使用第一条用户消息更新标题
    if (conversation.messageCount === 0 && conversation.title === '新对话') {
        const firstUserMsg = messages.find(m => m.role === 'user');
        if (firstUserMsg && firstUserMsg.content) {
            // 截取前 20 个字符作为标题
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

export async function deleteAgentConversation(userId, agentId, conversationId) {
    const result = await Conversation.deleteOne({ _id: conversationId, userId, agentId });
    return result.deletedCount > 0;
}

export default {
    getOrCreateConversation,
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
