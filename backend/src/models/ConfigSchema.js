import mongoose from "mongoose";

const configSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: [
        "siliconflow",
        "deepseek",
        "qwen",
        "doubao",
        "glm",
        "moonshot",
        "modelscope",
        "minimax",
        "ollama",
      ],
      default: "deepseek",
    },
    siliconflow: {
      apiKey: { type: String, default: "" },
      baseURL: { type: String, default: "" },
      model: { type: String, default: "" },
    },
    deepseek: {
      apiKey: { type: String, default: "" },
      baseURL: { type: String, default: "" },
      model: { type: String, default: "" },
    },
    qwen: {
      apiKey: { type: String, default: "" },
      baseURL: { type: String, default: "" },
      model: { type: String, default: "" },
    },
    doubao: {
      apiKey: { type: String, default: "" },
      baseURL: { type: String, default: "" },
      model: { type: String, default: "" },
    },
    glm: {
      apiKey: { type: String, default: "" },
      baseURL: { type: String, default: "" },
      model: { type: String, default: "" },
    },
    moonshot: {
      apiKey: { type: String, default: "" },
      baseURL: { type: String, default: "" },
      model: { type: String, default: "" },
    },
    modelscope: {
      apiKey: { type: String, default: "" },
      baseURL: { type: String, default: "" },
      model: { type: String, default: "" },
    },
    minimax: {
      apiKey: { type: String, default: "" },
      baseURL: { type: String, default: "" },
      model: { type: String, default: "" },
    },
    ollama: {
      apiKey: { type: String, default: "" },
      baseURL: { type: String, default: "" },
      model: { type: String, default: "" },
    },
    embedding: {
      provider: {
        type: String,
        default: "siliconflow",
      },
      providers: {
        type: Array,
        default: [],
      },
      apiKey: { type: String, default: "" },
      baseURL: { type: String, default: "" },
      model: { type: String, default: "text-embedding-3-small" },
      batchSize: { type: Number, default: 100 },
      timeout: { type: Number, default: 30 },
    },
    seedAsr: {
      appId: { type: String, default: "" },
      apiKey: { type: String, default: "" },
      apiSecret: { type: String, default: "" },
      apiUrl: { type: String, default: "" },
      resourceId: { type: String, default: "" },
      audioConfig: {
        format: { type: String, default: "wav" },
        codec: { type: String, default: "raw" },
        rate: { type: Number, default: 16000 },
        bits: { type: Number, default: 16 },
        channel: { type: Number, default: 1 },
      },
    },
    speech: {
      ttsProvider: {
        type: String,
        enum: ["siliconflow", "aliyun", "openai", "edge"],
        default: "siliconflow",
      },
      asrProvider: {
        type: String,
        enum: ["siliconflow", "aliyun", "seed"],
        default: "siliconflow",
      },
      siliconflow: {
        apiKey: { type: String, default: "" },
        baseURL: { type: String, default: "" },
        ttsModel: { type: String, default: "FunAudioLLM/CosyVoice2-0.5B" },
        ttsVoice: { type: String, default: "anna" },
        speechRate: { type: Number, default: 150 },
        asrModel: { type: String, default: "FunAudioLLM/SenseVoiceSmall" },
      },
      aliyun: {
        accessKeyId: { type: String, default: "" },
        accessKeySecret: { type: String, default: "" },
        appKey: { type: String, default: "" },
        ttsVoice: { type: String, default: "xiaoxian" },
        speechRate: { type: Number, default: 150 },
      },
      openai: {
        apiKey: { type: String, default: "" },
        baseURL: { type: String, default: "" },
        ttsModel: { type: String, default: "tts-1" },
        ttsVoice: { type: String, default: "alloy" },
        speechRate: { type: Number, default: 150 },
      },
      edge: {
        ttsVoice: { type: String, default: "zh-CN-XiaoxiaoNeural" },
        speechRate: { type: Number, default: 150 },
      },
      seed: {
        appId: { type: String, default: "" },
        apiKey: { type: String, default: "" },
        apiSecret: { type: String, default: "" },
        apiUrl: { type: String, default: "" },
        resourceId: { type: String, default: "" },
      },
    },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "system_config",
  },
);

configSchema.index({ updatedAt: -1 });

const Config = mongoose.model("Config", configSchema);

export default Config;
