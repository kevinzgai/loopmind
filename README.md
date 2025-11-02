# AI Chat Application

一个基于Vue 3和Express.js的现代化AI聊天应用，支持与AI模型进行实时对话，并具备对话历史记忆功能。

## 目录结构

```
aichat/
├── backend/                 # 后端项目
│   ├── src/                 # 源代码目录
│   │   ├── app.js           # Express应用配置
│   │   ├── server.js        # 服务器启动文件
│   │   ├── config/          # 配置文件
│   │   ├── controllers/     # 控制器
│   │   ├── routes/          # 路由定义
│   │   ├── services/        # 服务层
│   │   ├── middleware/      # 中间件
│   │   └── utils/           # 工具函数
│   └── package.json         # 后端项目配置
├── frontend/                # 前端项目
└── package.json             # 根项目配置
```

## 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **Vite** - 快速的构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **Marked.js** - Markdown解析器
- **DOMPurify** - HTML清理库

### 后端
- **Node.js** - JavaScript运行时
- **Express.js** - Web应用框架
- **OpenAI API** - AI服务接口
- **dotenv** - 环境变量管理

## 功能特性

1. **实时对话** - 支持与AI进行实时对话
2. **流式响应** - AI回复内容逐字显示，模拟真实对话体验
3. **对话历史** - 记住用户与AI的对话历史，实现上下文理解
4. **Markdown渲染** - 支持Markdown格式的内容渲染
5. **响应式设计** - 适配不同屏幕尺寸的现代化界面
6. **安全性** - 使用DOMPurify清理HTML内容，防止XSS攻击

## 安装与运行

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装步骤

1. 克隆项目仓库：
   ```bash
   git clone <repository-url>
   cd aichat
   ```

2. 安装前后端依赖：
   ```bash
   # 安装根目录依赖
   npm install
   
   # 安装后端依赖
   cd backend
   npm install
   cd ..
   
   # 安装前端依赖
   cd frontend
   npm install
   cd ..
   ```

3. 配置环境变量：
   在项目根目录创建 `.env` 文件：
   ```env
   API_KEY=your_api_key_here
   BASE_URL=https://api.deepseek.com
   MODEL=deepseek-chat
   PORT=3000
   ```

### 运行项目

#### 开发模式
```bash
# 同时启动前后端开发服务器
npm run dev

# 或者分别启动
# 启动后端服务器
npm run dev:backend

# 启动前端开发服务器
npm run dev:frontend
```

#### 生产模式
```bash
# 构建前端应用
npm run build

# 启动生产服务器
npm start
```

## API接口

### 聊天接口
- **URL**: `/chat`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "message": "你的问题",
    "userId": "用户标识符",
    "stream": true // 是否启用流式响应
  }
  ```
- **响应**:
  - 流式响应: 逐字返回AI回复内容
  - 非流式响应: 返回完整的JSON对象

## 项目架构

### 前端架构
- 使用Vue 3 Composition API
- 组件化设计，易于维护和扩展
- Tailwind CSS实现现代化UI
- Marked.js处理Markdown渲染

### 后端架构
- 模块化设计，职责分离
- 控制器-服务-路由三层架构
- 统一错误处理机制
- 环境变量配置管理

## 配置说明

### 环境变量
| 变量名     | 描述             | 默认值                  |
|------------|------------------|-------------------------|
| API_KEY    | AI服务API密钥    | 无                      |
| BASE_URL   | AI服务基础URL    | https://api.deepseek.com |
| MODEL      | AI模型名称       | deepseek-chat           |
| PORT       | 服务器端口       | 3000                    |

## 开发指南

### 添加新功能
1. 在相应的目录中创建新文件
2. 遵循现有的代码风格和架构模式
3. 添加必要的测试

### 代码风格
- 使用ES6+语法
- 遵循JavaScript Standard Style
- 组件和函数使用描述性命名

### 测试
- 单元测试使用Jest
- 端到端测试使用Cypress

## 部署

### 部署到服务器
1. 构建前端应用：
   ```bash
   npm run build
   ```

2. 上传代码到服务器

3. 安装依赖：
   ```bash
   npm install
   cd backend && npm install
   ```

4. 配置环境变量

5. 启动服务器：
   ```bash
   npm start
   ```

## 常见问题

### 1. API密钥无效
确保在 `.env` 文件中正确配置了API_KEY。

### 2. 端口被占用
修改 `.env` 文件中的PORT变量，或终止占用端口的进程。

### 3. 前端白屏
检查后端服务是否正常运行，以及网络连接是否正常。

## 贡献

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License

## 联系方式

如有问题，请提交Issue或联系项目维护者。