import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

/**
 * 基础限流器 - 适用于大多数接口
 * 限制每个 IP 在 15 分钟内最多 100 次请求
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 1000, // 暂时放宽到 1000，避免调试时误伤
  message: {
    status: 'error',
    message: '请求过于频繁，请 15 分钟后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 认证限流器 - 适用于登录/注册等敏感接口
 * 限制每个 IP 在 1 小时内最多 20 次请求
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 20,
  message: {
    status: 'error',
    message: '登录尝试过于频繁，请 1 小时后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * 聊天限流器 - 适用于 AI 对话接口
 * 限制每个 IP 在 1 分钟内最多 60 次请求 (支持流式传输，可能需要较高频率)
 */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 60,
  message: {
    status: 'error',
    message: '对话请求过于频繁，请稍后再试'
  }
});

/**
 * 知识库上传限流器
 * 限制每个 IP 在 1 小时内最多 50 次上传
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: {
    status: 'error',
    message: '上传过于频繁，请稍后再试'
  }
});

/**
 * 安全中间件配置函数
 * @param {Express} app 
 */
export const setupSecurityMiddleware = (app) => {
  // 1. 设置安全 HTTP 头
  app.use(helmet({
    contentSecurityPolicy: false, // 开发环境可能需要关闭或放宽 CSP
    crossOriginEmbedderPolicy: false,
  }));

  // 2. 防止 MongoDB 注入
  app.use(mongoSanitize());

  // 3. 防止 HTTP 参数污染
  app.use(hpp());

  // 4. 应用全局限流
  // 注意：如果是反向代理环境（如 Nginx），需要在 app.js 中设置 app.set('trust proxy', 1);
  app.use('/api', globalLimiter);
};
