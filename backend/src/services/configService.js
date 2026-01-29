import Config from "../models/ConfigSchema.js";
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
  SILICONFLOW_API_KEY,
  SILICONFLOW_BASE_URL,
  SILICONFLOW_TTS_MODEL,
  SILICONFLOW_ASR_MODEL,
  DEFAULT_AI_PROVIDER,
} from "../config/config.js";

function mask(value) {
  if (!value) return "";
  if (value.length <= 8) return "********";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export async function ensureConfigInitialized() {
  const existing = await Config.findOne({});
  if (existing) return existing;
  const config = new Config({
    provider: DEFAULT_AI_PROVIDER,
    deepseek: {
      apiKey: DEEPSEEK_API_KEY || "",
      baseURL: DEEPSEEK_BASE_URL || "",
      model: DEEPSEEK_MODEL || "",
    },
    qwen: {
      apiKey: QWEN_API_KEY || "",
      baseURL: QWEN_BASE_URL || "",
      model: QWEN_MODEL || "",
    },
    doubao: {
      apiKey: DOUBAO_API_KEY || "",
      baseURL: DOUBAO_BASE_URL || "",
      model: DOUBAO_MODEL || "",
    },
    glm: {
      apiKey: GLM_API_KEY || "",
      baseURL: GLM_BASE_URL || "",
      model: GLM_MODEL || "",
    },
    moonshot: {
      apiKey: MOONSHOT_API_KEY || "",
      baseURL: MOONSHOT_BASE_URL || "",
      model: MOONSHOT_MODEL || "",
    },
    modelscope: {
      apiKey: MODELSCOPE_API_KEY || "",
      baseURL: MODELSCOPE_BASE_URL || "",
      model: MODELSCOPE_MODEL || "",
    },
    minimax: {
      apiKey: MINIMAX_API_KEY || "",
      baseURL: MINIMAX_BASE_URL || "",
      model: MINIMAX_MODEL || "",
    },
    ollama: {
      apiKey: OLLAMA_API_KEY || "",
      baseURL: OLLAMA_BASE_URL || "",
      model: OLLAMA_MODEL || "",
    },
    embedding: {
      apiKey: "",
      baseURL: "",
      model: "text-embedding-3-small",
    },
    seedAsr: {
      appId: "",
      apiKey: "",
      apiSecret: "",
      apiUrl: "",
      resourceId: "",
      audioConfig: {
        format: "wav",
        codec: "raw",
        rate: 16000,
        bits: 16,
        channel: 1,
      },
    },
    speech: {
      ttsProvider: "siliconflow",
      asrProvider: "siliconflow",
      siliconflow: {
        apiKey: SILICONFLOW_API_KEY || "",
        baseURL: SILICONFLOW_BASE_URL || "",
        ttsModel: SILICONFLOW_TTS_MODEL || "FunAudioLLM/CosyVoice2-0.5B",
        ttsVoice: "anna",
        speechRate: 150,
        asrModel: SILICONFLOW_ASR_MODEL || "FunAudioLLM/SenseVoiceSmall",
      },
      aliyun: {
        accessKeyId: process.env.ALI_TTS_ACCESS_KEY_ID || "",
        accessKeySecret: process.env.ALI_TTS_ACCESS_KEY_SECRET || "",
        appKey: process.env.ALI_TTS_APP_KEY || "",
        ttsVoice: "xiaoxian",
        speechRate: 150,
      },
      openai: {
        apiKey: "",
        baseURL: "",
        ttsModel: "tts-1",
        ttsVoice: "alloy",
        speechRate: 150,
      },
      edge: {
        ttsVoice: "zh-CN-XiaoxiaoNeural",
        speechRate: 150,
      },
      seed: {
        appId: "",
        apiKey: "",
        apiSecret: "",
        apiUrl: "",
        resourceId: "",
      },
    },
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
      model: cfg.deepseek.model,
    },
    qwen: {
      apiKey: mask(cfg.qwen.apiKey),
      baseURL: cfg.qwen.baseURL,
      model: cfg.qwen.model,
    },
    doubao: {
      apiKey: mask(cfg.doubao?.apiKey),
      baseURL: cfg.doubao?.baseURL,
      model: cfg.doubao?.model,
    },
    glm: {
      apiKey: mask(cfg.glm?.apiKey),
      baseURL: cfg.glm?.baseURL,
      model: cfg.glm?.model,
    },
    moonshot: {
      apiKey: mask(cfg.moonshot?.apiKey),
      baseURL: cfg.moonshot?.baseURL,
      model: cfg.moonshot?.model,
    },
    modelscope: {
      apiKey: mask(cfg.modelscope?.apiKey),
      baseURL: cfg.modelscope?.baseURL,
      model: cfg.modelscope?.model,
    },
    minimax: {
      apiKey: mask(cfg.minimax?.apiKey),
      baseURL: cfg.minimax?.baseURL,
      model: cfg.minimax?.model,
    },
    ollama: {
      apiKey: mask(cfg.ollama?.apiKey),
      baseURL: cfg.ollama?.baseURL,
      model: cfg.ollama?.model,
    },
    embedding: {
      apiKey: mask(cfg.embedding?.apiKey),
      baseURL: cfg.embedding?.baseURL,
      model: cfg.embedding?.model,
    },
    seedAsr: {
      appId: cfg.seedAsr?.appId || "",
      apiKey: mask(cfg.seedAsr?.apiKey || ""),
      apiSecret: mask(cfg.seedAsr?.apiSecret || ""),
      apiUrl: cfg.seedAsr?.apiUrl || "",
      resourceId: cfg.seedAsr?.resourceId || "",
      audioConfig: cfg.seedAsr?.audioConfig,
    },
    speech: {
      ttsProvider: cfg.speech?.ttsProvider || "siliconflow",
      asrProvider: cfg.speech?.asrProvider || "siliconflow",
      siliconflow: {
        apiKey: mask(cfg.speech?.siliconflow?.apiKey),
        baseURL: cfg.speech?.siliconflow?.baseURL || "",
        ttsModel: cfg.speech?.siliconflow?.ttsModel || "",
        ttsVoice: cfg.speech?.siliconflow?.ttsVoice || "anna",
        speechRate: cfg.speech?.siliconflow?.speechRate || 150,
        asrModel: cfg.speech?.siliconflow?.asrModel || "",
      },
      aliyun: {
        accessKeyId: mask(cfg.speech?.aliyun?.accessKeyId),
        accessKeySecret: mask(cfg.speech?.aliyun?.accessKeySecret),
        appKey: mask(cfg.speech?.aliyun?.appKey),
        ttsVoice: cfg.speech?.aliyun?.ttsVoice || "xiaoxian",
        speechRate: cfg.speech?.aliyun?.speechRate || 150,
      },
      openai: {
        apiKey: mask(cfg.speech?.openai?.apiKey),
        baseURL: cfg.speech?.openai?.baseURL || "",
        ttsModel: cfg.speech?.openai?.ttsModel || "tts-1",
        ttsVoice: cfg.speech?.openai?.ttsVoice || "alloy",
        speechRate: cfg.speech?.openai?.speechRate || 150,
      },
      edge: {
        ttsVoice: cfg.speech?.edge?.ttsVoice || "zh-CN-XiaoxiaoNeural",
        speechRate: cfg.speech?.edge?.speechRate || 150,
      },
      seed: {
        appId: cfg.speech?.seed?.appId || "",
        apiKey: mask(cfg.speech?.seed?.apiKey),
        apiSecret: mask(cfg.speech?.seed?.apiSecret),
        apiUrl: cfg.speech?.seed?.apiUrl || "",
        resourceId: cfg.speech?.seed?.resourceId || "",
      },
    },
    updatedAt: cfg.updatedAt,
  };
}

export async function getConfigUnmasked() {
  const cfg = await ensureConfigInitialized();
  return {
    provider: cfg.provider,
    deepseek: {
      apiKey: cfg.deepseek.apiKey,
      baseURL: cfg.deepseek.baseURL,
      model: cfg.deepseek.model,
    },
    qwen: {
      apiKey: cfg.qwen.apiKey,
      baseURL: cfg.qwen.baseURL,
      model: cfg.qwen.model,
    },
    doubao: {
      apiKey: cfg.doubao?.apiKey,
      baseURL: cfg.doubao?.baseURL,
      model: cfg.doubao?.model,
    },
    glm: {
      apiKey: cfg.glm?.apiKey,
      baseURL: cfg.glm?.baseURL,
      model: cfg.glm?.model,
    },
    moonshot: {
      apiKey: cfg.moonshot?.apiKey,
      baseURL: cfg.moonshot?.baseURL,
      model: cfg.moonshot?.model,
    },
    modelscope: {
      apiKey: cfg.modelscope?.apiKey,
      baseURL: cfg.modelscope?.baseURL,
      model: cfg.modelscope?.model,
    },
    minimax: {
      apiKey: cfg.minimax?.apiKey,
      baseURL: cfg.minimax?.baseURL,
      model: cfg.minimax?.model,
    },
    ollama: {
      apiKey: cfg.ollama?.apiKey,
      baseURL: cfg.ollama?.baseURL,
      model: cfg.ollama?.model,
    },
    embedding: {
      apiKey: cfg.embedding?.apiKey,
      baseURL: cfg.embedding?.baseURL,
      model: cfg.embedding?.model,
    },
    seedAsr: {
      appId: cfg.seedAsr?.appId || "",
      apiKey: cfg.seedAsr?.apiKey || "",
      apiSecret: cfg.seedAsr?.apiSecret || "",
      apiUrl: cfg.seedAsr?.apiUrl || "",
      resourceId: cfg.seedAsr?.resourceId || "",
      audioConfig: cfg.seedAsr?.audioConfig,
    },
    speech: {
      ttsProvider: cfg.speech?.ttsProvider || "siliconflow",
      asrProvider: cfg.speech?.asrProvider || "siliconflow",
      siliconflow: {
        apiKey: cfg.speech?.siliconflow?.apiKey || "",
        baseURL: cfg.speech?.siliconflow?.baseURL || "",
        ttsModel: cfg.speech?.siliconflow?.ttsModel || "",
        ttsVoice: cfg.speech?.siliconflow?.ttsVoice || "anna",
        speechRate: cfg.speech?.siliconflow?.speechRate || 150,
        asrModel: cfg.speech?.siliconflow?.asrModel || "",
      },
      aliyun: {
        accessKeyId: cfg.speech?.aliyun?.accessKeyId || "",
        accessKeySecret: cfg.speech?.aliyun?.accessKeySecret || "",
        appKey: cfg.speech?.aliyun?.appKey || "",
        ttsVoice: cfg.speech?.aliyun?.ttsVoice || "xiaoxian",
        speechRate: cfg.speech?.aliyun?.speechRate || 150,
      },
      openai: {
        apiKey: cfg.speech?.openai?.apiKey || "",
        baseURL: cfg.speech?.openai?.baseURL || "",
        ttsModel: cfg.speech?.openai?.ttsModel || "tts-1",
        ttsVoice: cfg.speech?.openai?.ttsVoice || "alloy",
        speechRate: cfg.speech?.openai?.speechRate || 150,
      },
      edge: {
        ttsVoice: cfg.speech?.edge?.ttsVoice || "zh-CN-XiaoxiaoNeural",
        speechRate: cfg.speech?.edge?.speechRate || 150,
      },
      seed: {
        appId: cfg.speech?.seed?.appId || "",
        apiKey: cfg.speech?.seed?.apiKey || "",
        apiSecret: cfg.speech?.seed?.apiSecret || "",
        apiUrl: cfg.speech?.seed?.apiUrl || "",
        resourceId: cfg.speech?.seed?.resourceId || "",
      },
    },
    updatedAt: cfg.updatedAt,
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
    cfg.modelscope.baseURL =
      payload.modelscope.baseURL ?? cfg.modelscope.baseURL;
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
  if (payload.embedding) {
    if (!cfg.embedding) cfg.embedding = {};
    cfg.embedding.apiKey = payload.embedding.apiKey ?? cfg.embedding.apiKey;
    cfg.embedding.baseURL = payload.embedding.baseURL ?? cfg.embedding.baseURL;
    cfg.embedding.model = payload.embedding.model ?? cfg.embedding.model;
  }
  if (payload.seedAsr) {
    cfg.seedAsr.appId = payload.seedAsr.appId ?? cfg.seedAsr.appId;
    cfg.seedAsr.apiKey = payload.seedAsr.apiKey ?? cfg.seedAsr.apiKey;
    cfg.seedAsr.apiSecret = payload.seedAsr.apiSecret ?? cfg.seedAsr.apiSecret;
    cfg.seedAsr.apiUrl = payload.seedAsr.apiUrl ?? cfg.seedAsr.apiUrl;
    cfg.seedAsr.resourceId =
      payload.seedAsr.resourceId ?? cfg.seedAsr.resourceId;
    cfg.seedAsr.audioConfig =
      payload.seedAsr.audioConfig ?? cfg.seedAsr.audioConfig;
  }
  if (payload.speech) {
    if (!cfg.speech) cfg.speech = {};
    cfg.speech.ttsProvider =
      payload.speech.ttsProvider ?? cfg.speech.ttsProvider;
    cfg.speech.asrProvider =
      payload.speech.asrProvider ?? cfg.speech.asrProvider;

    if (payload.speech.siliconflow) {
      if (!cfg.speech.siliconflow) cfg.speech.siliconflow = {};
      cfg.speech.siliconflow.apiKey =
        payload.speech.siliconflow.apiKey ?? cfg.speech.siliconflow.apiKey;
      cfg.speech.siliconflow.baseURL =
        payload.speech.siliconflow.baseURL ?? cfg.speech.siliconflow.baseURL;
      cfg.speech.siliconflow.ttsModel =
        payload.speech.siliconflow.ttsModel ?? cfg.speech.siliconflow.ttsModel;
      cfg.speech.siliconflow.ttsVoice =
        payload.speech.siliconflow.ttsVoice ?? cfg.speech.siliconflow.ttsVoice;
      cfg.speech.siliconflow.speechRate =
        payload.speech.siliconflow.speechRate ??
        cfg.speech.siliconflow.speechRate;
      cfg.speech.siliconflow.asrModel =
        payload.speech.siliconflow.asrModel ?? cfg.speech.siliconflow.asrModel;
    }

    if (payload.speech.aliyun) {
      if (!cfg.speech.aliyun) cfg.speech.aliyun = {};
      cfg.speech.aliyun.accessKeyId =
        payload.speech.aliyun.accessKeyId ?? cfg.speech.aliyun.accessKeyId;
      cfg.speech.aliyun.accessKeySecret =
        payload.speech.aliyun.accessKeySecret ??
        cfg.speech.aliyun.accessKeySecret;
      cfg.speech.aliyun.appKey =
        payload.speech.aliyun.appKey ?? cfg.speech.aliyun.appKey;
      cfg.speech.aliyun.ttsVoice =
        payload.speech.aliyun.ttsVoice ?? cfg.speech.aliyun.ttsVoice;
      cfg.speech.aliyun.speechRate =
        payload.speech.aliyun.speechRate ?? cfg.speech.aliyun.speechRate;
    }

    if (payload.speech.openai) {
      if (!cfg.speech.openai) cfg.speech.openai = {};
      cfg.speech.openai.apiKey =
        payload.speech.openai.apiKey ?? cfg.speech.openai.apiKey;
      cfg.speech.openai.baseURL =
        payload.speech.openai.baseURL ?? cfg.speech.openai.baseURL;
      cfg.speech.openai.ttsModel =
        payload.speech.openai.ttsModel ?? cfg.speech.openai.ttsModel;
      cfg.speech.openai.ttsVoice =
        payload.speech.openai.ttsVoice ?? cfg.speech.openai.ttsVoice;
      cfg.speech.openai.speechRate =
        payload.speech.openai.speechRate ?? cfg.speech.openai.speechRate;
    }

    if (payload.speech.edge) {
      if (!cfg.speech.edge) cfg.speech.edge = {};
      cfg.speech.edge.ttsVoice =
        payload.speech.edge.ttsVoice ?? cfg.speech.edge.ttsVoice;
      cfg.speech.edge.speechRate =
        payload.speech.edge.speechRate ?? cfg.speech.edge.speechRate;
    }

    if (payload.speech.seed) {
      if (!cfg.speech.seed) cfg.speech.seed = {};
      cfg.speech.seed.appId =
        payload.speech.seed.appId ?? cfg.speech.seed.appId;
      cfg.speech.seed.apiKey =
        payload.speech.seed.apiKey ?? cfg.speech.seed.apiKey;
      cfg.speech.seed.apiSecret =
        payload.speech.seed.apiSecret ?? cfg.speech.seed.apiSecret;
      cfg.speech.seed.apiUrl =
        payload.speech.seed.apiUrl ?? cfg.speech.seed.apiUrl;
      cfg.speech.seed.resourceId =
        payload.speech.seed.resourceId ?? cfg.speech.seed.resourceId;
    }
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
  getRawConfigCached,
};
