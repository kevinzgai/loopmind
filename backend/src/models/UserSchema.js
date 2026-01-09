import mongoose from 'mongoose';

/**
 * 用户 Schema
 */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, '用户名不能为空'],
      unique: true,
      trim: true,
      minlength: [3, '用户名至少 3 个字符'],
      maxlength: [50, '用户名最多 50 个字符'],
      index: true
    },
    email: {
      type: String,
      required: [true, '邮箱不能为空'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, '邮箱格式不正确'],
      index: true
    },
    passwordHash: {
      type: String,
      required: [true, '密码不能为空'],
      select: false // 默认不返回密码
    },
    isActive: {
      type: Boolean,
      default: true
    },
    profile: {
      avatar: String,
      bio: String
    },
    lastLoginAt: Date,
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
    collection: 'users'
  }
);

// 索引
userSchema.index({ createdAt: -1 });

// 虚拟字段：用户 ID（使用 MongoDB 的 _id）
userSchema.virtual('id').get(function () {
  return this._id.toString();
});

// 转换为 JSON 时包含虚拟字段
userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = doc._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return {
      id: ret.id,
      username: ret.username,
      email: ret.email,
      isActive: ret.isActive,
      profile: ret.profile,
      lastLoginAt: ret.lastLoginAt,
      createdAt: ret.createdAt,
      updatedAt: ret.updatedAt
    };
  }
});

/**
 * 用户模型
 */
const User = mongoose.model('User', userSchema);

export default User;
