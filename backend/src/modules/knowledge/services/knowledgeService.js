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
  console.log('🔍 开始预览文档分段，docId:', docId);
  const doc = await KnowledgeDocument.findById(docId);
  if (!doc) throw new Error('文档不存在');
  
  console.log('📄 文档信息:', {
    name: doc.name,
    type: doc.type,
    size: doc.fileSize
  });

  // 1. 解析文本
  console.log('📖 开始解析文本...');
  let text = '';
  const filePath = doc.originalPath;
  const fileExt = path.extname(doc.name).toLowerCase();
  
  if (doc.type === 'application/pdf' || fileExt === '.pdf') {
    console.log('📑 检测到 PDF 文件，开始解析...');
    const dataBuffer = await fs.readFile(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    text = data.text;
    console.log('✅ PDF 解析完成，文本长度:', text.length);
  } else if (doc.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExt === '.docx') {
    console.log('📝 检测到 DOCX 文件，开始解析...');
    const result = await mammoth.extractRawText({ path: filePath });
    text = result.value;
    console.log('✅ DOCX 解析完成，文本长度:', text.length);
  } else {
    console.log('📄 检测到文本文件，开始读取...');
    text = await fs.readFile(filePath, 'utf8');
    console.log('✅ 文本文件读取完成，文本长度:', text.length);
  }

  if (!text || text.trim().length === 0) {
    throw new Error('解析的文本为空');
  }

  // 2. 文本切分
  console.log('✂️  开始文本切分...');
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 400,
    chunkOverlap: 50,
  });
  const chunks = await splitter.splitText(text);
  console.log('✅ 文本切分完成，生成', chunks.length, '个片段');
  
  // 显示前几个片段的内容预览
  console.log('📝 片段预览（前3个）:');
  chunks.slice(0, 3).forEach((chunk, idx) => {
    console.log(`   片段 ${idx + 1}:`, chunk.substring(0, 100) + (chunk.length > 100 ? '...' : ''));
  });

  console.log('✅ 预览完成，返回', chunks.length, '个片段');
  return chunks;
}

/**
 * 处理上传的文档
 */
export async function processDocument(docId) {
  console.log('🚀 开始处理文档，docId:', docId);
  const doc = await KnowledgeDocument.findById(docId);
  if (!doc) throw new Error('文档不存在');
  
  console.log('📄 文档信息:', {
    name: doc.name,
    type: doc.type,
    size: doc.fileSize,
    status: doc.status
  });
  
  try {
    console.log('⏳ 更新文档状态为 processing...');
    doc.status = 'processing';
    await doc.save();

    // 1. 解析文本
    console.log('📖 开始解析文本...');
    let text = '';
    const filePath = doc.originalPath;
    const fileExt = path.extname(doc.name).toLowerCase();
    
    if (doc.type === 'application/pdf' || fileExt === '.pdf') {
      console.log('📑 检测到 PDF 文件，开始解析...');
      const dataBuffer = await fs.readFile(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const data = await parser.getText();
      text = data.text;
      console.log('✅ PDF 解析完成，文本长度:', text.length);
    } else if (doc.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileExt === '.docx') {
      console.log('📝 检测到 DOCX 文件，开始解析...');
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value;
      console.log('✅ DOCX 解析完成，文本长度:', text.length);
    } else {
      console.log('📄 检测到文本文件，开始读取...');
      text = await fs.readFile(filePath, 'utf8');
      console.log('✅ 文本文件读取完成，文本长度:', text.length);
    }

    if (!text || text.trim().length === 0) {
      throw new Error('解析的文本为空');
    }

    doc.charCount = text.length;
    console.log('📊 文档字符数:', doc.charCount);

    // 2. 文本切分
    console.log('✂️  开始文本切分...');
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 400,
      chunkOverlap: 50,
    });
    const chunks = await splitter.splitText(text);
    doc.chunkCount = chunks.length;
    console.log('✅ 文本切分完成，生成', chunks.length, '个片段');
    
    // 显示前几个片段的内容预览
    console.log('📝 片段预览（前3个）:');
    chunks.slice(0, 3).forEach((chunk, idx) => {
      console.log(`   片段 ${idx + 1}:`, chunk.substring(0, 100) + (chunk.length > 100 ? '...' : ''));
    });

    // 3. 向量化并存储
    console.log('🧠 开始向量化处理...');
    const batchSize = 10;
    const totalBatches = Math.ceil(chunks.length / batchSize);
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batchNum = Math.floor(i / batchSize) + 1;
      const batchChunks = chunks.slice(i, i + batchSize);
      
      console.log(`📦 处理批次 ${batchNum}/${totalBatches}，片段数量: ${batchChunks.length}`);
      
      const embeddings = await generateEmbeddings(batchChunks);
      console.log(`✅ 批次 ${batchNum} 向量化完成`);

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
      console.log(`💾 批次 ${batchNum} 保存到 MongoDB...`);
      const savedChunks = await KnowledgeChunk.insertMany(chunkDocs);
      console.log(`✅ 批次 ${batchNum} 已保存 ${savedChunks.length} 个片段到 MongoDB`);
      
      // 3.2 存入 LanceDB (用于向量搜索)
      // 使用 savedChunks 以获取 MongoDB 生成的 _id
      console.log(`💾 批次 ${batchNum} 保存到 LanceDB...`);
      await upsertChunks(savedChunks);
      console.log(`✅ 批次 ${batchNum} 已保存到 LanceDB`);
    }

    doc.status = 'completed';
    await doc.save();

    // 更新知识库统计
    console.log('📊 更新知识库统计信息...');
    await updateKnowledgeBaseStats(doc.kbId);

    console.log(`✅ 文档处理完成: ${doc.name}`);
    console.log('📊 处理结果:', {
      status: 'completed',
      charCount: doc.charCount,
      chunkCount: doc.chunkCount
    });
  } catch (error) {
    console.error(`❌ 文档处理失败 (${doc.name}):`, error.message);
    console.error('❌ 错误堆栈:', error.stack);
    doc.status = 'failed';
    doc.error = error.message;
    await doc.save();
    throw error;
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
