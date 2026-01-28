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

router.post('/', handleCreateKB);
router.get('/', handleGetKBs);
router.delete('/:kbId', handleDeleteKB);
router.post('/:kbId/upload', upload.single('file'), handleUploadDoc);
router.get('/:kbId/documents', handleGetDocs);
router.get('/:kbId/documents/:docId/chunks', handleGetChunks);
router.delete('/:kbId/documents/:docId', handleDeleteDoc);
router.post('/:kbId/documents/:docId/process', handleProcessDoc);
router.get('/:kbId/documents/:docId/preview', handlePreviewChunks);
router.post('/:kbId/query', handleQueryKB);

export default router;
