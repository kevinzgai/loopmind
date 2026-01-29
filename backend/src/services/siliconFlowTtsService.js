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
 * @param {Object} config - 服务配置 (apiKey, baseURL, ttsModel)
 * @returns {Promise<Buffer>} 音频数据
 */
export async function textToSpeech(text, options = {}, config = {}) {
  try {
    const apiKey = config.apiKey || SILICONFLOW_API_KEY;
    const baseURL = config.baseURL || SILICONFLOW_BASE_URL;
    const model = options.model || config.ttsModel || SILICONFLOW_TTS_MODEL;

    const {
      voice = "anna",
      speed = 150, // 默认语速 150
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

    // 处理语速参数 (前端 50-400, 150 为正常; OpenAI/SiliconFlow 范围 0.25-4.0, 1.0 为正常)
    let finalSpeed = parseFloat(speed);
    if (finalSpeed >= 50 && finalSpeed <= 400) {
      if (finalSpeed <= 150) {
        // 50~150 映射到 0.25~1.0
        finalSpeed = 0.25 + ((finalSpeed - 50) / 100) * 0.75;
      } else {
        // 150~400 映射到 1.0~4.0
        finalSpeed = 1.0 + ((finalSpeed - 150) / 250) * 3.0;
      }
    } else if (finalSpeed < 50) {
      // 如果传进来的是已经映射过的值（如 1.0），则保持原样
      finalSpeed = Math.max(0.25, Math.min(4.0, finalSpeed));
    }
    finalSpeed = Math.max(0.25, Math.min(4.0, finalSpeed));

    console.log("🔊 硅基流动 TTS 开始转换 (FishAudio):", {
      text: text.substring(0, 50),
      voice: `fishaudio:${pureVoiceName.toLowerCase()}`,
      model,
      speed: finalSpeed,
      originalSpeed: speed,
      gain,
    });

    // 使用自定义请求以支持 gain 和 sample_rate 等 OpenAI SDK 不直接支持的参数
    const fetchResponse = await fetch(`${baseURL}/audio/speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text,
        voice: `fishaudio:${pureVoiceName.toLowerCase()}`,
        speed: finalSpeed,
        gain,
        response_format,
        sample_rate,
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
