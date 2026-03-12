import {
  textToSpeech as aliTextToSpeech,
  getSupportedVoices as getAliVoices,
} from "../services/voice/aliTtsService.js";
import {
  textToSpeech as siliconTextToSpeech,
  getSupportedVoices as getSiliconVoices,
} from "../services/voice/siliconFlowTtsService.js";
import { getConfigUnmasked } from "../services/database/configService.js";
import { success, error } from "../utils/response.js";

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
 * @apiSuccess {Buffer} audio 音频二进制数据 (直接返回音频流)
 * 
 * @apiError (Error 1001) {Number} code 1001 参数错误
 * @apiError (Error 1001) {Object} data null
 * @apiError (Error 1001) {String} message 错误信息
 */
export async function handleTextToSpeech(req, res) {
  try {
    const { text, voice, format, volume, speechRate, pitchRate } = req.body;

    if (!text) {
      return error(res, '缺少 text 参数', 1001, 400);
    }

    const config = await getConfigUnmasked();
    const speechConfig = config.speech || {};
    
    // 忽略前端传来的 provider，使用系统配置的默认 TTS 提供商
    const ttsProvider = speechConfig.ttsProvider || "siliconflow";

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
          speechRate: effectiveSpeechRate,
          volume: volume ?? speechConfig.aliyun?.volume,
          pitchRate: pitchRate ?? speechConfig.aliyun?.pitchRate,
        },
        speechConfig.aliyun,
      );
    } else {
      return error(res, `不支持的 TTS 提供商: ${ttsProvider}`, 1001, 400);
    }

    const contentType = format === "wav" ? "audio/wav" : "audio/mpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="speech.${format || "mp3"}"`,
    );

    res.send(audioBuffer);

    console.log("✅ TTS 响应已发送");
  } catch (err) {
    console.error("❌ TTS 请求处理失败:", err);
    if (!res.headersSent) {
      return error(res, err.message || 'TTS 服务错误', -1, 500);
    }
  }
}

/**
 * @api {post} /external/tts/stream 流式文字转语音
 * @apiName TextToSpeechStream
 * @apiGroup ExternalTTS
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} X-API-Key API 访问密钥
 * 
 * @apiBody {String} text 要转换的文本
 * @apiBody {String} [voice] 音色ID
 * @apiBody {Number} [speechRate] 语速
 * @apiBody {String} [format='mp3'] 音频格式
 * @apiBody {String} [provider] 服务提供商
 * 
 * @apiSuccess {Buffer} audio 音频二进制数据流
 */
export async function handleTextToSpeechStream(req, res) {
  try {
    const { text, voice, format, volume, speechRate, pitchRate } = req.body;

    if (!text) {
      return error(res, '缺少 text 参数', 1001, 400);
    }

    const config = await getConfigUnmasked();
    const speechConfig = config.speech || {};
    const ttsProvider = speechConfig.ttsProvider || "siliconflow";

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
          speechRate: effectiveSpeechRate,
          volume: volume ?? speechConfig.aliyun?.volume,
          pitchRate: pitchRate ?? speechConfig.aliyun?.pitchRate,
        },
        speechConfig.aliyun,
      );
    } else {
      return error(res, `不支持的 TTS 提供商: ${ttsProvider}`, 1001, 400);
    }

    const contentType = format === "wav" ? "audio/wav" : "audio/mpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", audioBuffer.length);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="speech.${format || "mp3"}"`,
    );

    res.send(audioBuffer);

    console.log("✅ 流式 TTS 响应已完成");
  } catch (err) {
    console.error("❌ 流式 TTS 请求处理失败:", err);
    if (!res.headersSent) {
      return error(res, err.message || 'TTS 流服务错误', -1, 500);
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
 * @apiSuccess {Number} code 状态码，0 表示成功
 * @apiSuccess {Object} data 返回数据
 * @apiSuccess {Object[]} data.voices 音色列表
 * @apiSuccess {String} data.voices.id 音色ID
 * @apiSuccess {String} data.voices.name 音色名称
 * @apiSuccess {String} data.voices.lang 语言
 * @apiSuccess {String} message 提示信息
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
    return success(res, { voices }, '获取音色列表成功');
  } catch (err) {
    return error(res, err.message || '获取语音列表失败', -1, 500);
  }
}
