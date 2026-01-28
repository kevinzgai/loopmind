
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchKnowledge } from '../src/modules/knowledge/services/knowledgeService.js';
import { generateEmbedding } from '../src/modules/knowledge/services/embeddingService.js';
import KnowledgeBase from '../src/modules/knowledge/models/KnowledgeBaseSchema.js';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chart-ai';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
}

async function testSearch() {
  await connectDB();

  try {
    // 1. 获取一个存在的知识库 ID
    const kb = await KnowledgeBase.findOne();
    if (!kb) {
      console.log('⚠️ 没有找到任何知识库，跳过测试。');
      return;
    }
    console.log(`🔍 使用知识库: ${kb.name} (ID: ${kb._id})`);

    // 2. 构造一个测试查询
    const queryText = "测试查询内容";
    console.log(`❓ 查询文本: "${queryText}"`);

    // 3. 生成向量
    console.log('🔄 正在生成查询向量...');
    const queryVector = await generateEmbedding(queryText);
    console.log(`✅ 向量生成成功 (维度: ${queryVector.length})`);

    // 4. 执行搜索
    console.log('🔎 正在 LanceDB 中搜索...');
    const results = await searchKnowledge(kb._id, queryVector, 3);

    // 5. 展示结果
    console.log('\n📊 搜索结果:');
    if (results.length === 0) {
      console.log('   (无结果)');
    } else {
      results.forEach((item, index) => {
        console.log(`   ${index + 1}. [得分: ${item.score?.toFixed(4)}] ${item.content.substring(0, 50)}...`);
      });
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testSearch();
