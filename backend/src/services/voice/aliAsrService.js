import WebSocket from "ws";
import crypto from "crypto";
import { getToken } from "./aliTokenService.js";
// 确保环境变量已加载
import "../../config/config.js";

/**
 * 阿里云 ASR（语音识别）服务
 * 使用 WebSocket 实时语音识别
 * 文档: https://help.aliyun.com/document_detail/90727.html
 */

// 从环境变量获取配置
function getConfig() {
  return {
    appKey: process.env.ALI_ASR_APP_KEY || process.env.ALI_TTS_APP_KEY || "",
  };
}

/**
 * 创建 WebSocket 连接进行实时语音识别
 * @param {Object} options - 配置选项
 * @param {Object} config - 服务配置 (appKey, accessKeyId, accessKeySecret)
 * @returns {Promise<WebSocket>}
 */
export async function createAsrConnection(options = {}, config = {}) {
  const appKey =
    config.appKey || process.env.ALI_ASR_APP_KEY || process.env.ALI_TTS_APP_KEY;
  const accessKeyId = config.accessKeyId || process.env.ALI_TTS_ACCESS_KEY_ID;
  const accessKeySecret =
    config.accessKeySecret || process.env.ALI_TTS_ACCESS_KEY_SECRET;

  if (!appKey) {
    throw new Error("阿里云 ASR AppKey 未配置");
  }

  // 获取 Token
  const { token } = await getToken({ accessKeyId, accessKeySecret });

  const {
    format = "pcm",
    sampleRate = 16000,
    enableIntermediateResult = true,
    enablePunctuationPrediction = true,
    enableInverseTextNormalization = true,
  } = options;

  // 构建 WebSocket URL
  const url = `wss://nls-gateway-cn-shanghai.aliyuncs.com/ws/v1`;

  console.log("🎤 创建阿里云 ASR WebSocket 连接...");

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url, {
      headers: {
        "X-NLS-Token": token,
      },
    });

    ws.on("open", () => {
      console.log("✅ ASR WebSocket 连接已建立");

      // 生成 task_id 并保存到 ws 对象上，供后续使用
      const taskId = generateTaskId();
      ws.taskId = taskId;
      ws.appKey = appKey;

      // 发送开始识别指令
      const startMessage = {
        header: {
          message_id: generateMessageId(),
          task_id: taskId,
          namespace: "SpeechTranscriber",
          name: "StartTranscription",
          appkey: appKey,
        },
        payload: {
          format: format,
          sample_rate: sampleRate,
          enable_intermediate_result: enableIntermediateResult,
          enable_punctuation_prediction: enablePunctuationPrediction,
          enable_inverse_text_normalization: enableInverseTextNormalization,
        },
      };

      ws.send(JSON.stringify(startMessage));
      console.log("📤 已发送开始识别指令, task_id:", taskId);

      resolve(ws);
    });

    ws.on("error", (error) => {
      console.error("❌ ASR WebSocket 错误:", error);
      reject(error);
    });
  });
}

/**
 * 发送音频数据
 * @param {WebSocket} ws - WebSocket 连接
 * @param {Buffer} audioData - 音频数据
 */
export function sendAudioData(ws, audioData) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(audioData);
  } else {
    console.warn("⚠️ WebSocket 未就绪，无法发送音频数据");
  }
}

/**
 * 停止识别
 * @param {WebSocket} ws - WebSocket 连接
 */
export function stopRecognition(ws) {
  if (ws.readyState === WebSocket.OPEN) {
    // 使用开始时保存的 appKey
    const appKey =
      ws.appKey ||
      process.env.ALI_ASR_APP_KEY ||
      process.env.ALI_TTS_APP_KEY ||
      "";

    // 使用开始时保存的 task_id
    const taskId = ws.taskId || generateTaskId();

    const stopMessage = {
      header: {
        message_id: generateMessageId(),
        task_id: taskId,
        namespace: "SpeechTranscriber",
        name: "StopTranscription",
        appkey: appKey,
      },
    };

    ws.send(JSON.stringify(stopMessage));
    console.log("🛑 已发送停止识别指令, task_id:", taskId);
  }
}

/**
 * 一次性文件识别（WebSocket 方式）
 * @param {Buffer} audioBuffer - 音频文件数据
 * @param {Object} options - 配置选项
 * @param {Object} config - 服务配置
 * @returns {Promise<string>} 识别结果文本
 */
