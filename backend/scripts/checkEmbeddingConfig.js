import mongoose from 'mongoose';
import Config from '../src/models/ConfigSchema.js';

async function checkEmbeddingConfig() {
  try {
    await mongoose.connect('mongodb://localhost:27017/chart-ai');
    console.log('✅ MongoDB Connected');
    
    const config = await Config.findOne({});
    
    if (config) {
      console.log('\n📊 当前 Embedding 配置状态:');
      console.log('原始 embedding 字段:', config.embedding);
      
      // 检查是否有 providers 字段（新格式）
      if (config.embedding?.providers) {
        console.log('\n✅ 检测到新格式配置:');
        console.log('默认提供商:', config.embedding.provider);
        console.log('提供商数量:', config.embedding.providers.length);
        config.embedding.providers.forEach((provider, index) => {
          console.log(`\n提供商 ${index + 1}:`);
          console.log('  ID:', provider.id);
          console.log('  名称:', provider.name);
          console.log('  API Key:', provider.apiKey ? provider.apiKey.substring(0, 8) + '...' : '未配置');
          console.log('  Base URL:', provider.baseURL || '未配置');
          console.log('  模型:', provider.model || '未配置');
          console.log('  类型:', provider.type || '未配置');
        });
      } else {
        console.log('\n⚠️  检测到旧格式配置，只有单个 embedding 配置');
      }
    } else {
      console.log('\n❌ 未找到配置文档');
    }
    
  } catch (error) {
    console.error('❌ 检查配置失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkEmbeddingConfig();
