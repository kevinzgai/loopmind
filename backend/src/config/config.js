import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取__dirname的ES模块等价物
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
config({ path: path.resolve(__dirname, '..', '..', '..', '.env') });

export const PORT = process.env.PORT || 3000;
export const API_KEY = process.env.API_KEY;
export const BASE_URL = process.env.BASE_URL || 'https://api.deepseek.com';
export const MODEL = process.env.MODEL || 'deepseek-chat';