export async function recognizeFile(audioBuffer, options = {}, config = {}) {
  try {
    const {
      format = "pcm",
      sampleRate = 16000,
      enablePunctuationPrediction = true,
      enableInverseTextNormalization = true,
    } = options;

    console.log("🎤 开始文件语音识别...");
    console.log("📊 音频信息:", {
      size: audioBuffer.length,
      format,
      sampleRate,
    });

    // 如果是 WebM 格式，需要提取 PCM 数据
    // 注意：WebM 是容器格式，包含 Opus 编码的音频
    // 阿里云 ASR 需要 PCM 原始音频数据
    // 这里我们先尝试直接发送，如果失败再考虑转换

    // 使用 WebSocket 进行文件识别
    const ws = await createAsrConnection(
      {
        format: "pcm", // 强制使用 PCM 格式
        sampleRate,
        enableIntermediateResult: true,
        enablePunctuationPrediction,
        enableInverseTextNormalization,
      },
      config,
    );

    return new Promise((resolve, reject) => {
      let finalResult = "";
      let sentenceResults = [];

      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log("📨 收到消息:", message.header.name);

          if (message.header.name === "TranscriptionStarted") {
            // 识别已开始
            console.log("✅ 识别已开始");
          } else if (message.header.name === "TranscriptionResultChanged") {
            // 中间结果
            console.log("📝 中间结果:", message.payload.result);
          } else if (message.header.name === "SentenceBegin") {
            // 句子开始
            console.log("📨 收到消息: SentenceBegin");
          } else if (message.header.name === "SentenceEnd") {
            // 句子结束
            const result = message.payload.result;
            console.log("✅ 句子识别完成:", result);
            sentenceResults.push(result);
          } else if (message.header.name === "TranscriptionCompleted") {
            // 识别完成
            finalResult = sentenceResults.join("");
            console.log("🎉 识别完成，最终结果:", finalResult);
            ws.close();
            resolve(finalResult || "未识别到内容");
          } else if (message.header.name === "TaskFailed") {
            // 识别失败 - 但如果已经有识别结果，就返回结果而不是错误
            if (sentenceResults.length > 0) {
              finalResult = sentenceResults.join("");
              console.log("⚠️ 收到 TaskFailed 但已有识别结果:", finalResult);
              ws.close();
              resolve(finalResult);
            } else {
              console.error("❌ 识别失败:", message);
              ws.close();
              reject(
                new Error(
                  `识别失败: ${message.header.status_text || message.header.message}`,
                ),
              );
            }
          }
        } catch (error) {
          console.error("❌ 解析消息失败:", error);
        }
      });

      ws.on("error", (error) => {
        console.error("❌ WebSocket 错误:", error);
        reject(error);
      });

      ws.on("close", () => {
        console.log("🔌 WebSocket 连接已关闭");
      });

      // 等待连接建立后再发送音频
      setTimeout(() => {
        if (format === "webm") {
          ws.close();
          reject(
            new Error(
              "WebM 格式暂不支持，请使用 WAV 或 PCM 格式。建议在前端使用 MediaRecorder 时指定 audio/wav 格式。",
            ),
          );
          return;
        }

        // 分块发送音频数据 - 优化：更大的块，更快的发送
        const chunkSize = 6400; // 增加到 6400 字节（约 200ms 的 16kHz PCM 音频）
        let offset = 0;

        const sendChunk = () => {
          if (offset < audioBuffer.length && ws.readyState === WebSocket.OPEN) {
            const chunk = audioBuffer.subarray(offset, offset + chunkSize);
            sendAudioData(ws, chunk);
            offset += chunkSize;

            // 优化：减少延迟，每 50ms 发送一次（原来是 100ms）
            setTimeout(sendChunk, 50);
          } else if (offset >= audioBuffer.length) {
            // 发送完毕，停止识别
            console.log("📤 音频数据发送完毕");
            // 优化：减少等待时间从 500ms 到 200ms
            setTimeout(() => {
              stopRecognition(ws);
            }, 200);
          }
        };

        // 开始发送 - 优化：减少初始等待时间
        console.log("📤 开始发送音频数据...");
        setTimeout(sendChunk, 200); // 从 500ms 减少到 200ms
      }, 300); // 从 1000ms 减少到 300ms
    });
  } catch (error) {
    console.error("❌ 文件识别失败:", error);
    throw new Error(`语音识别失败: ${error.message}`);
  }
}

/**
 * 生成消息 ID（阿里云要求的格式：32位十六进制字符串）
 */
function generateMessageId() {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * 生成任务 ID（阿里云要求的格式：32位十六进制字符串）
 */
function generateTaskId() {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * 检查配置是否完整
 * @param {Object} config - 配置对象
 */
export function checkConfig(config = {}) {
  const appKey =
    config.appKey ||
    process.env.ALI_ASR_APP_KEY ||
    process.env.ALI_TTS_APP_KEY ||
    "";
  const accessKeyId =
    config.accessKeyId || process.env.ALI_TTS_ACCESS_KEY_ID || "";
  const accessKeySecret =
    config.accessKeySecret || process.env.ALI_TTS_ACCESS_KEY_SECRET || "";

  if (!appKey || !accessKeyId || !accessKeySecret) {
    console.error("❌ 阿里云 ASR 配置不完整");
    console.error("当前配置:", {
      appKey: appKey ? `${appKey.substring(0, 8)}...` : "未设置",
      accessKeyId: accessKeyId ? `${accessKeyId.substring(0, 8)}...` : "未设置",
      accessKeySecret: accessKeySecret ? "已设置" : "未设置",
    });
    return false;
  }
  return true;
}

export default {
  createAsrConnection,
  sendAudioData,
  stopRecognition,
  recognizeFile,
  checkConfig,
};
