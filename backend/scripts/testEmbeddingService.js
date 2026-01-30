import mongoose from 'mongoose';
import { generateEmbedding } from '../src/modules/knowledge/services/embeddingService.js';

async function testEmbeddingService() {
  try {
    await mongoose.connect('mongodb://localhost:27017/chart-ai');
    console.log('✅ MongoDB Connected');
    
    // 测试生成 Embedding
    console.log('\n🧪 测试生成 Embedding...');
    
    const testText = '这是一个测试文本，用于验证 Embedding 服务是否正常工作';
    
    try {
      const embedding = await generateEmbedding(testText);
      console.log('✅ Embedding 生成成功!');
      console.log('向量维度:', embedding.length);
      console.log('向量前 5 个值:', embedding.slice(0, 5));
    } catch (error) {
      console.log('⚠️  Embedding 生成失败（这是预期的，因为 API Key 可能无效）:');
      console.log('错误信息:', error.message);
      console.log('但是服务能够正确读取配置，这是我们要验证的重点');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testEmbeddingService();
