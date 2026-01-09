import mongoose from 'mongoose';

/**
 * Token Schema
 * 用于持久化存储用户 Token
 */
const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    expiryTime: {
      type: Date,
      required: true,
      index: true,
      // 自动删除过期的 Token（TTL 索引）
      expires: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'tokens'
  }
);

// 虚拟字段：是否过期
tokenSchema.virtual('isExpired').get(function () {
  return Date.now() > this.expiryTime.getTime();
});

// 转换为 JSON 时包含虚拟字段
tokenSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

/**
 * Token 模型
 */
const Token = mongoose.model('Token', tokenSchema);

export default Token;
