import mongoose from 'mongoose';
import { updateEmbeddingConfig, getRawConfigCached } from '../src/services/configService.js';

async function testEmbeddingConfig() {
  try {
    await mongoose.connect('mongodb://localhost:27017/chart-ai');
    console.log('✅ MongoDB Connected');
    
    // 测试更新为新格式的 Embedding 配置
    console.log('\n📝 更新为新格式 Embedding 配置...');
    
    const newEmbeddingConfig = {
      provider: 'siliconflow',
      providers: [
        {
          id: 'siliconflow',
          name: '硅基流动',
          apiKey: 'sk-jpoxqccvcdgotfwsnysjeuwtovqxffzfxpomwtcjrlloymfb',
          baseURL: 'https://api.siliconflow.cn/v1',
          model: 'BAAI/bge-m3',
          type: 'siliconflow'
        },
        {
          id: 'openai',
          name: 'OpenAI',
          apiKey: 'sk-test1234567890',
          baseURL: 'https://api.openai.com/v1',
          model: 'text-embedding-3-small',
          type: 'openai'
        }
      ]
    };
    
    await updateEmbeddingConfig(newEmbeddingConfig);
    console.log('✅ Embedding 配置更新成功');
    
    // 验证配置是否正确保存
    console.log('\n🔍 验证配置是否正确保存...');
    const config = await getRawConfigCached();
    
    if (config && config.embedding) {
      console.log('✅ 配置已保存:');
      console.log('默认提供商:', config.embedding.provider);
      console.log('提供商数量:', config.embedding.providers ? config.embedding.providers.length : 0);
      
      if (config.embedding.providers) {
        config.embedding.providers.forEach((provider, index) => {
          console.log(`\n提供商 ${index + 1}:`);
          console.log('  ID:', provider.id);
          console.log('  名称:', provider.name);
          console.log('  API Key:', provider.apiKey ? provider.apiKey.substring(0, 8) + '...' : '未配置');
          console.log('  Base URL:', provider.baseURL || '未配置');
          console.log('  模型:', provider.model || '未配置');
          console.log('  类型:', provider.type || '未配置');
        });
      }
    } else {
      console.log('❌ 配置保存失败');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testEmbeddingConfig();
