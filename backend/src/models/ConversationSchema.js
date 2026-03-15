import mongoose from 'mongoose';

/**
 * 消息 Schema
 */
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['system', 'user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

/**
 * 对话 Schema
 */
const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent'
    },
    provider: {
      type: String,
      enum: ['deepseek', 'qwen'],
      default: 'deepseek'
    },
    title: {
      type: String,
      default: '新对话'
    },
    messages: [messageSchema],
    messageCount: {
      type: Number,
      default: 0
    },
    // Token 消耗估算
    tokenUsage: {
      prompt: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
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
    collection: 'conversations'
  }
);

// 索引
conversationSchema.index({ userId: 1, provider: 1 });
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ createdAt: -1 });

// 虚拟字段
conversationSchema.virtual('id').get(function () {
  return this._id.toString();
});

// 转换为 JSON
conversationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

/**
 * 对话模型
 */
const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
