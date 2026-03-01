import Config from "../../models/ConfigSchema.js";
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
} from "../../config/config.js";

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
    siliconflow: {
      apiKey: SILICONFLOW_API_KEY || "",
      baseURL: SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1",
      model: "Pro/deepseek-ai/DeepSeek-V3",
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
        apiKey: process.env.DASHSCOPE_API_KEY || "",
        ttsVoice: "Cherry",
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
        apiKey: mask(cfg.speech?.aliyun?.apiKey),
        ttsVoice: cfg.speech?.aliyun?.ttsVoice || "Cherry",
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
        apiKey: cfg.speech?.aliyun?.apiKey || "",
        ttsVoice: cfg.speech?.aliyun?.ttsVoice || "Cherry",
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
      cfg.speech.aliyun.apiKey =
        payload.speech.aliyun.apiKey ?? cfg.speech.aliyun.apiKey;
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

// AI 模型配置相关方法
export async function getAIConfig() {
  const cfg = await ensureConfigInitialized();
  
  // 构建新格式的配置对象
  const aiConfig = {
    provider: cfg.provider,
    providers: []
  };
  
  // 遍历所有AI提供商配置
  const providers = [
    { id: 'siliconflow', name: '硅基流动', config: cfg.siliconflow },
    { id: 'deepseek', name: 'DeepSeek', config: cfg.deepseek },
    { id: 'qwen', name: '通义千问', config: cfg.qwen },
    { id: 'doubao', name: '火山引擎', config: cfg.doubao },
    { id: 'glm', name: '智谱GLM', config: cfg.glm },
    { id: 'moonshot', name: 'Moonshot', config: cfg.moonshot },
    { id: 'modelscope', name: 'ModelScope', config: cfg.modelscope },
    { id: 'minimax', name: 'MiniMax', config: cfg.minimax },
    { id: 'ollama', name: 'Ollama', config: cfg.ollama }
  ];
  
  // 添加已配置的提供商
  providers.forEach(({ id, name, config }) => {
    if (config && config.apiKey) {
      aiConfig.providers.push({
        id,
        name,
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        model: config.model,
        type: id
      });
    }
  });
  
  return aiConfig;
}

export async function updateAIConfig(payload) {
  const cfg = await ensureConfigInitialized();
  
  // 处理新格式的配置
  if (payload.provider !== undefined) {
    cfg.provider = payload.provider;
  }
  
  // 处理提供商配置
  if (Array.isArray(payload.providers)) {
    payload.providers.forEach(provider => {
      if (provider.id && provider.apiKey) {
        if (!cfg[provider.id]) {
          cfg[provider.id] = {};
        }
        cfg[provider.id].apiKey = provider.apiKey;
        cfg[provider.id].baseURL = provider.baseURL;
        cfg[provider.id].model = provider.model;
      }
    });
  } else {
    // 向后兼容旧格式
    Object.keys(payload).forEach(key => {
      if (key !== 'provider' && payload[key]) {
        if (!cfg[key]) {
          cfg[key] = {};
        }
        Object.assign(cfg[key], payload[key]);
      }
    });
  }
  
  cfg.updatedAt = new Date();
  await cfg.save();
  return cfg;
}

// Embedding 模型配置相关方法
export async function getEmbeddingConfig() {
  const cfg = await ensureConfigInitialized();
  
  // 构建新格式的配置对象
  const embeddingConfig = {
    provider: cfg.embedding?.provider || 'openai',
    providers: []
  };
  
  // 优先使用新格式的 providers 数组（来自前端保存的配置）
  if (cfg.embedding && cfg.embedding.providers && Array.isArray(cfg.embedding.providers)) {
    console.log('🔧 使用新格式的 Embedding 提供商配置，数量:', cfg.embedding.providers.length);
    embeddingConfig.providers = cfg.embedding.providers;
  } else {
    // 向后兼容：遍历所有Embedding提供商配置
    const providers = [
      { id: 'openai', name: 'OpenAI', config: cfg.openai },
      { id: 'siliconflow', name: '硅基流动', config: cfg.siliconflow },
      { id: 'zhipu', name: '智谱 AI', config: cfg.zhipu },
      { id: 'aliyun', name: '阿里云', config: cfg.aliyun }
    ];
    
    // 添加已配置的提供商
    providers.forEach(({ id, name, config }) => {
      if (config && config.apiKey) {
        embeddingConfig.providers.push({
          id,
          name,
          apiKey: config.apiKey,
          baseURL: config.baseURL,
          model: config.model,
          type: id
        });
      }
    });
    
    // 添加默认的embedding配置（如果有）
    if (cfg.embedding && cfg.embedding.apiKey) {
      embeddingConfig.providers.push({
        id: 'embedding',
        name: '默认 Embedding',
        apiKey: cfg.embedding.apiKey,
        baseURL: cfg.embedding.baseURL,
        model: cfg.embedding.model,
        type: 'embedding'
      });
    }
  }
  
  return embeddingConfig;
}

export async function updateEmbeddingConfig(payload) {
  const cfg = await ensureConfigInitialized();
  
  // 处理新格式的配置
  if (payload.provider !== undefined) {
    if (!cfg.embedding) {
      cfg.embedding = {};
    }
    cfg.embedding.provider = payload.provider;
  }
  
  // 处理提供商配置
  if (Array.isArray(payload.providers)) {
    // 保存 providers 数组到 cfg.embedding.providers
    if (!cfg.embedding) {
      cfg.embedding = {};
    }
    cfg.embedding.providers = payload.providers;
    
    // 同时保存到各个提供商的配置中，以保持向后兼容
    payload.providers.forEach(provider => {
      if (provider.id && provider.apiKey) {
        if (!cfg[provider.id]) {
          cfg[provider.id] = {};
        }
        cfg[provider.id].apiKey = provider.apiKey;
        cfg[provider.id].baseURL = provider.baseURL;
        cfg[provider.id].model = provider.model;
      }
    });
  } else {
    // 向后兼容旧格式
    if (payload.embedding) {
      if (!cfg.embedding) {
        cfg.embedding = {};
      }
      Object.assign(cfg.embedding, payload.embedding);
    }
  }
  
  cfg.updatedAt = new Date();
  await cfg.save();
  return cfg;
}

// 语音服务配置相关方法
export async function getSpeechConfig() {
  const cfg = await ensureConfigInitialized();
  
  const speechConfig = {
    ttsProvider: cfg.speech?.ttsProvider || 'siliconflow',
    asrProvider: cfg.speech?.asrProvider || 'siliconflow',
    providers: []
  };
  
  const speechProviders = [
    {
      id: "siliconflow",
      name: "硅基流动",
      config: cfg.speech?.siliconflow,
      type: "tts",
      models: ["FunAudioLLM/CosyVoice2-0.5B"]
    },
    {
      id: "aliyun",
      name: "阿里云",
      config: cfg.speech?.aliyun,
      type: "tts",
      models: ["xiaoxian", "xiaoyu", "yaya"]
    },
    {
      id: "openai",
      name: "OpenAI",
      config: cfg.speech?.openai,
      type: "tts",
      models: ["tts-1", "tts-1-hd"]
    },
    {
      id: "edge",
      name: "Edge TTS",
      config: cfg.speech?.edge,
      type: "tts",
      models: ["edge"]
    },
    {
      id: "seed",
      name: "Seed",
      config: cfg.speech?.seed,
      type: "tts",
      models: ["seed"]
    }
  ];
  
  speechConfig.providers = speechProviders
    .filter(p => p.config)
    .map(p => {
      const providerConfig = {
        id: p.id,
        name: p.name,
        type: p.type,
        models: p.models || p.model ? [p.model] : [],
        ttsVoice: p.config.ttsVoice || '',
        speechRate: p.config.speechRate || 150,
        asrModel: p.config.asrModel || ''
      };
      
      // 对于阿里云，总是添加 apiKey 字段
      if (p.id === 'aliyun') {
        providerConfig.apiKey = p.config.apiKey || '';
        if (p.config.baseURL) {
          providerConfig.baseURL = p.config.baseURL;
        }
      } else {
        // 对于其他提供商，只有当字段存在时才添加到返回对象中
        if (p.config.apiKey !== undefined) {
          providerConfig.apiKey = p.config.apiKey;
        }
        if (p.config.baseURL !== undefined) {
          providerConfig.baseURL = p.config.baseURL;
        }
      }
      
      // 添加 Seed 特有字段
      if (p.id === 'seed') {
        if (p.config.appId !== undefined) {
          providerConfig.appId = p.config.appId;
        }
        if (p.config.apiSecret !== undefined) {
          providerConfig.apiSecret = p.config.apiSecret;
        }
        if (p.config.apiUrl !== undefined) {
          providerConfig.apiUrl = p.config.apiUrl;
        }
        if (p.config.resourceId !== undefined) {
          providerConfig.resourceId = p.config.resourceId;
        }
      }
      
      return providerConfig;
    });
  
  return speechConfig;
}

export async function updateSpeechConfig(payload) {
  const cfg = await ensureConfigInitialized();
  
  // 创建一个深度克隆的 speech 配置对象
  const updatedSpeechConfig = JSON.parse(JSON.stringify(cfg.speech || {}));
  
  // 处理新格式的配置
  if (payload.ttsProvider !== undefined) {
    updatedSpeechConfig.ttsProvider = payload.ttsProvider;
  }
  
  if (payload.asrProvider !== undefined) {
    updatedSpeechConfig.asrProvider = payload.asrProvider;
  }
  
  // 处理提供商配置
  if (Array.isArray(payload.providers)) {
    payload.providers.forEach(provider => {
      if (provider.id) {
        if (!updatedSpeechConfig[provider.id]) {
          updatedSpeechConfig[provider.id] = {};
        }
        
        // 对于阿里云，强制更新 apiKey 字段
        if (provider.id === 'aliyun') {
          updatedSpeechConfig[provider.id] = {
            ...updatedSpeechConfig[provider.id],
            apiKey: provider.apiKey || '',
            ttsVoice: provider.ttsVoice || 'Cherry',
            speechRate: provider.speechRate || 150
          };
        } else {
          // 对于其他提供商，只更新存在的字段
          if (provider.apiKey !== undefined) {
            updatedSpeechConfig[provider.id].apiKey = provider.apiKey;
          }
          if (provider.baseURL !== undefined) {
            updatedSpeechConfig[provider.id].baseURL = provider.baseURL;
          }
          if (provider.model !== undefined) {
            updatedSpeechConfig[provider.id].model = provider.model;
          }
          if (provider.ttsVoice !== undefined) {
            updatedSpeechConfig[provider.id].ttsVoice = provider.ttsVoice;
          }
          if (provider.speechRate !== undefined) {
            updatedSpeechConfig[provider.id].speechRate = provider.speechRate;
          }
          if (provider.asrModel !== undefined) {
            updatedSpeechConfig[provider.id].asrModel = provider.asrModel;
          }
          // 保存 Seed 特有字段
          if (provider.id === 'seed') {
            if (provider.appId !== undefined) {
              updatedSpeechConfig[provider.id].appId = provider.appId;
            }
            if (provider.apiSecret !== undefined) {
              updatedSpeechConfig[provider.id].apiSecret = provider.apiSecret;
            }
            if (provider.apiUrl !== undefined) {
              updatedSpeechConfig[provider.id].apiUrl = provider.apiUrl;
            }
            if (provider.resourceId !== undefined) {
              updatedSpeechConfig[provider.id].resourceId = provider.resourceId;
            }
          }
        }
      }
    });
  }
  
  // 使用 Mongoose 的 set 方法一次性更新整个 speech 配置
  cfg.set('speech', updatedSpeechConfig);
  cfg.updatedAt = new Date();
  await cfg.save();
  return cfg;
}

export default {
  ensureConfigInitialized,
  getConfigMasked,
  updateConfig,
  getRawConfigCached,
  getAIConfig,
  updateAIConfig,
  getEmbeddingConfig,
  updateEmbeddingConfig,
  getSpeechConfig,
  updateSpeechConfig
};
