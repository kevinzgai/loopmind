# WebSocket 代理配置说明

## 问题描述

前端尝试连接 `ws://localhost:3000/asr/stream` 时失败，因为 Vite 开发服务器运行在 5173 端口，需要通过代理转发 WebSocket 连接。

## 解决方案

### 1. 配置 Vite 代理

在 `frontend/vite.config.js` 中添加 WebSocket 代理：

**⚠️ 重要：使用正则表达式精确匹配路径！**

```javascript
export default defineConfig({
  server: {
    proxy: {
      // ✅ 使用正则表达式精确匹配 WebSocket 路径
      '^/asr/stream$': {
        target: 'ws://localhost:3000',
        ws: true,              // 启用 WebSocket 代理
        changeOrigin: true
      },
      
      // ✅ 使用负向前瞻排除 /asr/stream
      '^/asr(?!/stream)': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

**为什么需要正则表达式？**

简单的字符串匹配会导致路径冲突：
- `/asr` 会匹配所有以 `/asr` 开头的路径
- 包括 `/asr/stream`
- 即使 `/asr/stream` 在前面也可能被 `/asr` 拦截

使用正则表达式可以精确控制匹配规则：
- `^/asr/stream$` - 精确匹配 `/asr/stream`
- `^/asr(?!/stream)` - 匹配 `/asr` 开头但后面不是 `/stream` 的路径

### 2. 修改前端连接方式

**错误方式**（硬编码后端地址）:
```javascript
ws = new WebSocket(`ws://localhost:3000/asr/stream`)
```

**正确方式**（使用相对路径，让 Vite 代理处理）:
```javascript
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
const wsUrl = `${protocol}//${window.location.host}/asr/stream`
ws = new WebSocket(wsUrl)
```

这样：
- 开发环境: `ws://localhost:5173/asr/stream` → Vite 代理 → `ws://localhost:3000/asr/stream`
- 生产环境: `wss://yourdomain.com/asr/stream` → 直接连接后端

## 配置详解

### WebSocket 代理选项

```javascript
{
  target: 'ws://localhost:3000',  // 后端 WebSocket 地址
  ws: true,                        // 启用 WebSocket 代理（必须）
  changeOrigin: true               // 修改 Origin 头
}
```

### 为什么需要 `ws: true`

- HTTP 代理和 WebSocket 代理的处理方式不同
- `ws: true` 告诉 Vite 这是一个 WebSocket 连接
- 没有这个选项，WebSocket 握手会失败

## 当前配置

### 所有 WebSocket 代理

**正确的配置顺序**（更具体的路径在前）:

```javascript
server: {
  proxy: {
    // WebSocket 代理（更具体的路径在前）
    '/asr/stream': {
      target: 'ws://localhost:3000',
      ws: true,
      changeOrigin: true
    },
    
    '/seed-asr': {
      target: 'ws://localhost:3000',
      ws: true,
      changeOrigin: true
    },
    
    // HTTP 代理（通用路径在后）
    '/asr': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

### 为什么顺序很重要？

Vite 的代理配置是**从上到下**匹配的：
1. 请求 `/asr/stream` 
2. 如果 `/asr` 在前面，会匹配成功（因为 `/asr/stream` 以 `/asr` 开头）
3. 使用 HTTP 代理而不是 WebSocket 代理
4. WebSocket 握手失败

**解决方法**：把更具体的路径（`/asr/stream`）放在更通用的路径（`/asr`）前面。

## 重启服务

修改 `vite.config.js` 后，**必须重启前端开发服务器**：

```bash
# 在前端终端按 Ctrl+C 停止
# 然后重新启动
npm run dev
```

## 验证配置

### 1. 检查前端日志
打开浏览器控制台，应该看到：
```
🔗 连接到: ws://localhost:5173/asr/stream
✅ WebSocket 连接已建立
```

### 2. 检查后端日志
后端控制台应该看到：
```
🎙️ 阿里云流式 ASR 客户端已连接
📞 新的流式识别连接
```

### 3. 检查网络面板
在浏览器开发者工具的 Network 标签：
- 找到 `asr/stream` 请求
- 状态应该是 `101 Switching Protocols`
- Type 应该是 `websocket`

## 常见问题

### 问题 1: WebSocket 连接失败
**错误信息**: `WebSocket connection to 'ws://localhost:3000/asr/stream' failed`

**原因**: 
- 前端直接连接后端，跨域被阻止
- 或者后端未启动

**解决**:
1. 确保使用相对路径连接
2. 确保 Vite 代理配置正确
3. 重启前端服务器

### 问题 2: 404 Not Found
**错误信息**: `404 Not Found`

**原因**: 
- 后端 WebSocket 路径不存在
- 或者后端未启动

**解决**:
1. 检查后端是否启动
2. 检查后端日志是否有 "Ali ASR Stream WebSocket service"
3. 确认路径是 `/asr/stream`

### 问题 3: 代理不生效
**原因**: 
- 修改配置后未重启
- 配置语法错误

**解决**:
1. 重启前端服务器
2. 检查 `vite.config.js` 语法
3. 查看终端是否有错误信息

### 问题 4: CORS 错误
**错误信息**: `CORS policy blocked`

**原因**: 
- WebSocket 握手时的跨域问题

**解决**:
- 确保 `changeOrigin: true`
- 使用相对路径连接

## 生产环境配置

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # HTTP API 代理
    location /asr {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket 代理
    location /asr/stream {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 关键配置

WebSocket 代理需要额外的头：
```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

## 测试步骤

1. **确认后端启动**
   ```bash
   cd backend
   npm start
   ```
   看到: `Ali ASR Stream WebSocket service: ws://localhost:3000/asr/stream`

2. **重启前端**
   ```bash
   cd frontend
   # Ctrl+C 停止
   npm run dev
   ```

3. **访问页面**
   ```
   http://localhost:5173/asr-stream
   ```

4. **测试连接**
   - 点击「开始实时识别」
   - 允许麦克风权限
   - 查看控制台日志

## 调试技巧

### 1. 查看 WebSocket 握手
在浏览器 Network 面板：
- 找到 WebSocket 连接
- 查看 Headers 标签
- 检查 Request Headers 和 Response Headers

### 2. 查看 WebSocket 消息
在 Network 面板：
- 点击 WebSocket 连接
- 切换到 Messages 标签
- 查看发送和接收的消息

### 3. 添加调试日志
```javascript
ws.onopen = () => {
  console.log('✅ WebSocket 已连接')
  console.log('ReadyState:', ws.readyState)
  console.log('URL:', ws.url)
}

ws.onerror = (error) => {
  console.error('❌ WebSocket 错误:', error)
  console.log('ReadyState:', ws.readyState)
}
```

## 总结

WebSocket 代理配置的关键点：
1. ✅ 在 `vite.config.js` 中添加 `ws: true`
2. ✅ 前端使用相对路径连接
3. ✅ 修改配置后重启前端服务器
4. ✅ 确保后端 WebSocket 服务已启动

配置正确后，WebSocket 连接应该能够正常建立，流式识别功能就可以使用了。
