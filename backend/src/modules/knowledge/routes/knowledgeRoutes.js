import express from 'express';
import multer from 'multer';
import { 
  handleCreateKB, 
  handleDeleteKB,
  handleGetKBs, 
  handleUploadDoc, 
  handleGetDocs,
  handleGetChunks,
  handleDeleteDoc,
  handleProcessDoc,
  handlePreviewChunks,
  handleQueryKB
} from '../controllers/knowledgeController.js';
import { authenticateToken as authenticate } from '../../../middleware/authMiddleware.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 配置文件上传
const uploadDir = 'uploads/knowledge';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // 修复文件名乱码以确保后缀名提取正确
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(originalName));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 限制 100MB
});

// 所有路由均需认证
router.use(authenticate);

/**
 * @api {post} /knowledge 创建知识库
 * @apiName CreateKnowledgeBase
 * @apiGroup Knowledge
 * @apiDescription 创建一个新的知识库
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiBody {String} name 知识库名称
 * @apiBody {String} [description] 描述
 *
 * @apiSuccess {Object} knowledgeBase 创建的知识库信息
 */
router.post('/', handleCreateKB);

/**
 * @api {get} /knowledge 获取知识库列表
 * @apiName GetKnowledgeBases
 * @apiGroup Knowledge
 * @apiDescription 获取当前用户的知识库列表
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {Array} knowledgeBases 知识库列表
 */
router.get('/', handleGetKBs);

/**
 * @api {delete} /knowledge/:kbId 删除知识库
 * @apiName DeleteKnowledgeBase
 * @apiGroup Knowledge
 * @apiDescription 删除指定的知识库及其所有文档
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} kbId 知识库ID
 *
 * @apiSuccess {String} message 删除成功消息
 */
router.delete('/:kbId', handleDeleteKB);

/**
 * @api {post} /knowledge/:kbId/upload 上传文档
 * @apiName UploadDocument
 * @apiGroup Knowledge
 * @apiDescription 上传文件到指定知识库（支持 PDF/Docx/Txt）
 * @apiHeader {String} Authorization Bearer Token
 * @apiHeader {String} Content-Type multipart/form-data
 *
 * @apiParam {String} kbId 知识库ID
 * @apiBody {File} file 文件对象
 *
 * @apiSuccess {Object} document 上传的文档信息
 */
router.post('/:kbId/upload', upload.single('file'), handleUploadDoc);

/**
 * @api {get} /knowledge/:kbId/documents 获取文档列表
 * @apiName GetDocuments
 * @apiGroup Knowledge
 * @apiDescription 获取指定知识库下的所有文档
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} kbId 知识库ID
 *
 * @apiSuccess {Array} documents 文档列表
 */
router.get('/:kbId/documents', handleGetDocs);

/**
 * @api {get} /knowledge/:kbId/documents/:docId/chunks 获取文档切片
 * @apiName GetDocumentChunks
 * @apiGroup Knowledge
 * @apiDescription 获取指定文档的所有切片信息
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} kbId 知识库ID
 * @apiParam {String} docId 文档ID
 *
 * @apiSuccess {Array} chunks 切片列表
 */
router.get('/:kbId/documents/:docId/chunks', handleGetChunks);

/**
 * @api {delete} /knowledge/:kbId/documents/:docId 删除文档
 * @apiName DeleteDocument
 * @apiGroup Knowledge
 * @apiDescription 删除指定的文档及其切片
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} kbId 知识库ID
 * @apiParam {String} docId 文档ID
 *
 * @apiSuccess {String} message 删除成功消息
 */
router.delete('/:kbId/documents/:docId', handleDeleteDoc);

/**
 * @api {post} /knowledge/:kbId/documents/:docId/process 处理文档
 * @apiName ProcessDocument
 * @apiGroup Knowledge
 * @apiDescription 触发文档的解析、切片和向量化处理
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} kbId 知识库ID
 * @apiParam {String} docId 文档ID
 *
 * @apiSuccess {String} message 处理状态消息
 */
router.post('/:kbId/documents/:docId/process', handleProcessDoc);

/**
 * @api {get} /knowledge/:kbId/documents/:docId/preview 预览切片
 * @apiName PreviewDocumentChunks
 * @apiGroup Knowledge
 * @apiDescription 预览文档切片结果（不保存）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} kbId 知识库ID
 * @apiParam {String} docId 文档ID
 *
 * @apiSuccess {Array} chunks 切片预览列表
 */
router.get('/:kbId/documents/:docId/preview', handlePreviewChunks);

/**
 * @api {post} /knowledge/:kbId/query 检索知识库
 * @apiName QueryKnowledgeBase
 * @apiGroup Knowledge
 * @apiDescription 在指定知识库中进行语义检索
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiParam {String} kbId 知识库ID
 * @apiBody {String} query 查询文本
 * @apiBody {Number} [limit=5] 返回结果数量
 *
 * @apiSuccess {Array} results 检索结果列表
 */
router.post('/:kbId/query', handleQueryKB);

export default router;
