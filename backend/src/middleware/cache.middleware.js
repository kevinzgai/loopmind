import { cache, TTL } from '../services/cache/cacheService.js';

/**
 * HTTP 响应缓存中间件
 * 对 GET 请求进行缓存，减少重复数据库查询
 */
export function cacheMiddleware(ttl = TTL.MEDIUM, keyFn = null) {
  return (req, res, next) => {
    // 只缓存 GET 请求
    if (req.method !== 'GET') return next();

    // 生成缓存键
    const cacheKey = keyFn
      ? keyFn(req)
      : `http:${req.user?.id || 'anon'}:${req.originalUrl}`;

    // 检查缓存
    const cached = cache.get(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached);
    }

    // 拦截响应并缓存
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // 只缓存成功响应
      if (res.statusCode < 400 && body?.success !== false) {
        cache.set(cacheKey, body, ttl);
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
}

/**
 * 性能监控中间件
 * 记录每个请求的处理时间和资源使用情况
 */
export function performanceMiddleware() {
  return (req, res, next) => {
    const start = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const memoryDelta = process.memoryUsage().heapUsed - startMemory;

      // 记录慢请求（超过 1 秒）
      if (duration > 1000) {
        console.warn(
          `⚠️ 慢请求 [${req.method}] ${req.originalUrl}: ${duration}ms`,
          `内存增量: ${(memoryDelta / 1024).toFixed(1)}KB`
        );
      }
    });

    next();
  };
}

/**
 * 请求限速中间件（简单内存限速）
 */
export function rateLimitMiddleware(options = {}) {
  const {
    windowMs = 60 * 1000, // 1分钟
    max = 100,            // 最多100次请求
    message = '请求过于频繁，请稍后再试',
  } = options;

  const requestCounts = new Map();

  // 定期清理
  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requestCounts.entries()) {
      if (now - data.resetAt > windowMs) {
        requestCounts.delete(key);
      }
    }
  }, windowMs);

  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();

    let data = requestCounts.get(key);
    if (!data || now - data.resetAt > windowMs) {
      data = { count: 0, resetAt: now };
      requestCounts.set(key, data);
    }

    data.count++;

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - data.count));
    res.setHeader('X-RateLimit-Reset', new Date(data.resetAt + windowMs).toISOString());

    if (data.count > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((data.resetAt + windowMs - now) / 1000),
      });
    }

    next();
  };
}

/**
 * 缓存失效中间件
 * 在 POST/PUT/DELETE 操作后自动清除相关缓存
 */
export function invalidateCacheMiddleware(prefixes = []) {
  return (req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode < 400) {
          prefixes.forEach((prefix) => cache.deleteByPrefix(prefix));
        }
        return originalJson(body);
      };
    }
    next();
  };
}
