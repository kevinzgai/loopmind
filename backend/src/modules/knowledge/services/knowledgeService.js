import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import mammoth from 'mammoth';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import KnowledgeBase from '../models/KnowledgeBaseSchema.js';
import KnowledgeDocument from '../models/KnowledgeDocumentSchema.js';
import KnowledgeChunk from '../models/KnowledgeChunkSchema.js';
import { generateEmbeddings } from './embeddingService.js';
import { 
  upsertChunks, 
  deleteChunksByDocId, 
  deleteChunksByKbId, 
  searchVector 
} from './vectorStoreService.js';

/**
 * 知识库业务服务
 */

/**
 * 预览文档分段（不进行 Embedding）
 */
export async function previewDocumentChunks(docId) {
  const doc = await KnowledgeDocument.findById(docId);
  if (!doc) throw new Error('文档不存在');

  // 1. 解析文本
  let text = '';
  const filePath = doc.originalPath;
  const fileExt = path.extname(doc.name).toLowerCase();
  
  if (doc.type === 'application/pdf' || fileExt === '.pdf') {
    const dataBuffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    text = data.text;
  } else if (doc.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExt === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    text = result.value;
  } else {
    // 默认为文本格式
    text = await fs.readFile(filePath, 'utf8');
  }

  // 2. 文本切分
  // BGE-large-zh-v1.5 上限 512 token，为安全起见设置较小的 chunk size
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 50,
  });
  const chunks = await splitter.splitText(text);

  return chunks;
}

/**
 * 处理上传的文档
 */
export async function processDocument(docId) {
  const doc = await KnowledgeDocument.findById(docId);
  if (!doc) throw new Error('文档不存在');

  try {
    doc.status = 'processing';
    await doc.save();

    // 1. 解析文本
    let text = '';
    const filePath = doc.originalPath;
    const fileExt = path.extname(doc.name).toLowerCase();
    
    if (doc.type === 'application/pdf' || fileExt === '.pdf') {
      const dataBuffer = await fs.readFile(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const data = await parser.getText();
      text = data.text;
    } else if (doc.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExt === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
    } else {
      // 默认为文本格式
      text = await fs.readFile(filePath, 'utf8');
    }

    doc.charCount = text.length;

    // 2. 文本切分
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 50,
    });
    const chunks = await splitter.splitText(text);
    doc.chunkCount = chunks.length;

    // 3. 向量化并存储
    // 批量处理 Embedding，避免请求过多
    const batchSize = 20;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batchChunks = chunks.slice(i, i + batchSize);
      const embeddings = await generateEmbeddings(batchChunks);

      const chunkDocs = batchChunks.map((content, idx) => ({
        kbId: doc.kbId,
        docId: doc._id,
        content,
        embedding: embeddings[idx],
        metadata: {
          source: doc.name,
          page: i + idx + 1
        }
      }));

      // 3.1 存入 MongoDB (作为元数据备份和管理)
      const savedChunks = await KnowledgeChunk.insertMany(chunkDocs);
      
      // 3.2 存入 LanceDB (用于向量搜索)
      // 使用 savedChunks 以获取 MongoDB 生成的 _id
      await upsertChunks(savedChunks);
    }

    doc.status = 'completed';
    await doc.save();

    // 更新知识库统计
    await updateKnowledgeBaseStats(doc.kbId);

    console.log(`✅ 文档处理完成: ${doc.name}`);
  } catch (error) {
    console.error(`❌ 文档处理失败 (${doc.name}):`, error.message);
    doc.status = 'failed';
    doc.error = error.message;
    await doc.save();
  }
}

/**
 * 删除文档及其关联数据
 */
export async function deleteDocument(docId) {
  const doc = await KnowledgeDocument.findById(docId);
  if (!doc) return;

  const kbId = doc.kbId;

  // 1. 删除向量块 (MongoDB)
  await KnowledgeChunk.deleteMany({ docId });
  
  // 2. 删除向量块 (LanceDB)
  await deleteChunksByDocId(docId);

  // 3. 删除本地物理文件
  if (doc.originalPath) {
    try {
      await fs.unlink(doc.originalPath);
    } catch (err) {
      console.warn(`⚠️ 无法删除物理文件 ${doc.originalPath}:`, err.message);
    }
  }

  // 4. 删除文档记录
  await KnowledgeDocument.findByIdAndDelete(docId);

  // 5. 更新知识库统计
  await updateKnowledgeBaseStats(kbId);
}

/**
 * 删除整个知识库及其所有关联数据
 */
export async function deleteKnowledgeBase(kbId) {
  // 1. 删除该库下的所有文档及其文件
  const docs = await KnowledgeDocument.find({ kbId });
  for (const doc of docs) {
    await deleteDocument(doc._id);
  }
  
  // 额外清理 LanceDB 中可能残留的该知识库数据
  await deleteChunksByKbId(kbId);

  // 2. 删除知识库记录
  await KnowledgeBase.findByIdAndDelete(kbId);
}

/**
 * 更新知识库统计信息
 */
export async function updateKnowledgeBaseStats(kbId) {
  const [docCount, chunkCount] = await Promise.all([
    KnowledgeDocument.countDocuments({ kbId, status: 'completed' }),
    KnowledgeChunk.countDocuments({ kbId })
  ]);

  await KnowledgeBase.findByIdAndUpdate(kbId, {
    documentCount: docCount,
    chunkCount: chunkCount
  });
}

/**
 * 语义搜索
 */
export async function searchKnowledge(kbId, queryVector, limit = 5) {
  try {
    // 使用 LanceDB 进行向量搜索
    const results = await searchVector(kbId, queryVector, limit);
    
    // 如果 LanceDB 返回结果，直接使用
    if (results && results.length > 0) {
      return results;
    }
    
    // 如果 LanceDB 无结果（可能是旧数据未迁移），尝试回退到 MongoDB 内存搜索（仅当 LanceDB 确实为空时）
    // 但为了避免复杂性，建议用户重新处理文档或运行迁移。
    // 这里我们可以做一个简单的检查：如果 MongoDB 有数据但 LanceDB 没有，提示警告
    const count = await KnowledgeChunk.countDocuments({ kbId });
    if (count > 0 && (!results || results.length === 0)) {
      console.warn(`⚠️ 知识库 ${kbId} 在 MongoDB 中有数据但在 LanceDB 中未找到，可能需要重新索引。`);
      // 临时降级：内存搜索 (为了兼容性保留)
      return await fallbackMemorySearch(kbId, queryVector, limit);
    }

    return results;

  } catch (error) {
    console.error('❌ 向量搜索失败:', error);
    // 降级策略：返回最新记录
    return await KnowledgeChunk.find({ kbId }).limit(limit).lean();
  }
}

/**
 * 内存搜索降级方案 (仅用于迁移过渡期)
 */
async function fallbackMemorySearch(kbId, queryVector, limit) {
  const chunks = await KnowledgeChunk.find({ kbId })
    .select('content embedding docId metadata')
    .lean();

  if (!chunks || chunks.length === 0) {
    return [];
  }

  const scoredChunks = chunks.map(chunk => {
    const score = cosineSimilarity(queryVector, chunk.embedding);
    return { ...chunk, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  
  return scoredChunks.slice(0, limit).map(chunk => {
    const { embedding, ...rest } = chunk;
    return rest;
  });
}

/**
 * 计算余弦相似度
 */
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
