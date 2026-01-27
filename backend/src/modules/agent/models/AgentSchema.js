import mongoose from 'mongoose';

/**
 * 智能体 Schema
 */
const agentSchema = new mongoose.Schema(
  {
    // 基本信息
    name: {
      type: String,
      required: [true, '智能体名称不能为空'],
      trim: true,
      maxlength: [50, '智能体名称最多 50 个字符']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, '智能体描述最多 500 个字符']
    },
    avatar: String,

    // 创建者信息
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    creatorName: String,

    // 配置信息
    model: {
      type: String,
      // 允许任意字符串作为模型名，以支持具体的模型ID（如 deepseek-reasoner, doubao-pro-4k 等）
      // 如果需要限制，应该维护一个包含所有具体模型ID的列表，而不仅仅是 provider 列表
      default: 'deepseek-chat'
    },
    personality: {
      type: String,
      trim: true,
      maxlength: [1000, '人设最多 1000 个字符']
    },
    initialMemory: {
      type: String,
      trim: true,
      maxlength: [500, '初始记忆最多 500 个字符']
    },
    voice: {
      type: String,
      default: 'xiaoxian'
    },
    speechRate: {
      type: Number,
      default: 150
    },

    // 发布状态
    isPublished: {
      type: Boolean,
      default: false,
      index: true
    },
    publishedAt: Date,

    // 统计信息
    usageCount: {
      type: Number,
      default: 0
    },
    userCount: {
      type: Number,
      default: 0
    },

    // 时间戳
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'agents'
  }
);

// 索引
agentSchema.index({ creatorId: 1, createdAt: -1 });
agentSchema.index({ isPublished: 1, createdAt: -1 });

// 虚拟字段
agentSchema.virtual('id').get(function () {
  return this._id.toString();
});

// 转换为 JSON
agentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    ret.id = doc._id.toString();
    return ret;
  }
});

const Agent = mongoose.model('Agent', agentSchema);

export default Agent;
