import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 图片上传目录
const UPLOAD_DIR = path.join(__dirname, '../../../../uploads/images');

// 确保目录存在
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(() => {});

/**
 * Multer 配置 - 图片上传
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `img_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持 JPEG、PNG、GIF、WebP 格式的图片'), false);
  }
};

export const imageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

/**
 * 多模态图片理解服务
 * 将图片转为 base64 并调用支持视觉的 LLM API
 */
class MultimodalService {
  /**
   * 将图片转换为 base64
   */
  async imageToBase64(filePath) {
    const buffer = await fs.readFile(filePath);
    return buffer.toString('base64');
  }

  /**
   * 获取图片 MIME 类型
   */
  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    return mimeMap[ext] || 'image/jpeg';
  }

  /**
   * 构建多模态消息（OpenAI vision 格式）
   * 兼容 DeepSeek、通义千问 等支持视觉的模型
   */
  async buildVisionMessage(text, imagePaths = []) {
    const content = [];

    // 添加文字内容
    if (text) {
      content.push({ type: 'text', text });
    }

    // 添加图片内容
    for (const imgPath of imagePaths) {
      try {
        const base64 = await this.imageToBase64(imgPath);
        const mimeType = this.getMimeType(imgPath);

        content.push({
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${base64}`,
            detail: 'auto',
          },
        });
      } catch (err) {
        console.error(`❌ 处理图片失败 ${imgPath}:`, err.message);
      }
    }

    return { role: 'user', content };
  }

  /**
   * 从上传的文件获取图片路径
   */
  getUploadedImagePaths(files) {
    if (!files?.length) return [];
    return files.map((f) => f.path);
  }

  /**
   * 删除临时图片文件
   */
  async cleanupImages(filePaths) {
    for (const fp of filePaths) {
      try {
        await fs.unlink(fp);
      } catch (err) {
        // 忽略删除失败
      }
    }
  }

  /**
   * 获取图片 URL（供前端展示）
   */
  getImageUrl(filename, baseUrl = '') {
    return `${baseUrl}/uploads/images/${filename}`;
  }

  /**
   * 检查模型是否支持视觉
   */
  isVisionModel(model) {
    const visionModels = [
      'gpt-4-vision', 'gpt-4o', 'gpt-4o-mini',
      'qwen-vl', 'qwen-vl-plus', 'qwen-vl-max',
      'deepseek-vl', 'claude-3',
    ];
    return visionModels.some((vm) => model?.toLowerCase().includes(vm.toLowerCase()));
  }
}

export default new MultimodalService();
