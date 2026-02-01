import {
  textToSpeech as aliTextToSpeech,
  getSupportedVoices as getAliVoices,
} from "../services/aliTtsService.js";
import {
  textToSpeech as siliconTextToSpeech,
  getSupportedVoices as getSiliconVoices,
} from "../services/siliconFlowTtsService.js";
import { getConfigUnmasked } from "../services/configService.js";

/**
 * @api {post} /external/tts 文字转语音
 * @apiName TextToSpeech
 * @apiGroup ExternalTTS
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} X-API-Key API 访问密钥
 * 
 * @apiBody {String} text 要转换的文本
 * @apiBody {String} [voice] 音色ID (如 'anna', 'xiaoxian')
 * @apiBody {Number} [speechRate] 语速 (默认 150)
 * @apiBody {Number} [volume] 音量
 * @apiBody {String} [format='mp3'] 音频格式 (mp3/wav)
 * @apiBody {String} [provider] 服务提供商 (siliconflow/aliyun/openai)
 * 
 * @apiSuccess {Buffer} audio 音频二进制数据
 */
export async function handleTextToSpeech(req, res) {
  try {
    const { text, voice, format, volume, speechRate, pitchRate } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text parameter" });
    }

    // 获取系统配置
    const config = await getConfigUnmasked();
    const speechConfig = config.speech || {};
    // 优先使用请求参数中的 provider，否则使用系统配置
    const ttsProvider = req.body.provider || speechConfig.ttsProvider || "siliconflow";

    // 处理音色和语速的回退逻辑：请求参数 > 系统配置提供商默认值 > 系统全局默认值
    const effectiveVoice =
      voice ||
      speechConfig[ttsProvider]?.ttsVoice ||
      (ttsProvider === "siliconflow"
        ? "anna"
        : ttsProvider === "aliyun"
          ? "Cherry"
          : "anna");

    const effectiveSpeechRate =
      speechRate || speechConfig[ttsProvider]?.speechRate || 150;

    console.log("📨 收到 TTS 请求:", {
      text: text.substring(0, 50),
      voice: effectiveVoice,
      speechRate: effectiveSpeechRate,
      format,
      provider: ttsProvider,
    });

    let audioBuffer;

    if (ttsProvider === "siliconflow") {
      console.log("🚀 使用硅基流动 TTS 服务");
      audioBuffer = await siliconTextToSpeech(
        text,
        {
          voice: effectiveVoice,
          speed: effectiveSpeechRate,
        },
        speechConfig.siliconflow,
      );
    } else if (ttsProvider === "aliyun") {
      console.log("☁️ 使用阿里云 TTS 服务");
      audioBuffer = await aliTextToSpeech(
        text,
        {
          voice: effectiveVoice,
          format: format || "mp3",
          volume: volume ?? speechConfig.aliyun?.volume,
          // qwen3-tts-flash 模型不支持速度调整，因此不传递 speechRate 参数
          pitchRate: pitchRate ?? speechConfig.aliyun?.pitchRate,
        },
        speechConfig.aliyun,
      );
    } else {
      return res.status(400).json({
        error: "Unsupported TTS provider",
        message: `不支持的 TTS 提供商: ${ttsProvider}`,
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

    // 获取系统配置
    const config = await getConfigUnmasked();
    const speechConfig = config.speech || {};
    const ttsProvider = speechConfig.ttsProvider || "siliconflow";

    // 处理音色和语速的回退逻辑：请求参数 > 系统配置提供商默认值 > 系统全局默认值
    const effectiveVoice =
      voice ||
      speechConfig[ttsProvider]?.ttsVoice ||
      (ttsProvider === "siliconflow"
        ? "anna"
        : ttsProvider === "aliyun"
          ? "Cherry"
          : "anna");

    const effectiveSpeechRate =
      speechRate || speechConfig[ttsProvider]?.speechRate || 150;

    console.log("📨 收到流式 TTS 请求:", {
      text: text.substring(0, 50),
      voice: effectiveVoice,
      speechRate: effectiveSpeechRate,
      format,
      provider: ttsProvider,
    });

    let audioBuffer;

    if (ttsProvider === "siliconflow") {
      console.log("🚀 使用硅基流动 TTS 服务 (Stream 模拟)");
      audioBuffer = await siliconTextToSpeech(
        text,
        {
          voice: effectiveVoice,
          speed: effectiveSpeechRate,
        },
        speechConfig.siliconflow,
      );
    } else if (ttsProvider === "aliyun") {
      console.log("☁️ 使用阿里云 TTS 服务 (Stream 模拟)");
      audioBuffer = await aliTextToSpeech(
        text,
        {
          voice: effectiveVoice,
          format: format || "mp3",
          volume: volume ?? speechConfig.aliyun?.volume,
          // qwen3-tts-flash 模型不支持速度调整，因此不传递 speechRate 参数
          pitchRate: pitchRate ?? speechConfig.aliyun?.pitchRate,
        },
        speechConfig.aliyun,
      );
    } else {
      return res.status(400).json({
        error: "Unsupported TTS provider",
        message: `不支持的 TTS 提供商: ${ttsProvider}`,
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
 * @api {get} /external/tts/voices 获取音色列表
 * @apiName GetVoices
 * @apiGroup ExternalTTS
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} X-API-Key API 访问密钥
 * 
 * @apiSuccess {Object[]} voices 音色列表
 * @apiSuccess {String} voices.id 音色ID
 * @apiSuccess {String} voices.name 音色名称
 * @apiSuccess {String} voices.lang 语言
 */
export async function handleGetVoices(req, res) {
  try {
    const config = await getConfigUnmasked();
    const speechConfig = config.speech || {};
    const ttsProvider = speechConfig.ttsProvider || "siliconflow";

    let voices = [];
    if (ttsProvider === "siliconflow") {
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
