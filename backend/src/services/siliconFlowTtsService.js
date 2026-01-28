import OpenAI from "openai";
import {
  SILICONFLOW_API_KEY,
  SILICONFLOW_BASE_URL,
  SILICONFLOW_TTS_MODEL,
} from "../config/config.js";

/**
 * 硅基流动 TTS (文字转语音) 服务
 * 使用 OpenAI 兼容接口
 */

const client = new OpenAI({
  apiKey: SILICONFLOW_API_KEY,
  baseURL: SILICONFLOW_BASE_URL,
});

/**
 * 文字转语音
 * @param {string} text - 要转换的文字
 * @param {Object} options - 配置选项
 * @returns {Promise<Buffer>} 音频数据
 */
export async function textToSpeech(text, options = {}) {
  try {
    const {
      voice = "anna",
      model = SILICONFLOW_TTS_MODEL,
      speed = 1.0,
      gain = 0.0,
      response_format = "mp3",
      sample_rate = 44100,
    } = options;

    // 音色 ID 映射逻辑 (处理从前端传来的各种可能的音色 ID)
    let targetVoice = voice;

    // 如果是阿里云默认音色 'xiaoyun'，映射到硅基流动的 'anna'
    if (voice === "xiaoyun") {
      targetVoice = "anna";
    }

    // 提取纯音色名称 (去掉模型前缀)
    let pureVoiceName = targetVoice;
    if (targetVoice.includes(":")) {
      pureVoiceName = targetVoice.split(":").pop();
    }

    // 检查是否是有效的硅基流动预置音色，如果不是，则回退到默认音色 'anna'
    const validVoices = [
      "alex",
      "benjamin",
      "charles",
      "david",
      "anna",
      "bella",
      "claire",
      "diana",
    ];
    if (!validVoices.includes(pureVoiceName.toLowerCase())) {
      console.warn(`⚠️ 检测到无效音色 ID: "${voice}", 已回退到默认音色 "anna"`);
      pureVoiceName = "anna";
    }

    // 重新组合为标准格式: "模型名称:音色名称"
    const fullVoice = `${model}:${pureVoiceName}`;

    // 处理语速参数 (OpenAI 范围 0.25-4.0，阿里云范围 -500-500)
    let finalSpeed = parseFloat(speed);

    // 如果语速看起来是阿里云范围 (-500 到 500)
    if (finalSpeed > 4 || finalSpeed < 0.25) {
      if (finalSpeed === 0) {
        finalSpeed = 1.0; // 阿里云 0 是正常语速
      } else if (finalSpeed > 0) {
        // 映射 0~500 到 1.0~4.0
        finalSpeed = 1.0 + (finalSpeed / 500) * 3.0;
      } else {
        // 映射 -500~0 到 0.25~1.0
        finalSpeed = 1.0 + (finalSpeed / 500) * 0.75;
      }
    }

    // 最终强制限制在 0.25 - 4.0 之间，避免 API 报错
    finalSpeed = Math.max(0.25, Math.min(4.0, finalSpeed));

    console.log("🔊 硅基流动 TTS 开始转换 (CosyVoice2):", {
      text: text.substring(0, 50),
      voice: fullVoice,
      model,
      speed: finalSpeed,
      originalSpeed: speed,
      gain,
    });

    // 使用自定义请求以支持 gain 和 sample_rate 等 OpenAI SDK 不直接支持的参数
    const fetchResponse = await fetch(`${SILICONFLOW_BASE_URL}/audio/speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SILICONFLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        voice: fullVoice,
        input: text,
        speed: finalSpeed,
        gain: gain,
        response_format: response_format,
        sample_rate: sample_rate,
        stream: false,
      }),
    });

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      throw new Error(`API 响应错误 (${fetchResponse.status}): ${errorText}`);
    }

    const arrayBuffer = await fetchResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("✅ 硅基流动 TTS 转换成功，音频大小:", buffer.length, "bytes");
    return buffer;
  } catch (error) {
    console.error("❌ 硅基流动 TTS 转换失败:", error);
    throw new Error(`硅基流动 TTS 服务异常: ${error.message}`);
  }
}

/**
 * 获取支持的语音列表 (根据文档 2.1 系统预置音色)
 */
export function getSupportedVoices() {
  const model = SILICONFLOW_TTS_MODEL || "FunAudioLLM/CosyVoice2-0.5B";
  return [
    { id: `${model}:alex`, name: "Alex", description: "沉稳男声" },
    { id: `${model}:benjamin`, name: "Benjamin", description: "低沉男声" },
    { id: `${model}:charles`, name: "Charles", description: "磁性男声" },
    { id: `${model}:david`, name: "David", description: "欢快男声" },
    { id: `${model}:anna`, name: "Anna", description: "沉稳女声" },
    { id: `${model}:bella`, name: "Bella", description: "激情女声" },
    { id: `${model}:claire`, name: "Claire", description: "温柔女声" },
    { id: `${model}:diana`, name: "Diana", description: "欢快女声" },
  ];
}

export default {
  textToSpeech,
  getSupportedVoices,
};
