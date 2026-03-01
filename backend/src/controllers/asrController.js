import { recognizeFile as aliRecognizeFile } from "../services/voice/aliAsrService.js";
import { recognizeFile as siliconRecognizeFile } from "../services/voice/siliconFlowAsrService.js";
import { convertToPcm } from "../utils/audioConverter.js";
import { getConfigUnmasked } from "../services/database/configService.js";

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
    console.log("📨 收到 ASR 请求");

    // 获取系统配置
    const config = await getConfigUnmasked();
    const speechConfig = config.speech || {};
    // 优先使用请求体中的 provider，否则使用系统默认配置
    const asrProvider = req.body.provider || speechConfig.asrProvider || "siliconflow";

    console.log("📋 Content-Type:", req.headers["content-type"]);
    console.log("⚙️ ASR Provider:", asrProvider);

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
      // 从文件上传获取
      audioBuffer = req.file.buffer;
      // 从文件名或 mimetype 推断格式
      if (
        req.file.mimetype.includes("wav") ||
        req.file.originalname.endsWith(".wav")
      ) {
        format = "wav";
      } else if (
        req.file.mimetype.includes("webm") ||
        req.file.originalname.endsWith(".webm")
      ) {
        format = "webm";
      } else if (
        req.file.mimetype.includes("mp3") ||
        req.file.originalname.endsWith(".mp3")
      ) {
        format = "mp3";
      }
      console.log(
        "📁 文件上传:",
        req.file.originalname,
        "大小:",
        audioBuffer.length,
        "bytes",
      );
    } else if (req.body.audio) {
      // 从 base64 获取
      const base64Data = req.body.audio.replace(/^data:audio\/\w+;base64,/, "");
      audioBuffer = Buffer.from(base64Data, "base64");
      format = req.body.format || "pcm";
      console.log("📦 Base64 数据大小:", audioBuffer.length, "bytes");
    }

    // 从请求中获取格式参数（优先级更高）
    if (req.body.format) {
      format = req.body.format;
    }

    console.log("🎤 原始音频数据大小:", audioBuffer.length, "bytes");
    console.log("⚙️ 音频格式:", format);

    // 检查音频数据大小
    if (audioBuffer.length < 100) {
      return res.status(400).json({
        error: "Audio data too small",
        message: "音频数据太小，请确保录音时间足够长",
      });
    }

    // 获取识别选项
    const sampleRate = parseInt(req.body.sampleRate) || 16000;

    let result;

    if (asrProvider === "siliconflow") {
      console.log("🚀 使用硅基流动 ASR 服务");
      // 硅基流动支持多种格式，通常不需要转换
      // 注意：SiliconFlow 的 ASR API 更好支持 mp3/wav
      // 如果是 webm，我们也直接传，OpenAI SDK 通常能处理
      result = await siliconRecognizeFile(
        audioBuffer,
        {
          format: format,
          sampleRate: sampleRate,
        },
        speechConfig.siliconflow,
      );
    } else if (asrProvider === "aliyun") {
      console.log("☁️ 使用阿里云 ASR 服务");
      // 阿里云需要 PCM
      let pcmBuffer = audioBuffer;
      if (
        format === "webm" ||
        format === "mp3" ||
        format === "ogg" ||
        format === "wav"
      ) {
        console.log("🔄 正在转换音频格式:", format, "→ PCM");
        try {
          pcmBuffer = await convertToPcm(audioBuffer, format, {
            sampleRate: sampleRate,
            channels: 1,
            bitDepth: 16,
          });
          console.log(
            "✅ 音频转换完成，PCM 数据大小:",
            pcmBuffer.length,
            "bytes",
          );
        } catch (convertError) {
          console.error("❌ 音频转换失败:", convertError);
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

    console.log("✅ 识别成功:", result);

    // 返回结果
    res.json({
      success: true,
      text: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ ASR 请求处理失败:", error);
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
