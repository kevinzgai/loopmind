import {
  textToSpeech as aliTextToSpeech,
  getSupportedVoices as getAliVoices,
  checkConfig as checkAliConfig,
} from "../services/aliTtsService.js";
import {
  textToSpeech as siliconTextToSpeech,
  getSupportedVoices as getSiliconVoices,
} from "../services/siliconFlowTtsService.js";
import { SILICONFLOW_API_KEY } from "../config/config.js";

/**
 * 处理文字转语音请求
 */
export async function handleTextToSpeech(req, res) {
  try {
    const { text, voice, format, volume, speechRate, pitchRate } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text parameter" });
    }

    console.log("📨 收到 TTS 请求:", {
      text: text.substring(0, 50),
      voice,
      format,
    });

    let audioBuffer;

speechRate || 1.0,
      });
    } else {
      console.log("☁️ 使用阿里云 TTS 服务");
      // 检查阿里云配置
      if (!checkAliConfig()) {
        return res.status(500).json({
          error: "TTS service not configured",
          message:
            "TTS 服务未配置。请提供 SILICONFLOW_API_KEY 或配置阿里云 TTS。",
        });
      }

      audioBuffer = await aliTextToSpeech(text, {
        voice,
        format: format || "mp3",
        volume,
        speechRate,
        pitchRate,
>>>>>>> f6e64c2 (feat: 完善系统配置页面与智能体表单)
      });
    }

    // 设置响应头
    const contentType = format === "wav" ? "audio/wav" : "audio/mpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="speech.${format || "mp3"}"`,
    );

    // 发送音频数据
    res.send(audioBuffer);

    console.log("✅ TTS 响应已发送");
  } catch (error) {
    console.error("❌ TTS 请求处理失败:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "TTS service error",
        message: error.message,
      });
    }
  }
}

/**
 * 处理流式文字转语音请求
 */
export async function handleTextToSpeechStream(req, res) {
  try {
    const { text, voice, format, volume, speechRate, pitchRate } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text parameter" });
    }

    console.log("📨 收到流式 TTS 请求");

    let audioBuffer;

    // 优先使用硅基流动
    if (SILICONFLOW_API_KEY) {
      console.log("🚀 使用硅基流动 TTS 服务 (Stream 模拟)");
      audioBuffer = await siliconTextToSpeech(text, {
        voice: voice || "anna",
        speed: speechRate || 1.0,
      });
    } else {
      // 检查阿里云配置
      if (!checkAliConfig()) {
        return res.status(500).json({
          error: "TTS service not configured",
          message: "TTS 服务未配置",
        });
      }

      // 阿里云 TTS 不支持真正的流式，但我们可以快速返回
      audioBuffer = await aliTextToSpeech(text, {
        voice,
        format: format || "mp3",
        volume,
        speechRate,
        pitchRate,
      });
    }

    // 设置响应头
    const contentType = format === "wav" ? "audio/wav" : "audio/mpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="speech.${format || "mp3"}"`,
    );

    // 发送音频数据
    res.send(audioBuffer);

    console.log("✅ 流式 TTS 响应已完成");
  } catch (error) {
    console.error("❌ 流式 TTS 请求处理失败:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "TTS stream service error",
        message: error.message,
      });
    }
  }
}

/**
 * 获取支持的语音列表
 */
export async function handleGetVoices(req, res) {
  try {
    let voices = [];
    if (SILICONFLOW_API_KEY) {
      voices = getSiliconVoices();
    } else {
      voices = getAliVoices();
    }
    res.json({ voices });
  } catch (error) {
    console.error("❌ 获取语音列表失败:", error);
    res.status(500).json({
      error: "Failed to get voices",
      message: error.message,
    });
  }
}
