# ECONNRESET 错误解决方案

## 错误信息

```
[vite] ws proxy socket error:
Error: read ECONNRESET
at TCP.onStreamRead (node:internal/stream_base_commons:216:20)
```

## 错误含义

`ECONNRESET` = "Connection Reset"（连接被重置）

这个错误说明：
1. ✅ **Vite 代理配置正确** - 能够找到 `/asr/stream` 路径
2. ✅ **Vite 正在尝试连接后端** - `ws://localhost:3000/asr/stream`
3. ❌ **后端没有正确响应** - 连接被拒绝或重置

## 根本原因

**后端 WebSocket 服务器没有启动！**

可能的情况：
1. 后端还在运行旧代码（没有重启）
2. 后端启动时出错（WebSocket 服务器没有创建）
3. 后端的 `server.js` 没有正确修改

## 解决方案

### 方法 1: 使用一键重启脚本（最简单）

双击运行项目根目录的 `restart-backend.bat` 文件。

这个脚本会：
1. 停止所有 Node 进程
2. 重新启动后端服务
3. 打开新窗口显示后端日志

**验证成功的标志**：
在新打开的窗口中看到：
```
Ali ASR Stream WebSocket service: ws://localhost:3000/asr/stream
```

### 方法 2: 手动重启（推荐理解流程）

#### 步骤 1: 找到后端终端

查找显示以下内容的终端窗口：
```
Server running at http://localhost:3000
```

#### 步骤 2: 停止后端

在该终端按 `Ctrl+C`

#### 步骤 3: 重新启动

```bash
npm start
```

#### 步骤 4: 验证启动成功

**必须看到以下完整日志**：
```
Server running at http://localhost:3000
WebSocket server is running on the same port
Seed-ASR WebSocket service: ws://localhost:3000/seed-asr
Ali ASR Stream WebSocket service: ws://localhost:3000/asr/stream  ← 必须有这行！
```

如果**没有最后一行**，说明：
- `backend/src/server.js` 没有正确修改
- 或者有语法错误
- 或者 `aliAsrStreamService.js` 文件不存在

### 方法 3: 强制停止所有进程

如果找不到后端终端窗口：

#### Windows PowerShell:
```powershell
# 停止所有 Node 进程
taskkill /F /IM node.exe

# 重新启动后端
cd backend
npm start
```

#### 或者使用端口查找：
```cmd
# 查找占用 3000 端口的进程
netstat -ano | findstr :3000

# 停止该进程（替换 <PID> 为实际的进程 ID）
taskkill /PID <PID> /F

# 重新启动
cd backend
npm start
```

## 验证步骤

### 1. 检查后端日志

后端启动后，**必须看到**：
```
Ali ASR Stream WebSocket service: ws://localhost:3000/asr/stream
```

### 2. 测试直接连接

打开 `test-websocket.html`（在浏览器中）：
```
file:///C:/Users/Administrator/Desktop/aichat/test-websocket.html
```

点击「测试直接连接」，应该看到：
```
✅ 连接成功！
```

### 3. 测试前端连接

访问 `http://localhost:5173/asr-stream`

点击「开始实时识别」，应该能正常连接。

**前端控制台应该看到**：
```
🔗 连接到: ws://localhost:5173/asr/stream
✅ WebSocket 连接已建立
```

**不应该再看到**：
```
❌ [vite] ws proxy socket error: ECONNRESET
```

## 常见问题

### Q1: 重启后还是 ECONNRESET

**检查**：
1. 后端日志是否有 "Ali ASR Stream WebSocket service"
2. 是否有其他错误信息
3. 端口 3000 是否被其他程序占用

**解决**：
```bash
# 检查端口占用
netstat -ano | findstr :3000

# 如果有其他程序占用，停止它或修改后端端口
```

### Q2: 后端启动时报错

**常见错误 1**: 端口被占用
```
Error: listen EADDRINUSE: address already in use :::3000
```
**解决**: 停止占用 3000 端口的进程

**常见错误 2**: 模块未找到
```
Error: Cannot find module './services/aliAsrStreamService.js'
```
**解决**: 检查文件是否存在，路径是否正确

**常见错误 3**: 语法错误
```
SyntaxError: Unexpected token
```
**解决**: 检查代码语法，运行 `node --check backend/src/server.js`

### Q3: 看不到 "Ali ASR Stream WebSocket service" 日志

**原因**: `server.js` 没有正确修改

**解决**: 检查 `backend/src/server.js` 是否包含：

```javascript
import { handleStreamConnection } from './services/aliAsrStreamService.js';

const asrStreamWss = new WebSocketServer({ 
  server: httpServer, 
  path: '/asr/stream' 
});

asrStreamWss.on('connection', (ws) => {
    console.log('🎙️ 阿里云流式 ASR 客户端已连接');
    handleStreamConnection(ws);
});

// 在 httpServer.listen 中添加日志
console.log(`Ali ASR Stream WebSocket service: ws://localhost:${PORT}/asr/stream`);
```

## 错误对比

### ECONNRESET（当前错误）
```
[vite] ws proxy socket error: Error: read ECONNRESET
```
**含义**: Vite 能找到路径，但后端没有响应
**原因**: 后端 WebSocket 服务器没有启动
**解决**: 重启后端

### 404 Not Found（之前的错误）
```
WebSocket connection to 'ws://localhost:5173/asr/stream' failed: 404
```
**含义**: Vite 代理配置错误，找不到路径
**原因**: 代理配置顺序错误或路径不匹配
**解决**: 修改 `vite.config.js`

### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:3000
```
**含义**: 后端完全没有运行
**原因**: 后端服务器没有启动
**解决**: 启动后端

## 完整的解决流程

```
1. 停止后端服务
   ↓
2. 重新启动后端
   ↓
3. 验证日志中有 "Ali ASR Stream WebSocket service"
   ↓
4. 使用 test-websocket.html 测试直接连接
   ↓
5. 刷新前端页面
   ↓
6. 测试流式识别功能
   ↓
7. 成功！
```

## 成功的标志

### 后端日志
```
Server running at http://localhost:3000
WebSocket server is running on the same port
Seed-ASR WebSocket service: ws://localhost:3000/seed-asr
Ali ASR Stream WebSocket service: ws://localhost:3000/asr/stream ✅
```

### 前端日志（浏览器控制台）
```
🔗 连接到: ws://localhost:5173/asr/stream
✅ WebSocket 连接已建立 ✅
📨 收到消息: {type: 'started'} ✅
```

### 前端 Vite 日志
```
✅ 没有 ECONNRESET 错误
```

### 后端接收连接日志
```
🎙️ 阿里云流式 ASR 客户端已连接 ✅
📞 新的流式识别连接 ✅
🔗 连接到阿里云 ASR... ✅
```

## 总结

**ECONNRESET 错误 = 后端没有重启**

**解决方法**：
1. 最简单：双击 `restart-backend.bat`
2. 手动：停止后端 → 重新启动 → 验证日志
3. 强制：`taskkill /F /IM node.exe` → 重新启动

**验证成功**：
- 后端日志有 "Ali ASR Stream WebSocket service"
- `test-websocket.html` 能连接成功
- 前端不再出现 ECONNRESET 错误
- 流式识别功能正常工作

按照以上步骤操作，问题应该能够解决！
