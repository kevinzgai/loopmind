import mongoose from 'mongoose';

/**
 * API 密钥 Schema - 用于第三方应用调用
 * 支持每个用户创建最多 20 个 API Key
 */
const apiKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '密钥名称不能为空'],
      trim: true,
      maxlength: [50, '密钥名称不能超过50个字符']
    },
    key: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastUsedAt: Date,
    expiresAt: Date,
    requestCount: {
      type: Number,
      default: 0
    },
    errorCount: {
      type: Number,
      default: 0
    },
    lastUsedIp: String,
    lastUsedUserAgent: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'api_keys'
  }
);

apiKeySchema.index({ userId: 1, createdAt: -1 });

apiKeySchema.methods.incrementRequestCount = function() {
  this.requestCount += 1;
  this.lastUsedAt = new Date();
  return this.save();
};

apiKeySchema.methods.incrementErrorCount = function() {
  this.errorCount += 1;
  return this.save();
};

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;
