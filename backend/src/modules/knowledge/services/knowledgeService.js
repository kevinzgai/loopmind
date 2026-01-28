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
    // BGE-large-zh-v1.5 上限 512 token，为安全起见设置较小的 chunk size
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

      await KnowledgeChunk.insertMany(chunkDocs);
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

  // 1. 删除向量块
  await KnowledgeChunk.deleteMany({ docId });

  // 2. 删除本地物理文件
  if (doc.originalPath) {
    try {
      await fs.unlink(doc.originalPath);
    } catch (err) {
      console.warn(`⚠️ 无法删除物理文件 ${doc.originalPath}:`, err.message);
    }
  }

  // 3. 删除文档记录
  await KnowledgeDocument.findByIdAndDelete(docId);

  // 4. 更新知识库统计
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
  // 注意：如果是本地 MongoDB，不支持直接的向量搜索，
  // 只能进行全量召回或简单的文本匹配。
  // 这里实现一个简单的内存向量余弦相似度搜索（适用于中小规模数据）
  
  try {
    // 1. 获取该知识库所有片段（只查询必要字段以减少传输）
    const chunks = await KnowledgeChunk.find({ kbId })
      .select('content embedding docId metadata')
      .lean();

    if (!chunks || chunks.length === 0) {
      return [];
    }

    // 2. 计算余弦相似度
    const scoredChunks = chunks.map(chunk => {
      const score = cosineSimilarity(queryVector, chunk.embedding);
      return { ...chunk, score };
    });

    // 3. 排序并取 Top K
    scoredChunks.sort((a, b) => b.score - a.score);
    
    // 4. 返回结果（去掉 embedding 字段以减小响应体积）
    return scoredChunks.slice(0, limit).map(chunk => {
      const { embedding, ...rest } = chunk;
      return rest;
    });

  } catch (error) {
    console.error('❌ 向量搜索失败:', error);
    // 降级策略：返回最新记录
    return await KnowledgeChunk.find({ kbId }).limit(limit).lean();
  }
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
