import Conversation from '../../models/ConversationSchema.js';
import Agent from '../../modules/agent/models/AgentSchema.js';

/**
 * 对话导出服务
 * 支持 Markdown、JSON、CSV、TXT 格式
 */
class ExportService {
  /**
   * 获取对话数据
   */
  async getConversationData(conversationId, userId) {
    const conv = await Conversation.findOne({
      _id: conversationId,
      userId,
    }).lean();

    if (!conv) throw new Error('对话不存在或无权访问');

    // 获取智能体信息
    let agentName = '未知智能体';
    if (conv.agentId) {
      const agent = await Agent.findById(conv.agentId).lean();
      if (agent) agentName = agent.name;
    }

    return { conv, agentName };
  }

  /**
   * 导出为 Markdown 格式
   */
  async exportToMarkdown(conversationId, userId) {
    const { conv, agentName } = await this.getConversationData(conversationId, userId);

    const lines = [
      `# 对话记录 - ${agentName}`,
      ``,
      `**日期**: ${new Date(conv.createdAt).toLocaleString('zh-CN')}`,
      `**智能体**: ${agentName}`,
      `**消息数**: ${conv.messages?.length || 0}`,
      ``,
      `---`,
      ``,
    ];

    for (const msg of conv.messages || []) {
      const role = msg.role === 'user' ? '👤 用户' : `🤖 ${agentName}`;
      const time = msg.timestamp
        ? new Date(msg.timestamp).toLocaleTimeString('zh-CN')
        : '';

      lines.push(`### ${role}${time ? ` *(${time})*` : ''}`);
      lines.push(``);
      lines.push(msg.content || '');
      lines.push(``);
      lines.push(`---`);
      lines.push(``);
    }

    return {
      content: lines.join('\n'),
      filename: `conversation_${conversationId}_${Date.now()}.md`,
      mimeType: 'text/markdown',
    };
  }

  /**
   * 导出为 JSON 格式
   */
  async exportToJSON(conversationId, userId) {
    const { conv, agentName } = await this.getConversationData(conversationId, userId);

    const exportData = {
      exportedAt: new Date().toISOString(),
      conversation: {
        id: conv._id,
        agentName,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount: conv.messages?.length || 0,
        messages: (conv.messages || []).map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        })),
      },
    };

    return {
      content: JSON.stringify(exportData, null, 2),
      filename: `conversation_${conversationId}_${Date.now()}.json`,
      mimeType: 'application/json',
    };
  }

  /**
   * 导出为 CSV 格式
   */
  async exportToCSV(conversationId, userId) {
    const { conv, agentName } = await this.getConversationData(conversationId, userId);

    const rows = [
      ['角色', '内容', '时间'],
      ...(conv.messages || []).map((msg) => [
        msg.role === 'user' ? '用户' : agentName,
        // 转义 CSV 特殊字符
        `"${(msg.content || '').replace(/"/g, '""')}"`,
        msg.timestamp ? new Date(msg.timestamp).toLocaleString('zh-CN') : '',
      ]),
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
    const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility

    return {
      content: bom + csv,
      filename: `conversation_${conversationId}_${Date.now()}.csv`,
      mimeType: 'text/csv',
    };
  }

  /**
   * 导出为纯文本格式
   */
  async exportToTxt(conversationId, userId) {
    const { conv, agentName } = await this.getConversationData(conversationId, userId);

    const lines = [
      `对话记录 - ${agentName}`,
      `日期: ${new Date(conv.createdAt).toLocaleString('zh-CN')}`,
      `${'='.repeat(50)}`,
      ``,
    ];

    for (const msg of conv.messages || []) {
      const role = msg.role === 'user' ? '用户' : agentName;
      lines.push(`[${role}]`);
      lines.push(msg.content || '');
      lines.push(``);
    }

    return {
      content: lines.join('\n'),
      filename: `conversation_${conversationId}_${Date.now()}.txt`,
      mimeType: 'text/plain',
    };
  }

  /**
   * 批量导出多个对话
   */
  async exportMultiple(conversationIds, userId, format = 'json') {
    const results = [];

    for (const id of conversationIds) {
      try {
        let result;
        switch (format) {
          case 'markdown':
            result = await this.exportToMarkdown(id, userId);
            break;
          case 'csv':
            result = await this.exportToCSV(id, userId);
            break;
          case 'txt':
            result = await this.exportToTxt(id, userId);
            break;
          default:
            result = await this.exportToJSON(id, userId);
        }
        results.push(result);
      } catch (err) {
        results.push({ error: err.message, conversationId: id });
      }
    }

    return results;
  }
}

export default new ExportService();
