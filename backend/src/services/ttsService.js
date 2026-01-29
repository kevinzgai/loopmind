import OpenAI from "openai";
import { API_KEY, BASE_URL } from "../config/config.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化 OpenAI 客户端（用于 TTS）
const openai = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

/**
 * 文字转语音服务
 * @param {string} text - 要转换的文字
 * @param {Object} options - 配置选项
 * @returns {Promise<Buffer>} 音频数据
 */
export async function textToSpeech(text, options = {}, config = {}) {
  try {
    const {
      voice = "alloy", // 可选: alloy, echo, fable, onyx, nova, shimmer
      model = "tts-1", // tts-1 或 tts-1-hd（高清版）
      speed = 150, // 默认语速 150
    } = options;

    // 处理语速参数 (前端 50-400, 150 为正常; OpenAI 范围 0.25-4.0, 1.0 为正常)
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

    console.log("🔊 开始文字转语音:", {
      text: text.substring(0, 50),
      voice,
      model,
      speed: finalSpeed,
      originalSpeed: speed,
    });

    // 初始化 OpenAI 客户端（如果提供了 config，则使用配置，否则回退到默认）
    const client = config.apiKey
      ? new OpenAI({
          apiKey: config.apiKey,
          baseURL: config.baseURL || "https://api.openai.com/v1",
        })
      : openai;

    // 调用 OpenAI TTS API
    const mp3Response = await client.audio.speech.create({
      model,
      voice,
      input: text,
      speed: finalSpeed,
    });

    // 获取音频数据
    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    console.log("✅ 文字转语音成功，音频大小:", buffer.length, "bytes");

    return buffer;
  } catch (error) {
    console.error("❌ 文字转语音失败:", error);
    throw new Error(`TTS 服务异常: ${error.message}`);
  }
}

/**
 * 文字转语音并保存到文件
 * @param {string} text - 要转换的文字
 * @param {string} outputPath - 输出文件路径
 * @param {Object} options - 配置选项
 * @returns {Promise<string>} 保存的文件路径
 */
export async function textToSpeechFile(text, outputPath, options = {}) {
  try {
    const audioBuffer = await textToSpeech(text, options);

    // 确保输出目录存在
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 保存音频文件
    fs.writeFileSync(outputPath, audioBuffer);

    console.log("💾 音频文件已保存:", outputPath);

    return outputPath;
  } catch (error) {
    console.error("❌ 保存音频文件失败:", error);
    throw new Error(`保存音频文件异常: ${error.message}`);
  }
}

/**
 * 流式文字转语音（用于大段文字）
 * @param {string} text - 要转换的文字
 * @param {Object} options - 配置选项
 * @returns {Promise<ReadableStream>} 音频流
 */
export async function textToSpeechStream(text, options = {}) {
  try {
    const { voice = "alloy", model = "tts-1", speed = 1.0 } = options;

    console.log("🔊 开始流式文字转语音");

    const mp3Response = await openai.audio.speech.create({
      model,
      voice,
      input: text,
      speed,
      response_format: "mp3",
    });

    return mp3Response.body;
  } catch (error) {
    console.error("❌ 流式文字转语音失败:", error);
    throw new Error(`TTS 流式服务异常: ${error.message}`);
  }
}

/**
 * 批量文字转语音
 * @param {Array<string>} texts - 文字数组
 * @param {Object} options - 配置选项
 * @returns {Promise<Array<Buffer>>} 音频数据数组
 */
export async function batchTextToSpeech(texts, options = {}) {
  try {
    console.log("🔊 开始批量文字转语音，数量:", texts.length);

    const audioBuffers = await Promise.all(
      texts.map((text) => textToSpeech(text, options)),
    );

    console.log("✅ 批量文字转语音完成");

    return audioBuffers;
  } catch (error) {
    console.error("❌ 批量文字转语音失败:", error);
    throw new Error(`批量 TTS 服务异常: ${error.message}`);
  }
}

/**
 * 获取支持的语音列表
 * @returns {Array<Object>} 语音列表
 */
export function getSupportedVoices() {
  return [
    { id: "alloy", name: "Alloy", description: "中性、平衡的声音" },
    { id: "echo", name: "Echo", description: "男性、清晰的声音" },
    { id: "fable", name: "Fable", description: "英式、温暖的声音" },
    { id: "onyx", name: "Onyx", description: "男性、深沉的声音" },
    { id: "nova", name: "Nova", description: "女性、活泼的声音" },
    { id: "shimmer", name: "Shimmer", description: "女性、柔和的声音" },
  ];
}

export default {
  textToSpeech,
  textToSpeechFile,
  textToSpeechStream,
  batchTextToSpeech,
  getSupportedVoices,
};
