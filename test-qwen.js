/**
 * 通义千问 API 测试脚本
 * 用于验证通义千问配置是否正确
 */

import OpenAI from 'openai';
import { config } from 'dotenv';

config({ path: './backend/.env' });

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_BASE_URL = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen-turbo';

console.log('🧪 通义千问 API 测试');
console.log('='.repeat(50));
console.log('配置信息:');
console.log(`  API Key: ${QWEN_API_KEY ? QWEN_API_KEY.substring(0, 10) + '...' : '未配置'}`);
console.log(`  Base URL: ${QWEN_BASE_URL}`);
console.log(`  Model: ${QWEN_MODEL}`);
console.log('='.repeat(50));

if (!QWEN_API_KEY) {
    console.error('❌ 错误: QWEN_API_KEY 未配置');
    console.log('\n请在 backend/.env 文件中添加:');
    console.log('QWEN_API_KEY=your_api_key_here');
    process.exit(1);
}

async function testQwen() {
    try {
        console.log('\n🚀 开始测试...\n');

        const client = new OpenAI({
            apiKey: QWEN_API_KEY,
            baseURL: QWEN_BASE_URL
        });

        const messages = [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: '你好，请用一句话介绍一下你自己。' }
        ];

        console.log('📤 发送请求...');
        console.log(`   问题: ${messages[1].content}`);

        const response = await client.chat.completions.create({
            model: QWEN_MODEL,
            messages: messages,
            stream: false
        });

        console.log('\n✅ 测试成功！');
        console.log('='.repeat(50));
        console.log('📨 响应内容:');
        console.log(response.choices[0].message.content);
        console.log('='.repeat(50));
        console.log('\n📊 使用统计:');
        console.log(`   Prompt Tokens: ${response.usage.prompt_tokens}`);
        console.log(`   Completion Tokens: ${response.usage.completion_tokens}`);
        console.log(`   Total Tokens: ${response.usage.total_tokens}`);
        console.log('\n🎉 通义千问配置正确，可以正常使用！');

    } catch (error) {
        console.error('\n❌ 测试失败！');
        console.error('错误信息:', error.message);
        
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }

        console.log('\n💡 常见问题:');
        console.log('1. 检查 API Key 是否正确');
        console.log('2. 确认账号是否已开通通义千问服务');
        console.log('3. 检查账号余额是否充足');
        console.log('4. 确认网络连接正常');
        
        process.exit(1);
    }
}

// 运行测试
testQwen();
