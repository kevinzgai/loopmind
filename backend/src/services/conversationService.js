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
    conversation.messages.push(...messages);
    conversation.messageCount = conversation.messages.length;
    conversation.updatedAt = new Date();
    await conversation.save();
    return conversation;
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
};
