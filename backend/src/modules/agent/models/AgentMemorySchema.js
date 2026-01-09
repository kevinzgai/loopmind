import mongoose from 'mongoose';

/**
 * 智能体记忆 Schema
 * 存储用户与智能体的对话记忆
 */
const agentMemorySchema = new mongoose.Schema(
  {
    // 关键信息
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // 记忆内容
    content: {
      type: String,
      default: ''
    },
    contentLength: {
      type: Number,
      default: 0
    },

    // 记忆统计
    conversationCount: {
      type: Number,
      default: 0
    },
    lastUpdatedAt: Date,

    // 记忆总结（当超过 2000 字时）
    summary: {
      type: String,
      default: ''
    },
    keywords: [String],

    // 时间戳
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'agent_memories'
  }
);

// 复合索引：用户与智能体的记忆
agentMemorySchema.index({ agentId: 1, userId: 1 }, { unique: true });
agentMemorySchema.index({ userId: 1, updatedAt: -1 });

// 虚拟字段
agentMemorySchema.virtual('id').get(function () {
  return this._id.toString();
});

// 转换为 JSON
agentMemorySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    ret.id = doc._id.toString();
    return ret;
  }
});

const AgentMemory = mongoose.model('AgentMemory', agentMemorySchema);

export default AgentMemory;
