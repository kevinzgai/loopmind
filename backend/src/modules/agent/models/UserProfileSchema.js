import mongoose from 'mongoose';

/**
 * 用户画像 Schema
 * 自动从对话中学习用户的偏好、背景、行为模式
 */
const UserProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // 基本信息（从对话中提取）
    basicInfo: {
      name: String,
      age: Number,
      gender: String,
      occupation: String,
      location: String,
      language: { type: String, default: 'zh-CN' },
    },

    // 兴趣爱好
    interests: [
      {
        topic: String,
        level: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // 技能特长
    skills: [
      {
        name: String,
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // 沟通偏好
    communicationStyle: {
      tone: { type: String, enum: ['formal', 'casual', 'friendly'], default: 'casual' },
      responseLength: { type: String, enum: ['short', 'medium', 'long'], default: 'medium' },
      preferredFormat: { type: String, enum: ['text', 'markdown', 'structured'], default: 'text' },
      language: { type: String, default: 'zh' },
    },

    // 行为模式
    behaviorPatterns: {
      activeHours: [Number],           // 活跃时段（0-23）
      avgSessionLength: Number,         // 平均会话时长（分钟）
      avgMessagesPerSession: Number,    // 每次会话平均消息数
      preferredTopics: [String],        // 常讨论的话题
      responseStyle: String,            // 偏好的回复风格
    },

    // 目标与需求
    goals: [
      {
        description: String,
        category: String,
        status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // 统计信息
    stats: {
      totalConversations: { type: Number, default: 0 },
      totalMessages: { type: Number, default: 0 },
      totalAgentsUsed: { type: Number, default: 0 },
      firstSeenAt: Date,
      lastSeenAt: Date,
    },

    // 定制化偏好
    preferences: {
      darkMode: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
      voiceEnabled: { type: Boolean, default: false },
      autoPlay: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model('UserProfile', UserProfileSchema);
