import Config from '../models/ConfigSchema.js';
import {
  DEEPSEEK_API_KEY,
  DEEPSEEK_BASE_URL,
  DEEPSEEK_MODEL,
  QWEN_API_KEY,
  QWEN_BASE_URL,
  QWEN_MODEL,
  DEFAULT_AI_PROVIDER,
  SEED_ASR_CONFIG
} from '../config/config.js';

function mask(value) {
  if (!value) return '';
  if (value.length <= 8) return '********';
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export async function ensureConfigInitialized() {
  const existing = await Config.findOne({});
  if (existing) return existing;
  const config = new Config({
    provider: DEFAULT_AI_PROVIDER,
    deepseek: {
      apiKey: DEEPSEEK_API_KEY || '',
      baseURL: DEEPSEEK_BASE_URL || '',
      model: DEEPSEEK_MODEL || ''
    },
    qwen: {
      apiKey: QWEN_API_KEY || '',
      baseURL: QWEN_BASE_URL || '',
      model: QWEN_MODEL || ''
    },
    seedAsr: {
      appId: SEED_ASR_CONFIG.appId || '',
      apiKey: SEED_ASR_CONFIG.apiKey || '',
      apiSecret: SEED_ASR_CONFIG.apiSecret || '',
      apiUrl: SEED_ASR_CONFIG.apiUrl || '',
      resourceId: SEED_ASR_CONFIG.resourceId || '',
      audioConfig: SEED_ASR_CONFIG.audioConfig || undefined
    }
  });
  await config.save();
  return config;
}

export async function getConfigMasked() {
  const cfg = await ensureConfigInitialized();
  return {
    provider: cfg.provider,
    deepseek: {
      apiKey: mask(cfg.deepseek.apiKey),
      baseURL: cfg.deepseek.baseURL,
      model: cfg.deepseek.model
    },
    qwen: {
      apiKey: mask(cfg.qwen.apiKey),
      baseURL: cfg.qwen.baseURL,
      model: cfg.qwen.model
    },
    seedAsr: {
      appId: cfg.seedAsr.appId,
      apiKey: mask(cfg.seedAsr.apiKey),
      apiSecret: mask(cfg.seedAsr.apiSecret),
      apiUrl: cfg.seedAsr.apiUrl,
      resourceId: cfg.seedAsr.resourceId,
      audioConfig: cfg.seedAsr.audioConfig
    },
    updatedAt: cfg.updatedAt
  };
}

export async function getConfigUnmasked() {
  const cfg = await ensureConfigInitialized();
  return {
    provider: cfg.provider,
    deepseek: {
      apiKey: cfg.deepseek.apiKey,
      baseURL: cfg.deepseek.baseURL,
      model: cfg.deepseek.model
    },
    qwen: {
      apiKey: cfg.qwen.apiKey,
      baseURL: cfg.qwen.baseURL,
      model: cfg.qwen.model
    },
    seedAsr: {
      appId: cfg.seedAsr.appId,
      apiKey: cfg.seedAsr.apiKey,
      apiSecret: cfg.seedAsr.apiSecret,
      apiUrl: cfg.seedAsr.apiUrl,
      resourceId: cfg.seedAsr.resourceId,
      audioConfig: cfg.seedAsr.audioConfig
    },
    updatedAt: cfg.updatedAt
  };
}

export async function updateConfig(payload) {
  const cfg = await ensureConfigInitialized();
  if (payload.provider) cfg.provider = payload.provider;
  if (payload.deepseek) {
    cfg.deepseek.apiKey = payload.deepseek.apiKey ?? cfg.deepseek.apiKey;
    cfg.deepseek.baseURL = payload.deepseek.baseURL ?? cfg.deepseek.baseURL;
    cfg.deepseek.model = payload.deepseek.model ?? cfg.deepseek.model;
  }
  if (payload.qwen) {
    cfg.qwen.apiKey = payload.qwen.apiKey ?? cfg.qwen.apiKey;
    cfg.qwen.baseURL = payload.qwen.baseURL ?? cfg.qwen.baseURL;
    cfg.qwen.model = payload.qwen.model ?? cfg.qwen.model;
  }
  if (payload.seedAsr) {
    cfg.seedAsr.appId = payload.seedAsr.appId ?? cfg.seedAsr.appId;
    cfg.seedAsr.apiKey = payload.seedAsr.apiKey ?? cfg.seedAsr.apiKey;
    cfg.seedAsr.apiSecret = payload.seedAsr.apiSecret ?? cfg.seedAsr.apiSecret;
    cfg.seedAsr.apiUrl = payload.seedAsr.apiUrl ?? cfg.seedAsr.apiUrl;
    cfg.seedAsr.resourceId = payload.seedAsr.resourceId ?? cfg.seedAsr.resourceId;
    cfg.seedAsr.audioConfig = payload.seedAsr.audioConfig ?? cfg.seedAsr.audioConfig;
  }
  cfg.updatedAt = new Date();
  await cfg.save();
  return cfg;
}

let cachedRaw = null;
let cachedAt = 0;
const CACHE_MS = 60 * 1000;

export async function getRawConfigCached() {
  const now = Date.now();
  if (!cachedRaw || now - cachedAt > CACHE_MS) {
    cachedRaw = await ensureConfigInitialized();
    cachedAt = now;
  }
  return cachedRaw;
}

export default {
  ensureConfigInitialized,
  getConfigMasked,
  updateConfig,
  getRawConfigCached
};
