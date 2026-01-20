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

export default {
    getOrCreateConversation,
    appendConversationMessages,
    getConversationMessages,
    getOrCreateAgentConversation,
    appendAgentConversationMessages,
    getAgentConversationMessages,
};
