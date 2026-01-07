# 流式 ASR 问题总结

## 当前状态

- ✅ 后端正常启动
- ✅ Seed-ASR WebSocket 正常工作 (`ws://localhost:3000/seed-asr`)
- ❌ 阿里云流式 ASR WebSocket 无法连接 (`ws://localhost:3000/asr/stream`)

## 已完成的工作

### 1. 创建了完整的流式 ASR 服务
- ✅ `backend/src/services/aliAsrStreamService.js` - 完整版本
- ✅ `backend/src/services/aliAsrStreamService-simple.js` - 简化测试版本
- ✅ `frontend/src/components/AsrStreamDemo.vue` - 前端组件
- ✅ `frontend/src/views/AsrStreamPage.vue` - 前端页面
- ✅ 路由配置 `/asr-stream`

### 2. 配置了 Vite 代理
- ✅ 添加了 `/asr/stream` WebSocket 代理
- ✅ 处理了路径冲突问题

### 3. 调试和测试
- ✅ 创建了多个测试文件
- ✅ 确认 Seed-ASR WebSocket 正常工作
- ✅ 确认问题出在阿里云流式 ASR 上

## 问题分析

### 测试结果
- **直接连接测试**: Code 1006（连接被拒绝）
- **Seed-ASR**: 正常工作
- **结论**: WebSocket 服务器配置没问题，问题出在 `/asr/stream` 路径上

### 可能的原因

#### 1. 路径冲突
`/asr/stream` 可能与 Express 路由冲突。

**验证方法**:
```javascript
// 在 backend/src/app.js 中检查是否有 /asr 路由
app.use('/asr', asrRoutes);
```

如果有，Express 可能会先处理 `/asr/stream`，导致 WebSocket 握手失败。

**解决方案**: 使用不同的路径，如 `/ws/asr-stream`

#### 2. WebSocket 服务器创建顺序
可能需要在 Express 路由之前创建 WebSocket 服务器。

#### 3. 多个 WebSocket 服务器冲突
两个 WebSocket 服务器（Seed-ASR 和 Ali ASR）可能有冲突。

## 建议的解决方案

### 方案 A: 更改路径（推荐）

避免与 Express 路由冲突，使用独立的路径。

**后端** `backend/src/server.js`:
```javascript
// 使用 /ws 前缀避免与 Express 路由冲突
const asrStreamWss = new WebSocketServer({ 
  server: httpServer, 
  path: '/ws/asr-stream'  // 改路径
});
```

**前端** `vite.config.js`:
```javascript
proxy: {
  '/ws/asr-stream': {
    target: 'ws://localhost:3000',
    ws: true,
    changeOrigin: true
  }
}
```

**前端** `AsrStreamDemo.vue`:
```javascript
const wsUrl = 'ws://localhost:3000/ws/asr-stream'
```

### 方案 B: 使用单一 WebSocket 服务器

不为每个服务创建单独的 WebSocket 服务器，而是使用一个服务器处理所有连接。

```javascript
const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws, req) => {
    const path = req.url;
    
    if (path === '/seed-asr') {
        // 处理 Seed-ASR
        seedAsrService.handleConnection(ws, uuidv4());
    } else if (path === '/asr/stream') {
        // 处理阿里云流式 ASR
        handleStreamConnection(ws);
    } else {
        ws.close();
    }
});
```

### 方案 C: 检查 Express 路由配置

确保 Express 不会拦截 WebSocket 请求。

**检查** `backend/src/app.js`:
```javascript
// 确保 /asr 路由不会影响 /asr/stream
app.use('/asr', asrRoutes);  // 这可能是问题所在
```

**解决**: 在 Express 路由中排除 WebSocket 路径
```javascript
app.use('/asr', (req, res, next) => {
    // 排除 WebSocket 路径
    if (req.path.startsWith('/stream')) {
        return next('route');
    }
    next();
}, asrRoutes);
```

## 立即可以尝试的方案

### 快速测试：更改路径

1. **修改后端** `backend/src/server.js`:
```javascript
const asrStreamWss = new WebSocketServer({ 
  server: httpServer, 
  path: '/ws-asr-stream'  // 完全不同的路径
});
```

2. **修改前端** `AsrStreamDemo.vue`:
```javascript
const wsUrl = 'ws://localhost:3000/ws-asr-stream'
```

3. **重启后端和前端**

4. **测试连接**

如果这样能工作，说明确实是路径冲突问题。

## 当前可用的替代方案

由于流式 ASR 一直有问题，可以：

### 1. 使用普通 ASR（已经可以工作）
- 路径: `/asr-test`
- 功能: 录音完成后识别
- 延迟: 3-5 秒
- 状态: ✅ 正常工作

### 2. 使用 Seed-ASR（已经可以工作）
- 路径: `/seed-asr-test`
- 功能: 实时流式识别
- 延迟: < 1 秒
- 状态: ✅ 正常工作

## 下一步行动

### 优先级 1: 快速修复
1. 更改路径为 `/ws-asr-stream`
2. 测试是否能连接
3. 如果成功，继续使用新路径

### 优先级 2: 深入调试
1. 检查 Express 路由配置
2. 使用单一 WebSocket 服务器
3. 添加详细的调试日志

### 优先级 3: 替代方案
1. 使用 Seed-ASR 的流式识别
2. 或者只使用普通 ASR
3. 等待调试完成后再启用阿里云流式 ASR

## 总结

流式 ASR 功能的代码本身没有问题（Seed-ASR 证明了 WebSocket 服务器可以工作），问题很可能是：
1. **路径冲突** - `/asr/stream` 与 Express 路由 `/asr` 冲突
2. **WebSocket 服务器配置** - 需要调整创建顺序或方式

**建议**: 先尝试更改路径为 `/ws-asr-stream`，这是最快的解决方案。
