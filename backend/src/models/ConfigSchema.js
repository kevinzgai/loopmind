import mongoose from 'mongoose';

const configSchema = new mongoose.Schema(
  {
    provider: { type: String, enum: ['deepseek', 'qwen', 'doubao', 'glm', 'moonshot', 'modelscope', 'minimax'], default: 'deepseek' },
    deepseek: {
      apiKey: { type: String, default: '' },
      baseURL: { type: String, default: '' },
      model: { type: String, default: '' }
    },
    qwen: {
      apiKey: { type: String, default: '' },
      baseURL: { type: String, default: '' },
      model: { type: String, default: '' }
    },
    doubao: {
      apiKey: { type: String, default: '' },
      baseURL: { type: String, default: '' },
      model: { type: String, default: '' }
    },
    glm: {
      apiKey: { type: String, default: '' },
      baseURL: { type: String, default: '' },
      model: { type: String, default: '' }
    },
    moonshot: {
      apiKey: { type: String, default: '' },
      baseURL: { type: String, default: '' },
      model: { type: String, default: '' }
    },
    modelscope: {
      apiKey: { type: String, default: '' },
      baseURL: { type: String, default: '' },
      model: { type: String, default: '' }
    },
    minimax: {
      apiKey: { type: String, default: '' },
      baseURL: { type: String, default: '' },
      model: { type: String, default: '' }
    },
    seedAsr: {
      appId: { type: String, default: '' },
      apiKey: { type: String, default: '' },
      apiSecret: { type: String, default: '' },
      apiUrl: { type: String, default: '' },
      resourceId: { type: String, default: '' },
      audioConfig: {
        format: { type: String, default: 'wav' },
        codec: { type: String, default: 'raw' },
        rate: { type: Number, default: 16000 },
        bits: { type: Number, default: 16 },
        channel: { type: Number, default: 1 }
      }
    },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    collection: 'system_config'
  }
);

configSchema.index({ updatedAt: -1 });

const Config = mongoose.model('Config', configSchema);

export default Config;
