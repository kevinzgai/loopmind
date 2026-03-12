import mongoose from 'mongoose';

/**
 * 操作审计日志 Schema
 * 记录所有关键操作：谁、在何时、做了什么
 */
const AuditLogSchema = new mongoose.Schema(
  {
    // 操作者
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    username: String,  // 冗余存储，避免关联查询

    // 工作空间
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      index: true,
    },

    // 操作类型
    action: {
      type: String,
      required: true,
      enum: [
        // 用户操作
        'user.login', 'user.logout', 'user.register', 'user.update', 'user.delete',
        'user.password_change', 'user.role_change',
        // 智能体操作
        'agent.create', 'agent.update', 'agent.delete', 'agent.publish', 'agent.unpublish',
        'agent.chat',
        // 知识库操作
        'knowledge.create', 'knowledge.update', 'knowledge.delete',
        'knowledge.document_upload', 'knowledge.document_delete',
        // 工作流操作
        'workflow.create', 'workflow.update', 'workflow.delete',
        'workflow.publish', 'workflow.execute',
        // 工具操作
        'tool.create', 'tool.update', 'tool.delete', 'tool.execute',
        // 工作空间操作
        'workspace.create', 'workspace.update', 'workspace.delete',
        'workspace.member_add', 'workspace.member_remove', 'workspace.member_role_change',
        // 系统配置
        'config.update', 'config.ai_update', 'config.speech_update',
        // API Key
        'apikey.create', 'apikey.delete', 'apikey.use',
        // 其他
        'other',
      ],
      index: true,
    },

    // 操作资源
    resource: {
      type: String,  // 资源类型：agent, knowledge, workflow...
    },
    resourceId: String,  // 资源 ID
    resourceName: String, // 资源名称（便于显示）

    // 操作详情
    details: mongoose.Schema.Types.Mixed,

    // 操作结果
    status: {
      type: String,
      enum: ['success', 'failure', 'warning'],
      default: 'success',
    },
    errorMessage: String,

    // 请求信息
    ip: String,
    userAgent: String,
    method: String,
    path: String,

    // 时间
    duration: Number, // 操作耗时（ms）
  },
  {
    timestamps: true,
    collection: 'audit_logs',
  }
);

// 索引
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ workspaceId: 1, createdAt: -1 });

// 自动删除 90 天以上的日志
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export default mongoose.model('AuditLog', AuditLogSchema);
