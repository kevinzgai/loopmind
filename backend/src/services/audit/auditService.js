import AuditLog from '../../models/AuditLogSchema.js';

/**
 * 审计日志服务
 * 提供日志记录、查询、统计功能
 */
class AuditService {
  /**
   * 记录操作日志
   */
  async log(data) {
    try {
      const log = new AuditLog({
        userId: data.userId,
        username: data.username,
        workspaceId: data.workspaceId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        resourceName: data.resourceName,
        details: data.details,
        status: data.status || 'success',
        errorMessage: data.errorMessage,
        ip: data.ip,
        userAgent: data.userAgent,
        method: data.method,
        path: data.path,
        duration: data.duration,
      });

      await log.save();
      return log;
    } catch (error) {
      // 日志记录失败不应影响主流程
      console.error('❌ 审计日志记录失败:', error.message);
      return null;
    }
  }

  /**
   * 查询审计日志
   */
  async getLogs(options = {}) {
    const {
      userId,
      workspaceId,
      action,
      resource,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = options;

    const query = {};

    if (userId) query.userId = userId;
    if (workspaceId) query.workspaceId = workspaceId;
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * 获取操作统计
   */
  async getStats(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [actionStats, userStats, statusStats] = await Promise.all([
      // 按操作类型统计
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // 按用户统计
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$userId', username: { $first: '$username' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // 按状态统计
      AuditLog.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    return { actionStats, userStats, statusStats, period: `${days}天` };
  }

  /**
   * 删除旧日志（手动触发）
   */
  async cleanOldLogs(daysToKeep = 90) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysToKeep);
    const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });
    return result.deletedCount;
  }
}

const auditService = new AuditService();

/**
 * Express 中间件：自动记录关键操作
 */
export function auditMiddleware(action, resource) {
  return async (req, res, next) => {
    const start = Date.now();
    const originalSend = res.json.bind(res);

    res.json = function (body) {
      const duration = Date.now() - start;
      const status = res.statusCode < 400 ? 'success' : 'failure';

      // 异步记录，不阻塞响应
      auditService
        .log({
          userId: req.user?.id,
          username: req.user?.username,
          action,
          resource,
          resourceId: req.params?.id || req.params?.agentId || req.params?.workspaceId,
          details: req.method !== 'GET' ? req.body : undefined,
          status,
          ip: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          method: req.method,
          path: req.path,
          duration,
        })
        .catch(console.error);

      return originalSend(body);
    };

    next();
  };
}

export default auditService;
