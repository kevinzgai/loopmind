import mongoose from 'mongoose';

/**
 * API 密钥 Schema - 用于第三方应用调用
 */
const apiKeySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '密钥名称不能为空'],
      trim: true
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

/**
 * API 密钥模型
 */
const ApiKey = mongoose.model('ApiKey', apiKeySchema);

export default ApiKey;
