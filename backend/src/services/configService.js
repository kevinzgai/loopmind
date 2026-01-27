import Config from '../models/ConfigSchema.js';
import {
  DEEPSEEK_API_KEY,
  DEEPSEEK_BASE_URL,
  DEEPSEEK_MODEL,
  QWEN_API_KEY,
  QWEN_BASE_URL,
  QWEN_MODEL,
  DOUBAO_API_KEY,
  DOUBAO_BASE_URL,
  DOUBAO_MODEL,
  GLM_API_KEY,
  GLM_BASE_URL,
  GLM_MODEL,
  MOONSHOT_API_KEY,
  MOONSHOT_BASE_URL,
  MOONSHOT_MODEL,
  MODELSCOPE_API_KEY,
  MODELSCOPE_BASE_URL,
  MODELSCOPE_MODEL,
  MINIMAX_API_KEY,
  MINIMAX_BASE_URL,
  MINIMAX_MODEL,
  OLLAMA_API_KEY,
  OLLAMA_BASE_URL,
  OLLAMA_MODEL,
  DEFAULT_AI_PROVIDER
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
    doubao: {
      apiKey: DOUBAO_API_KEY || '',
      baseURL: DOUBAO_BASE_URL || '',
      model: DOUBAO_MODEL || ''
    },
    glm: {
      apiKey: GLM_API_KEY || '',
      baseURL: GLM_BASE_URL || '',
      model: GLM_MODEL || ''
    },
    moonshot: {
      apiKey: MOONSHOT_API_KEY || '',
      baseURL: MOONSHOT_BASE_URL || '',
      model: MOONSHOT_MODEL || ''
    },
    modelscope: {
      apiKey: MODELSCOPE_API_KEY || '',
      baseURL: MODELSCOPE_BASE_URL || '',
      model: MODELSCOPE_MODEL || ''
    },
    minimax: {
      apiKey: MINIMAX_API_KEY || '',
      baseURL: MINIMAX_BASE_URL || '',
      model: MINIMAX_MODEL || ''
    },
    ollama: {
      apiKey: OLLAMA_API_KEY || '',
      baseURL: OLLAMA_BASE_URL || '',
      model: OLLAMA_MODEL || ''
    },
    seedAsr: {
      appId: '',
      apiKey: '',
      apiSecret: '',
      apiUrl: '',
      resourceId: '',
      audioConfig: {
        format: 'wav',
        codec: 'raw',
        rate: 16000,
        bits: 16,
        channel: 1
      }
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
    doubao: {
      apiKey: mask(cfg.doubao?.apiKey),
      baseURL: cfg.doubao?.baseURL,
      model: cfg.doubao?.model
    },
    glm: {
      apiKey: mask(cfg.glm?.apiKey),
      baseURL: cfg.glm?.baseURL,
      model: cfg.glm?.model
    },
    moonshot: {
      apiKey: mask(cfg.moonshot?.apiKey),
      baseURL: cfg.moonshot?.baseURL,
      model: cfg.moonshot?.model
    },
    modelscope: {
      apiKey: mask(cfg.modelscope?.apiKey),
      baseURL: cfg.modelscope?.baseURL,
      model: cfg.modelscope?.model
    },
    minimax: {
      apiKey: mask(cfg.minimax?.apiKey),
      baseURL: cfg.minimax?.baseURL,
      model: cfg.minimax?.model
    },
    ollama: {
      apiKey: mask(cfg.ollama?.apiKey),
      baseURL: cfg.ollama?.baseURL,
      model: cfg.ollama?.model
    },
    seedAsr: {
      appId: cfg.seedAsr?.appId || '',
      apiKey: mask(cfg.seedAsr?.apiKey || ''),
      apiSecret: mask(cfg.seedAsr?.apiSecret || ''),
      apiUrl: cfg.seedAsr?.apiUrl || '',
      resourceId: cfg.seedAsr?.resourceId || '',
      audioConfig: cfg.seedAsr?.audioConfig
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
    doubao: {
      apiKey: cfg.doubao?.apiKey,
      baseURL: cfg.doubao?.baseURL,
      model: cfg.doubao?.model
    },
    glm: {
      apiKey: cfg.glm?.apiKey,
      baseURL: cfg.glm?.baseURL,
      model: cfg.glm?.model
    },
    moonshot: {
      apiKey: cfg.moonshot?.apiKey,
      baseURL: cfg.moonshot?.baseURL,
      model: cfg.moonshot?.model
    },
    modelscope: {
      apiKey: cfg.modelscope?.apiKey,
      baseURL: cfg.modelscope?.baseURL,
      model: cfg.modelscope?.model
    },
    minimax: {
      apiKey: cfg.minimax?.apiKey,
      baseURL: cfg.minimax?.baseURL,
      model: cfg.minimax?.model
    },
    ollama: {
      apiKey: cfg.ollama?.apiKey,
      baseURL: cfg.ollama?.baseURL,
      model: cfg.ollama?.model
    },
    seedAsr: {
      appId: cfg.seedAsr?.appId || '',
      apiKey: cfg.seedAsr?.apiKey || '',
      apiSecret: cfg.seedAsr?.apiSecret || '',
      apiUrl: cfg.seedAsr?.apiUrl || '',
      resourceId: cfg.seedAsr?.resourceId || '',
      audioConfig: cfg.seedAsr?.audioConfig
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
  if (payload.doubao) {
    if (!cfg.doubao) cfg.doubao = {};
    cfg.doubao.apiKey = payload.doubao.apiKey ?? cfg.doubao.apiKey;
    cfg.doubao.baseURL = payload.doubao.baseURL ?? cfg.doubao.baseURL;
    cfg.doubao.model = payload.doubao.model ?? cfg.doubao.model;
  }
  if (payload.glm) {
    if (!cfg.glm) cfg.glm = {};
    cfg.glm.apiKey = payload.glm.apiKey ?? cfg.glm.apiKey;
    cfg.glm.baseURL = payload.glm.baseURL ?? cfg.glm.baseURL;
    cfg.glm.model = payload.glm.model ?? cfg.glm.model;
  }
  if (payload.moonshot) {
    if (!cfg.moonshot) cfg.moonshot = {};
    cfg.moonshot.apiKey = payload.moonshot.apiKey ?? cfg.moonshot.apiKey;
    cfg.moonshot.baseURL = payload.moonshot.baseURL ?? cfg.moonshot.baseURL;
    cfg.moonshot.model = payload.moonshot.model ?? cfg.moonshot.model;
  }
  if (payload.modelscope) {
    if (!cfg.modelscope) cfg.modelscope = {};
    cfg.modelscope.apiKey = payload.modelscope.apiKey ?? cfg.modelscope.apiKey;
    cfg.modelscope.baseURL = payload.modelscope.baseURL ?? cfg.modelscope.baseURL;
    cfg.modelscope.model = payload.modelscope.model ?? cfg.modelscope.model;
  }
  if (payload.minimax) {
    if (!cfg.minimax) cfg.minimax = {};
    cfg.minimax.apiKey = payload.minimax.apiKey ?? cfg.minimax.apiKey;
    cfg.minimax.baseURL = payload.minimax.baseURL ?? cfg.minimax.baseURL;
    cfg.minimax.model = payload.minimax.model ?? cfg.minimax.model;
  }
  if (payload.ollama) {
    if (!cfg.ollama) cfg.ollama = {};
    cfg.ollama.apiKey = payload.ollama.apiKey ?? cfg.ollama.apiKey;
    cfg.ollama.baseURL = payload.ollama.baseURL ?? cfg.ollama.baseURL;
    cfg.ollama.model = payload.ollama.model ?? cfg.ollama.model;
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
