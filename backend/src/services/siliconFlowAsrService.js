import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";

/**
 * 硅基流动 ASR（语音识别）服务
 * 使用 OpenAI 兼容接口进行语音转文本
 * 文档: https://docs.siliconflow.cn/cn/api-reference/audio/create-audio-transcriptions
 */

// 获取配置
function getConfig() {
  return {
    apiKey: process.env.SILICONFLOW_API_KEY || "",
    baseURL:
      process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1",
    model: process.env.SILICONFLOW_ASR_MODEL || "FunAudioLLM/SenseVoiceSmall",
  };
}

/**
 * 文件语音识别
 * @param {Buffer} audioBuffer - 音频文件数据
 * @param {Object} options - 配置选项
 * @returns {Promise<string>} 识别结果文本
 */
export async function recognizeFile(audioBuffer, options = {}) {
  const { apiKey, baseURL, model: defaultModel } = getConfig();

  if (!apiKey) {
    throw new Error("硅基流动 API Key 未配置");
  }

  const model = options.model || defaultModel;
  const tempFilePath = path.join(tmpdir(), `asr-${uuidv4()}.wav`);

  try {
    console.log("🎤 硅基流动 ASR 开始识别...");
    console.log("📊 音频大小:", audioBuffer.length, "bytes");
    console.log("⚙️ 模型:", model);

    // 将 Buffer 写入临时文件，因为 OpenAI SDK 识别文件通常需要文件流或 File 对象
    fs.writeFileSync(tempFilePath, audioBuffer);

    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseURL,
    });

    // 调用 SiliconFlow ASR API (OpenAI 兼容接口)
    const transcription = await client.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: model,
      response_format: "text",
    });

    // 统一处理返回结果
    let resultText = "";
    if (typeof transcription === "string") {
      resultText = transcription;
    } else if (transcription && typeof transcription === "object") {
      // 使用索引访问以绕过类型检查
      resultText = transcription["text"] || "";
    }

    console.log("✅ 硅基流动 ASR 识别成功:", resultText);
    return resultText || "未识别到内容";
  } catch (error) {
    console.error("❌ 硅基流动 ASR 识别失败:", error);
    throw new Error(`硅基流动 ASR 服务异常: ${error.message}`);
  } finally {
    // 清理临时文件
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {
        console.warn("⚠️ 无法删除临时音频文件:", tempFilePath);
      }
    }
  }
}

export default {
  recognizeFile,
};
