import KnowledgeBase from '../models/KnowledgeBaseSchema.js';
import KnowledgeDocument from '../models/KnowledgeDocumentSchema.js';
import KnowledgeChunk from '../models/KnowledgeChunkSchema.js';
import { processDocument, searchKnowledge, deleteDocument, deleteKnowledgeBase, previewDocumentChunks } from '../services/knowledgeService.js';
import { generateEmbedding } from '../services/embeddingService.js';
import { success, error } from '../../../utils/response.js';
import path from 'path';

/**
 * 知识库控制器
 */

export async function handleCreateKB(req, res, next) {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    const kb = new KnowledgeBase({
      name,
      description,
      creatorId: userId
    });

    await kb.save();
    return success(res, { kb }, '知识库创建成功', 201);
  } catch (err) {
    console.error('❌ 创建知识库失败:', err);
    next(err);
  }
}

export async function handleDeleteKB(req, res, next) {
  try {
    const { kbId } = req.params;
    const userId = req.user.userId;

    const kb = await KnowledgeBase.findOne({ _id: kbId, creatorId: userId });
    if (!kb) {
      return error(res, '知识库不存在或无权操作', 1006, 404);
    }

    await deleteKnowledgeBase(kbId);
    return success(res, null, '知识库已成功删除');
  } catch (err) {
    console.error('❌ 删除知识库失败:', err);
    next(err);
  }
}

export async function handleGetKBs(req, res, next) {
  try {
    const userId = req.user.userId;
    const kbs = await KnowledgeBase.find({ creatorId: userId }).sort({ createdAt: -1 });
    return success(res, kbs, '获取知识库列表成功');
  } catch (err) {
    console.error('❌ 获取知识库列表失败:', err);
    next(err);
  }
}

export async function handleUploadDoc(req, res, next) {
  try {
    const { kbId } = req.params;
    const file = req.file;

    if (!file) {
      return error(res, '未选择文件', 1001, 400);
    }

    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const doc = new KnowledgeDocument({
      kbId,
      name: originalName,
      type: file.mimetype,
      originalPath: file.path,
      fileSize: file.size,
      status: 'pending'
    });

    await doc.save();

    return success(res, { doc }, '文件上传成功，请手动触发解析', 202);
  } catch (err) {
    console.error('❌ 上传文档失败:', err);
    next(err);
  }
}

export async function handleProcessDoc(req, res, next) {
  try {
    const { docId } = req.params;
    console.log('📥 收到文档解析请求，docId:', docId);
    
    const doc = await KnowledgeDocument.findById(docId);
    
    if (!doc) {
      console.error('❌ 文档不存在，docId:', docId);
      return error(res, '文档不存在', 1006, 404);
    }

    console.log('📄 文档信息:', {
      name: doc.name,
      type: doc.type,
      size: doc.fileSize,
      status: doc.status
    });

    console.log('⏳ 启动异步解析任务...');
    processDocument(docId).catch(err => {
      console.error('❌ 文档异步处理失败:', err);
      console.error('❌ 错误堆栈:', err.stack);
    });

    console.log('✅ 解析任务已启动，返回响应给客户端');
    return success(res, { status: 'processing', docId }, '解析任务已启动', 202);
  } catch (err) {
    console.error('❌ 处理解析请求失败:', err);
    console.error('❌ 错误堆栈:', err.stack);
    next(err);
  }
}

export async function handleDeleteDoc(req, res, next) {
  try {
    const { docId } = req.params;
    await deleteDocument(docId);
    return success(res, null, '文档已删除');
  } catch (err) {
    console.error('❌ 删除文档失败:', err);
    next(err);
  }
}

export async function handleGetDocs(req, res, next) {
  try {
    const { kbId } = req.params;
    const docs = await KnowledgeDocument.find({ kbId }).sort({ createdAt: -1 });
    return success(res, { docs }, '获取文档列表成功');
  } catch (err) {
    console.error('❌ 获取文档列表失败:', err);
    next(err);
  }
}

export async function handleGetChunks(req, res, next) {
  try {
    const { docId } = req.params;
    const chunks = await KnowledgeChunk.find({ docId })
      .select('content metadata')
      .sort({ 'metadata.page': 1, createdAt: 1 });
    return success(res, { chunks }, '获取文档片段成功');
  } catch (err) {
    console.error('❌ 获取文档片段失败:', err);
    next(err);
  }
}

export async function handlePreviewChunks(req, res, next) {
  try {
    const { docId } = req.params;
    const chunks = await previewDocumentChunks(docId);
    return success(res, { chunks }, '预览分段成功');
  } catch (err) {
    console.error('❌ 预览分段失败:', err);
    next(err);
  }
}

export async function handleQueryKB(req, res, next) {
  try {
    const { kbId } = req.params;
    const { query } = req.body;

    if (!query) return error(res, '查询内容不能为空', 1001, 400);

    const vector = await generateEmbedding(query);
    const results = await searchKnowledge(kbId, vector);

    return success(res, { results }, '知识库查询成功');
  } catch (err) {
    console.error('❌ 知识库查询失败:', err);
    next(err);
  }
}
