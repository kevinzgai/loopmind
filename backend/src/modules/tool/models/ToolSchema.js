import mongoose from 'mongoose';

/**
 * 工具/插件 Schema
 * 支持内置工具和用户自定义工具
 */
const ToolSchema = new mongoose.Schema(
  {
    // 工具基本信息
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: String,
    category: {
      type: String,
      enum: ['builtin', 'custom', 'api', 'webhook'],
      default: 'custom',
    },
    icon: String,
    version: {
      type: String,
      default: '1.0.0',
    },

    // 所有者信息
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },

    // 工具配置
    type: {
      type: String,
      enum: ['http', 'function', 'webhook', 'database'],
      required: true,
    },

    // HTTP 类型工具配置
    httpConfig: {
      method: { type: String, enum: ['GET', 'POST', 'PUT', 'DELETE'] },
      url: String,
      headers: mongoose.Schema.Types.Mixed,
      timeout: { type: Number, default: 30000 },
      retryCount: { type: Number, default: 3 },
    },

    // 函数类型工具配置
    functionConfig: {
      code: String, // JavaScript 代码
      runtime: { type: String, default: 'nodejs' },
    },

    // 输入参数定义
    inputs: [
      {
        name: String,
        type: { type: String, enum: ['string', 'number', 'boolean', 'object', 'array'] },
        description: String,
        required: { type: Boolean, default: false },
        defaultValue: mongoose.Schema.Types.Mixed,
        enum: [mongoose.Schema.Types.Mixed], // 枚举值
      },
    ],

    // 输出定义
    outputs: [
      {
        name: String,
        type: { type: String, enum: ['string', 'number', 'boolean', 'object', 'array'] },
        description: String,
      },
    ],

    // 使用统计
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: Date,

    // 状态
    enabled: {
      type: Boolean,
      default: true,
    },
    published: {
      type: Boolean,
      default: false,
    },

    // 标签和元数据
    tags: [String],
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

// 索引
ToolSchema.index({ userId: 1, name: 1 });
ToolSchema.index({ category: 1 });
ToolSchema.index({ isPublic: 1, published: 1 });

export default mongoose.model('Tool', ToolSchema);
