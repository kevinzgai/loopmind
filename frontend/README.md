# AI Chat Frontend

AI聊天应用的前端部分，基于Vue 3和Vite构建的现代化用户界面。

## 技术栈

- **Vue 3** - 渐进式JavaScript框架，使用Composition API
- **Vite** - 快速的构建工具
- **Tailwind CSS** - 实用优先的CSS框架
- **Marked.js** - Markdown解析器
- **DOMPurify** - HTML清理库

## 项目结构

```
frontend/
├── src/                    # 源代码目录
│   ├── App.vue             # 主应用组件
│   ├── main.js             # 应用入口文件
│   └── assets/             # 静态资源
│       └── tailwind.css    # Tailwind CSS样式文件
├── index.html              # HTML模板
├── vite.config.js          # Vite配置文件
├── tailwind.config.js      # Tailwind CSS配置
├── postcss.config.js       # PostCSS配置
├── package.json            # 项目依赖和脚本
└── README.md               # 项目说明文档
```

## 功能特性

1. **实时聊天界面** - 现代化的聊天界面设计
2. **流式响应显示** - AI回复内容逐字显示，模拟真实对话体验
3. **Markdown渲染** - 支持Markdown格式的内容渲染
4. **响应式设计** - 适配不同屏幕尺寸
5. **安全性** - 使用DOMPurify清理HTML内容，防止XSS攻击

## 安装与运行

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 组件说明

### App.vue
主应用组件，包含以下功能：
- 聊天界面布局
- 消息显示区域
- 输入框和发送按钮
- Markdown渲染
- 流式响应处理

### 样式系统
- 使用Tailwind CSS实现现代化UI
- 自定义滚动条样式
- Markdown内容专用样式类

## API集成

前端通过fetch API与后端通信：

### 聊天接口
- **URL**: `/chat`
- **方法**: `POST`
- **请求体**:
  ```json
  {
    "message": "用户消息",
    "userId": "用户标识符",
    "stream": true
  }
  ```

### 流式响应处理
使用ReadableStream逐块接收服务器发送的内容，并实时更新DOM实现逐字显示效果。

## 样式定制

### Tailwind CSS
项目使用Tailwind CSS作为主要的样式框架，通过实用类快速构建界面。

### 自定义样式
在`src/assets/tailwind.css`中添加了自定义样式：
- 滚动条样式
- Markdown内容渲染样式

## 开发指南

### 添加新功能
1. 在`src`目录中创建新组件
2. 在`App.vue`中集成新功能
3. 使用Tailwind CSS类进行样式设计

### 代码风格
- 遵循Vue 3 Composition API风格
- 使用Tailwind CSS实用类
- 组件命名使用PascalCase

### 注意事项
- 确保后端服务正常运行
- 注意跨域问题
- Markdown渲染使用DOMPurify进行安全清理

## 部署

### 构建项目
```bash
npm run build
```

构建后的文件将输出到`dist`目录。

### 部署配置
确保服务器正确配置静态文件服务，并将API请求代理到后端服务。

## 常见问题

### 1. 样式未生效
确保在`main.js`中正确导入了CSS文件。

### 2. API请求失败
检查后端服务是否正常运行，以及网络连接是否正常。

### 3. Markdown渲染异常
检查Markdown内容是否符合标准语法。

## 贡献

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License