import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../../../uploads/files');
fs.mkdir(UPLOAD_DIR, { recursive: true }).catch(() => {});

// Multer 配置 - 文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `file_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/json',
  ];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExt = ['.csv', '.xlsx', '.xls', '.txt', '.json'];

  if (allowed.includes(file.mimetype) || allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('只支持 CSV、Excel、TXT、JSON 格式文件'), false);
  }
};

export const fileUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

/**
 * 文件处理服务
 * 支持 Excel、CSV 文件解析，并转换为可用于 AI 分析的文本格式
 */
class FileProcessingService {
  /**
   * 解析 CSV 文件
   */
  async parseCSV(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim());

    if (!lines.length) return { headers: [], rows: [], text: '' };

    // 解析标题行
    const headers = this.parseCSVLine(lines[0]);
    const rows = lines.slice(1).map((line) => {
      const values = this.parseCSVLine(line);
      const row = {};
      headers.forEach((h, i) => {
        row[h] = values[i] || '';
      });
      return row;
    });

    // 生成摘要文本
    const text = this.generateDataSummary(headers, rows, 'CSV');

    return { headers, rows: rows.slice(0, 100), totalRows: rows.length, text };
  }

  /**
   * 解析 CSV 行（处理引号转义）
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  /**
   * 解析 JSON 文件
   */
  async parseJSON(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    // 如果是数组，转为表格格式
    if (Array.isArray(data) && data.length > 0) {
      const headers = Object.keys(data[0]);
      const text = this.generateDataSummary(headers, data, 'JSON');
      return { headers, rows: data.slice(0, 100), totalRows: data.length, text };
    }

    // 否则直接转为文本
    const text = JSON.stringify(data, null, 2);
    return { data, text };
  }

  /**
   * 解析纯文本文件
   */
  async parseTxt(filePath) {
    const text = await fs.readFile(filePath, 'utf-8');
    return { text, length: text.length };
  }

  /**
   * 根据文件类型自动解析
   */
  async parseFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
      case '.csv':
        return this.parseCSV(filePath);
      case '.json':
        return this.parseJSON(filePath);
      case '.txt':
        return this.parseTxt(filePath);
      default:
        throw new Error(`不支持的文件格式: ${ext}`);
    }
  }

  /**
   * 生成数据摘要文本（供 AI 分析）
   */
  generateDataSummary(headers, rows, fileType = 'CSV') {
    const lines = [
      `这是一个 ${fileType} 数据文件，包含以下字段：${headers.join(', ')}`,
      `共有 ${rows.length} 行数据。`,
      ``,
      `前 5 行数据示例：`,
    ];

    rows.slice(0, 5).forEach((row, idx) => {
      const rowStr = headers.map((h) => `${h}: ${row[h]}`).join(', ');
      lines.push(`第 ${idx + 1} 行: ${rowStr}`);
    });

    // 数值列统计
    const numericStats = [];
    for (const header of headers) {
      const values = rows
        .map((r) => parseFloat(r[header]))
        .filter((v) => !isNaN(v));

      if (values.length > rows.length * 0.5) {
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);
        numericStats.push(`${header}: 平均=${avg.toFixed(2)}, 最大=${max}, 最小=${min}`);
      }
    }

    if (numericStats.length) {
      lines.push(``, `数值列统计：`, ...numericStats);
    }

    return lines.join('\n');
  }

  /**
   * 清理临时文件
   */
  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (err) {
      // 忽略
    }
  }
}

export default new FileProcessingService();
