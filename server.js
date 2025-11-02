import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

// 获取__dirname的ES模块等价物
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

const app = express();
const port = 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist'))); // React构建后的文件在dist目录

// 初始化OpenAI客户端
const openai = new OpenAI({ 
    apiKey: process.env.API_KEY, 
    baseURL: 'https://api.deepseek.com' 
});

// 存储对话历史的内存存储（在生产环境中，你可能想要使用数据库）
const conversationHistories = new Map();

// 获取或创建用户对话历史
function getConversationHistory(userId) {
    if (!conversationHistories.has(userId)) {
        conversationHistories.set(userId, [
            { role: "system", content: "You are a helpful assistant." }
        ]);
    }
    return conversationHistories.get(userId);
}

// API端点：处理聊天消息（支持流式响应）
app.post('/chat', async (req, res) => {
    try {
        const { message, userId, stream } = req.body;
        
        console.log('Received request body:', req.body);
        console.log('Stream parameter:', stream);
        
        if (!message || !userId) {
            return res.status(400).json({ error: 'Missing message or userId' });
        }
        
        // 获取用户的对话历史
        const conversationHistory = getConversationHistory(userId);
        
        // 将用户消息添加到历史记录
        conversationHistory.push({ role: "user", content: message });
        
        if (stream) {
            console.log('Processing stream request');
            // 流式响应
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Transfer-Encoding', 'chunked');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            // 调用DeepSeek API（流式）
            const streamResponse = await openai.chat.completions.create({
                messages: conversationHistory,
                model: "deepseek-chat",
                stream: true,
            });
            
            // 收集完整响应以保存到历史记录
            let fullResponse = "";
            
            // 处理流式响应
            for await (const chunk of streamResponse) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    fullResponse += content;
                    // 确保写入成功
                    const writeSuccess = res.write(content);
                    // 如果写入不成功，可能需要等待
                    if (!writeSuccess) {
                        await new Promise(resolve => res.once('drain', resolve));
                    }
                }
            }
            
            // 将AI回复添加到历史记录
            conversationHistory.push({ role: "assistant", content: fullResponse });
            
            // 结束响应
            res.end();
        } else {
            console.log('Processing non-stream request');
            // 非流式响应（保持向后兼容）
            const completion = await openai.chat.completions.create({
                messages: conversationHistory,
                model: "deepseek-chat",
            });
            
            // 获取AI回复
            const aiResponse = completion.choices[0].message.content;
            
            // 将AI回复添加到历史记录
            conversationHistory.push({ role: "assistant", content: aiResponse });
            
            // 返回AI回复
            res.json({ message: aiResponse });
        }
    } catch (error) {
        console.error('Error:', error);
        // 对于流式响应，我们需要特殊处理错误
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.end();
        }
    }
});

// 主页路由
app.get('/', (req, res) => {
    // 对于React应用，我们提供构建后的index.html
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});