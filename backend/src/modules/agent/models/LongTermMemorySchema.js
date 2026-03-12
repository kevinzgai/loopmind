import mongoose from 'mongoose';

/**
 * 长期记忆条目 Schema
 * 从对话中自动提取的重要信息片段
 */
const LongTermMemorySchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },

    // 记忆内容
    content: {
      type: String,
      required: true,
    },
    summary: String,

    // 记忆类型
    memoryType: {
      type: String,
      enum: [
        'fact',        // 事实信息（如用户姓名、职业）
        'preference',  // 偏好（如喜欢的食物、风格）
        'goal',        // 目标（如学习目标、工作目标）
        'event',       // 事件（如重要日期、经历）
        'skill',       // 技能（如编程语言、特长）
        'relation',    // 关系（如家庭成员、朋友）
        'other',       // 其他
      ],
      default: 'fact',
    },

    // 重要程度 1-5
    importance: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },

    // 情感倾向
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral',
    },

    // 来源对话 ID
    sourceConversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },

    // 向量 ID（用于语义检索）
    vectorId: String,

    // 访问次数（越常访问越重要）
    accessCount: {
      type: Number,
      default: 0,
    },
    lastAccessedAt: Date,

    // 标签
    tags: [String],

    // 是否已过期
    expired: {
      type: Boolean,
      default: false,
    },
    expiresAt: Date,
  },
  { timestamps: true }
);

LongTermMemorySchema.index({ agentId: 1, userId: 1, memoryType: 1 });
LongTermMemorySchema.index({ agentId: 1, userId: 1, importance: -1 });
LongTermMemorySchema.index({ agentId: 1, userId: 1, expired: 1 });

export default mongoose.model('LongTermMemory', LongTermMemorySchema);
