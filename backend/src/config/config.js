import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '..', '..', '.env') });

export const PORT = process.env.PORT || 3000;
export const API_KEY = process.env.API_KEY;
export const BASE_URL = process.env.BASE_URL || 'https://api.deepseek.com';
export const MODEL = process.env.MODEL || 'deepseek-chat';

export const SEED_ASR_CONFIG = {
  appId: process.env.SEED_ASR_APPID || '',
  apiKey: process.env.SEED_ASR_API_KEY || '',
  apiSecret: process.env.SEED_ASR_API_SECRET || '',
  apiUrl: process.env.SEED_ASR_API_URL || 'https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit',
  resourceId: process.env.SEED_ASR_RESOURCE_ID || 'volc.seedasr.auc',
  audioConfig: {
    format: 'wav',
    codec: 'raw',
    rate: 16000,
    bits: 16,
    channel: 1
  }
};
