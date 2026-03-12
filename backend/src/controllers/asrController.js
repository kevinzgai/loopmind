import { recognizeFile as aliRecognizeFile } from "../services/voice/aliAsrService.js";
import { recognizeFile as siliconRecognizeFile } from "../services/voice/siliconFlowAsrService.js";
import { convertToPcm } from "../utils/audioConverter.js";
import { getConfigUnmasked } from "../services/database/configService.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEBUG_AUDIO_DIR = path.join(__dirname, '../../../../tmp/asr-debug');

// 确保调试目录存在
if (!fs.existsSync(DEBUG_AUDIO_DIR)) {
  fs.mkdirSync(DEBUG_AUDIO_DIR, { recursive: true });
}

/**
 * @api {post} /external/asr 语音识别
 * @apiName AudioRecognition
 * @apiGroup ExternalASR
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} X-API-Key API 访问密钥
 * @apiHeader {String} Content-Type multipart/form-data 或 application/json
 * 
 * @apiBody {File} [file] 音频文件 (multipart/form-data)
 * @apiBody {String} [audio] Base64编码的音频数据 (application/json)
 * @apiBody {String} [format] 音频格式 (如 'wav', 'mp3', 'pcm')
 * @apiBody {Number} [sampleRate=16000] 采样率
 * @apiBody {String} [provider] 服务提供商 (siliconflow/aliyun)
 * 
 * @apiSuccess {Boolean} success 请求是否成功
 * @apiSuccess {String} text 识别结果文本
 * @apiSuccess {String} timestamp 时间戳
 */
export async function handleRecognition(req, res) {
  try {
    const config = await getConfigUnmasked();
    const speechConfig = config.speech || {};
    const asrProvider = req.body.provider || speechConfig.asrProvider || "siliconflow";

    // 检查是否有音频数据
    if (!req.file && !req.body.audio) {
      return res.status(400).json({
        error: "No audio data",
        message: "未提供音频数据",
      });
    }

    // 获取音频数据
    let audioBuffer;
    let format = "pcm";

    if (req.file) {
      audioBuffer = req.file.buffer;
      console.log(`🎙️ ASR 收到文件: size=${audioBuffer.length} bytes, mimetype=${req.file.mimetype}, originalname=${req.file.originalname}`);
      
      // 临时保存用于调试
      const debugFile = path.join(DEBUG_AUDIO_DIR, `audio_${Date.now()}_${req.file.originalname}`);
      fs.writeFileSync(debugFile, audioBuffer);
      console.log(`💾 ASR 调试文件已保存: ${debugFile}`);

      if (req.file.mimetype.includes("wav") || req.file.originalname.endsWith(".wav")) {
        format = "wav";
      } else if (req.file.mimetype.includes("webm") || req.file.originalname.endsWith(".webm")) {
        format = "webm";
      } else if (req.file.mimetype.includes("mp3") || req.file.originalname.endsWith(".mp3")) {
        format = "mp3";
      } else if (req.file.mimetype.includes("ogg") || req.file.originalname.endsWith(".ogg")) {
        format = "ogg";
      }
      console.log(`🎙️ 检测到格式: ${format}`);
    } else if (req.body.audio) {
      const base64Data = req.body.audio.replace(/^data:audio\/\w+;base64,/, "");
      audioBuffer = Buffer.from(base64Data, "base64");
      format = req.body.format || "pcm";
    }

    if (req.body.format) {
      format = req.body.format;
    }

    // 检查音频数据大小
    if (audioBuffer.length < 100) {
      return res.status(400).json({
        error: "Audio data too small",
        message: "音频数据太小，请确保录音时间足够长",
      });
    }

    const sampleRate = parseInt(req.body.sampleRate) || 16000;
    let result;

    if (asrProvider === "siliconflow") {
      result = await siliconRecognizeFile(audioBuffer, { format, sampleRate }, speechConfig.siliconflow);
    } else if (asrProvider === "aliyun") {
      let pcmBuffer = audioBuffer;
      if (format === "webm" || format === "mp3" || format === "ogg" || format === "wav") {
        try {
          pcmBuffer = await convertToPcm(audioBuffer, format, { sampleRate, channels: 1, bitDepth: 16 });
        } catch (convertError) {
          return res.status(400).json({
            error: "Audio conversion failed",
            message: `音频转换失败: ${convertError.message}。请尝试使用 WAV 格式或确保录音数据完整。`,
          });
        }
      }

      const options = {
        format: "pcm",
        sampleRate: sampleRate,
        enablePunctuationPrediction: req.body.enablePunctuation !== false,
        enableInverseTextNormalization: req.body.enableITN !== false,
      };
      result = await aliRecognizeFile(pcmBuffer, options, speechConfig.aliyun);
    } else {
      return res.status(400).json({
        error: "Unsupported ASR provider",
        message: `不支持的 ASR 提供商: ${asrProvider}`,
      });
    }

    res.json({
      success: true,
      text: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: "Recognition failed",
      message: error.message,
    });
  }
}

/**
 * 健康检查
 */
export async function healthCheck(req, res) {
  try {
    const config = await getConfigUnmasked();
    const speechConfig = config.speech || {};
    const asrProvider = speechConfig.asrProvider || "siliconflow";

    let isConfigured = false;
    if (asrProvider === "aliyun") {
      const { checkConfig } = await import("../services/voice/aliAsrService.js");
      isConfigured = checkConfig(speechConfig.aliyun);
    } else if (asrProvider === "siliconflow") {
      isConfigured = !!speechConfig.siliconflow?.apiKey;
    }

    res.json({
      status: "ok",
      service: asrProvider === "aliyun" ? "Aliyun ASR" : "SiliconFlow ASR",
      configured: isConfigured,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}
