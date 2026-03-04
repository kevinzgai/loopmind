import KnowledgeBase from '../models/KnowledgeBaseSchema.js';
import KnowledgeDocument from '../models/KnowledgeDocumentSchema.js';
import KnowledgeChunk from '../models/KnowledgeChunkSchema.js';
import { processDocument, searchKnowledge, deleteDocument, deleteKnowledgeBase, previewDocumentChunks } from '../services/knowledgeService.js';
import { generateEmbedding } from '../services/embeddingService.js';
import path from 'path';

/**
 * 知识库控制器
 */

// 创建知识库
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
    res.status(201).json({ message: '知识库创建成功', kb });
  } catch (error) {
    next(error);
  }
}

// 删除知识库
export async function handleDeleteKB(req, res, next) {
  try {
    const { kbId } = req.params;
    const userId = req.user.userId;

    const kb = await KnowledgeBase.findOne({ _id: kbId, creatorId: userId });
    if (!kb) {
      return res.status(404).json({ error: '知识库不存在或无权操作' });
    }

    await deleteKnowledgeBase(kbId);
    res.status(200).json({ message: '知识库已成功删除' });
  } catch (error) {
    next(error);
  }
}

// 获取知识库列表
export async function handleGetKBs(req, res, next) {
  try {
    const userId = req.user.userId;
    const kbs = await KnowledgeBase.find({ creatorId: userId }).sort({ createdAt: -1 });
    res.status(200).json({ kbs });
  } catch (error) {
    next(error);
  }
}

// 上传文档
export async function handleUploadDoc(req, res, next) {
  try {
    const { kbId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: '未选择文件' });
    }

    // 修复中文文件名乱码问题 (Multer 默认使用 latin1 编码)
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

    // 取消自动解析逻辑，改为手动触发
    // processDocument(doc._id).catch(err => {
    //   console.error('❌ 文档异步处理失败:', err);
    // });

    res.status(202).json({ message: '文件上传成功，请手动触发解析', doc });
  } catch (error) {
    next(error);
  }
}

// 手动解析文档
export async function handleProcessDoc(req, res, next) {
  try {
    const { docId } = req.params;
    console.log('📥 收到文档解析请求，docId:', docId);
    
    const doc = await KnowledgeDocument.findById(docId);
    
    if (!doc) {
      console.error('❌ 文档不存在，docId:', docId);
      return res.status(404).json({ error: '文档不存在' });
    }

    console.log('📄 文档信息:', {
      name: doc.name,
      type: doc.type,
      size: doc.fileSize,
      status: doc.status
    });

    // 异步执行解析逻辑
    console.log('⏳ 启动异步解析任务...');
    processDocument(docId).catch(err => {
      console.error('❌ 文档异步处理失败:', err);
      console.error('❌ 错误堆栈:', err.stack);
    });

    console.log('✅ 解析任务已启动，返回响应给客户端');
    res.status(202).json({ message: '解析任务已启动', status: 'processing', docId });
  } catch (error) {
    console.error('❌ 处理解析请求失败:', error);
    console.error('❌ 错误堆栈:', error.stack);
    next(error);
  }
}

// 删除文档
export async function handleDeleteDoc(req, res, next) {
  try {
    const { docId } = req.params;
    await deleteDocument(docId);
    res.status(200).json({ message: '文档已删除' });
  } catch (error) {
    next(error);
  }
}

// 获取文档列表
export async function handleGetDocs(req, res, next) {
  try {
    const { kbId } = req.params;
    const docs = await KnowledgeDocument.find({ kbId }).sort({ createdAt: -1 });
    res.status(200).json({ docs });
  } catch (error) {
    next(error);
  }
}

// 获取文档片段
export async function handleGetChunks(req, res, next) {
  try {
    const { docId } = req.params;
    const chunks = await KnowledgeChunk.find({ docId })
      .select('content metadata')
      .sort({ 'metadata.page': 1, createdAt: 1 });
    res.status(200).json({ chunks });
  } catch (error) {
    next(error);
  }
}

// 预览分段
export async function handlePreviewChunks(req, res, next) {
  try {
    const { docId } = req.params;
    const chunks = await previewDocumentChunks(docId);
    res.status(200).json({ chunks });
  } catch (error) {
    next(error);
  }
}

// 搜索知识库
export async function handleQueryKB(req, res, next) {
  try {
    const { kbId } = req.params;
    const { query } = req.body;

    if (!query) return res.status(400).json({ error: '查询内容不能为空' });

    const vector = await generateEmbedding(query);
    const results = await searchKnowledge(kbId, vector);

    res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
}
