import mongoose from 'mongoose';

/**
 * Agent 版本快照 Schema
 * 每次重要更新保存一份配置快照，支持回滚
 */
const AgentVersionSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // 版本号（语义化：major.minor.patch）
    version: {
      type: String,
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },

    // 变更说明
    changelog: {
      type: String,
      default: '配置更新',
    },

    // 快照内容（Agent 配置的完整副本）
    snapshot: {
      name: String,
      description: String,
      avatar: String,
      category: String,
      model: String,
      personality: String,
      initialMemory: String,
      voiceConfig: mongoose.Schema.Types.Mixed,
      knowledgeBaseId: mongoose.Schema.Types.ObjectId,
      systemPrompt: String,
      temperature: Number,
      maxTokens: Number,
      tools: [String],
      tags: [String],
      published: Boolean,
    },

    // 是否为当前激活版本
    isActive: {
      type: Boolean,
      default: false,
    },

    // 是否已发布（发布的版本不允许删除）
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

AgentVersionSchema.index({ agentId: 1, versionNumber: -1 });
AgentVersionSchema.index({ agentId: 1, isActive: 1 });

export default mongoose.model('AgentVersion', AgentVersionSchema);
