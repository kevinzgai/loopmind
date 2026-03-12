# Chart AI SDK 使用示例

## 安装

直接引用 SDK 文件：

```html
<script type="module">
  import ChartAI from './chart-ai-sdk.js';
</script>
```

## 快速开始

```javascript
import ChartAI from './chart-ai-sdk.js';

// 初始化
const ai = new ChartAI({
  baseURL: 'http://localhost:3002/api',
});

// 登录获取 Token
const { token, user } = await ai.auth.login('admin', 'admin@123');
ai.setToken(token);

console.log('登录成功:', user.username);
```

## 常用示例

### 1. 与智能体对话

```javascript
// 获取已发布的智能体
const { agents } = await ai.agents.published(1, 12);
const agent = agents[0];

// 创建对话
const conversation = await ai.agents.conversations.create(agent._id, '新对话');

// 流式对话
await ai.agents.chat(
  agent._id,
  conversation._id,
  '你好，请介绍一下你自己',
  (chunk, fullText) => {
    process.stdout.write(chunk); // 实时输出每个字符
  },
  (fullText) => {
    console.log('\n对话完成:', fullText.length, '字');
  }
);
```

### 2. 创建和管理智能体

```javascript
// 创建智能体
const agent = await ai.agents.create({
  name: 'Python 助手',
  description: '专业的 Python 编程助手',
  model: 'deepseek-chat',
  personality: '你是一个专业的 Python 编程助手，擅长解答编程问题',
  category: '编程',
  voiceConfig: {
    voice: 'Cherry',
    speechRate: 150,
  },
});

console.log('创建成功:', agent.name);

// 创建版本快照
const snapshot = await ai.agents.versions.create(agent._id, '初始版本');

// 更新智能体
await ai.agents.update(agent._id, {
  personality: '你是一个专业的 Python 和 JavaScript 编程助手',
});

// 回滚到版本 1
await ai.agents.versions.rollback(agent._id, 1);

// 发布智能体
await ai.agents.publish(agent._id);
```

### 3. 知识库操作

```javascript
// 创建知识库
const kb = await ai.knowledge.create({
  name: '产品文档',
  description: '产品使用手册和 FAQ',
});

// 上传文档（使用 FormData）
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch(`${ai.baseURL}/knowledge/${kb._id}/documents`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${ai.token}` },
  body: formData,
});

const result = await response.json();
console.log('文档上传成功:', result.data);
```

### 4. 创建和执行工作流

```javascript
// 创建工作流
const workflow = await ai.workflow.create({
  name: '问答工作流',
  nodes: [
    {
      id: 'input',
      type: 'input',
      label: '用户问题',
      position: { x: 100, y: 100 },
      data: { variableName: 'question' },
    },
    {
      id: 'llm',
      type: 'llm',
      label: 'AI 回答',
      position: { x: 300, y: 100 },
      data: { model: 'deepseek-chat', prompt: '请回答: {{question}}' },
    },
    {
      id: 'output',
      type: 'output',
      label: '输出',
      position: { x: 500, y: 100 },
      data: { outputName: 'answer', value: '{{llm}}' },
    },
  ],
  edges: [
    { id: 'e1', source: 'input', target: 'llm' },
    { id: 'e2', source: 'llm', target: 'output' },
  ],
});

// 发布并执行
await ai.workflow.publish(workflow._id);
const result = await ai.workflow.execute(workflow._id, {
  question: '什么是机器学习？',
});

console.log('执行结果:', result);
```

### 5. 使用工具

```javascript
// 获取内置工具
const builtinTools = await ai.tools.builtin();
console.log('内置工具:', builtinTools.map(t => t.name));

// 执行计算器工具
const calcTool = builtinTools.find(t => t.name === 'calculator');
const calcResult = await ai.tools.execute(calcTool._id, {
  expression: '(100 + 50) * 2',
});
console.log('计算结果:', calcResult.data.result); // 300

// 创建自定义 HTTP 工具
const customTool = await ai.tools.create({
  name: 'my_api',
  description: '调用我的自定义 API',
  type: 'http',
  httpConfig: {
    method: 'GET',
    url: 'https://api.example.com/data?id={id}',
    timeout: 10000,
  },
  inputs: [
    { name: 'id', type: 'string', description: 'ID', required: true },
  ],
});
```

### 6. 数据分析

```javascript
// 获取 30 天概览
const overview = await ai.analytics.overview(30);
console.log('总对话数:', overview.totalConversations);
console.log('总消息数:', overview.totalMessages);

// 获取热词
const hotWords = await ai.analytics.hotWords(20, 30);
hotWords.forEach(({ word, count }) => {
  console.log(`${word}: ${count} 次`);
});

// 获取每日趋势
const trend = await ai.analytics.dailyTrend(7);
tend.forEach(({ date, count }) => {
  console.log(`${date}: ${count} 次对话`);
});
```

### 7. 团队工作空间

```javascript
// 创建工作空间
const workspace = await ai.workspace.create({
  name: '研发团队',
  description: '技术研发协作空间',
});

// 生成邀请码（24小时有效）
const { code, expiry } = await ai.workspace.inviteCode.generate(workspace._id, 24);
console.log(`邀请码: ${code}，有效期至: ${expiry}`);

// 成员通过邀请码加入
const joined = await ai.workspace.inviteCode.join('ABCD1234');
console.log('加入成功:', joined.name);

// 邀请特定用户（需要知道 userId）
await ai.workspace.members.invite(workspace._id, targetUserId, 'editor');
```

### 8. 导出对话

```javascript
// 导出为 Markdown（直接下载）
ai.export.conversation(conversationId, 'markdown');

// 导出为 JSON
ai.export.conversation(conversationId, 'json');

// 导出为 CSV
ai.export.conversation(conversationId, 'csv');
```

### 9. 审计日志

```javascript
// 查询最近的智能体创建操作
const logs = await ai.audit.list({
  action: 'agent.create',
  limit: 20,
});

// 获取 7 天统计
const stats = await ai.audit.stats(7);
console.log('操作类型分布:', stats.actionStats);
```

### 10. 健康检查

```javascript
const health = await ai.health();
console.log('服务状态:', health.status);      // ok
console.log('运行时长:', health.uptime, '秒');
console.log('缓存命中率:', health.cache.hitRate);
```

## 错误处理

```javascript
try {
  const agent = await ai.agents.get('invalid_id');
} catch (error) {
  console.error('错误:', error.message); // "智能体不存在"
}
```

## 在 Vue 3 中使用

```javascript
// composables/useChartAI.js
import { ref } from 'vue';
import ChartAI from '@/lib/chart-ai-sdk.js';
import { useAuthStore } from '@/stores/authStore.js';

export function useChartAI() {
  const authStore = useAuthStore();

  const ai = new ChartAI({
    baseURL: import.meta.env.VITE_API_URL || '/api',
  });

  // 自动使用当前登录 token
  if (authStore.token) {
    ai.setToken(authStore.token);
  }

  return ai;
}

// 在组件中使用
import { useChartAI } from '@/composables/useChartAI.js';

const ai = useChartAI();
const agents = await ai.agents.published();
```
