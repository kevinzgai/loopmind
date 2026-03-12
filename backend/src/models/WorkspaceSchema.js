import mongoose from 'mongoose';

/**
 * 工作空间 Schema
 * 支持团队隔离，每个工作空间有独立的成员、智能体、知识库
 */
const WorkspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    avatar: String,
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },

    // 所有者
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // 成员列表
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['owner', 'admin', 'editor', 'viewer'],
          default: 'viewer',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // 邀请码
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    inviteCodeExpiry: Date,
    inviteCodeEnabled: {
      type: Boolean,
      default: false,
    },

    // 配置
    settings: {
      allowPublicAgents: { type: Boolean, default: true },
      maxMembers: { type: Number, default: 10 },
      allowInviteLinks: { type: Boolean, default: true },
    },

    // 使用配额
    quota: {
      maxAgents: { type: Number, default: 50 },
      maxKnowledgeBases: { type: Number, default: 20 },
      maxStorageGB: { type: Number, default: 5 },
    },

    // 状态
    isActive: {
      type: Boolean,
      default: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
  },
  { timestamps: true }
);

// 索引
WorkspaceSchema.index({ ownerId: 1 });
WorkspaceSchema.index({ 'members.userId': 1 });

export default mongoose.model('Workspace', WorkspaceSchema);
