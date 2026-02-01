import https from "https";
import http from "http";
// 确保环境变量已加载
import "../config/config.js";

/**
 * 阿里云百炼 TTS 服务
 * 使用 RESTful API 调用
 * 文档: https://help.aliyun.com/zh/model-studio/get-api-key
 */

// qwen3-tts-flash 模型支持的音色列表（根据官方文档）
const flashModelVoices = [
  // 普通话音色
  "Cherry",
  "Serena",
  "Chelsie",
  "Momo",
  "Vivian",
  "Moon",
  "Maia",
  "Kai",
  "Nofish",
  "Bella",
  // 方言音色
  "Jada",
  "Dylan",
  "Li",
  "Marcus",
  "Roy",
  "Peter",
  "Sunny",
  "Eric",
  "Rocky",
  "Kiki"
];

// 从环境变量获取配置（延迟读取以确保 dotenv 已加载）
function getConfig() {
  return {
    apiKey: process.env.DASHSCOPE_API_KEY || "",
  };
}

/**
 * 语音合成（使用阿里百炼大模型 RESTful API）
 */
export async function textToSpeech(text, options = {}, config = {}) {
  try {
    // 获取配置
    const apiKey = config.apiKey || process.env.DASHSCOPE_API_KEY;

    // 检查配置
    if (!apiKey) {
      throw new Error("阿里云百炼 TTS 服务未配置");
    }

    const {
      voice = "Cherry",
      format = "mp3",
      speechRate, // 保留参数但不使用（qwen3-tts-flash 不支持速度调整）
      useLangChain = false, // 是否使用 LangChain
    } = options;

    // 验证声音是否支持，如果不支持使用默认声音
    // qwen3-tts-flash 模型只支持特定的音色列表
    const validVoice = flashModelVoices.includes(voice) ? voice : "Cherry";
    if (voice !== validVoice) {
      console.warn(`⚠️  声音 ${voice} 不支持，使用默认声音 ${validVoice}`);
    }

    console.log("🔊 阿里云百炼 TTS 开始转换:", {
      text: text.substring(0, 50),
      voice: validVoice,
      format,
      useLangChain,
      apiKey: apiKey.substring(0, 8) + "...",
    });

    // 如果使用 LangChain
    if (useLangChain) {
      return await textToSpeechWithLangChain(text, { ...options, voice: validVoice }, config);
    }

    // 构建请求体
    const bodyContent = JSON.stringify({
      model: "qwen3-tts-flash",
      input: {
        text: text,
        voice: validVoice,
        language_type: "Chinese"
      }
    });

    // 阿里百炼 TTS API URL
    // 默认为北京地域，如果需要使用新加坡地域，需要修改 URL 和 API Key
    const url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

    console.log("📤 阿里云 TTS 请求详情:");
    console.log("  URL:", url);
    console.log("  请求体:", bodyContent);
    console.log("  API Key:", apiKey.substring(0, 8) + "...");

    // 发送 POST 请求
    const audioBuffer = await new Promise((resolve, reject) => {
      const postData = bodyContent;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      console.log("📤 请求头:", JSON.stringify(options.headers, null, 2));

      const req = https.request(url, options, (res) => {
        console.log("📥 阿里云 TTS 响应详情:");
        console.log("  状态码:", res.statusCode);
        console.log("  状态消息:", res.statusMessage);
        console.log("  响应头:", JSON.stringify(res.headers, null, 2));

        const chunks = [];

        res.on("data", (chunk) => {
          chunks.push(chunk);
        });

        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const contentType = res.headers["content-type"];

          console.log("📦 阿里云 TTS 响应数据详情:");
          console.log("  响应大小:", buffer.length, "bytes");
          console.log("  Content-Type:", contentType);

          // 检查响应类型
          if (contentType && contentType.includes("application/json")) {
            // 解析 JSON 响应
            try {
              const response = JSON.parse(buffer.toString("utf-8"));
              console.log("📄 解析后的 JSON 响应:", JSON.stringify(response, null, 2));
              if (response.output && (response.output.audio_url || response.output.audio?.url)) {
                // 获取音频URL
                const audioUrl = response.output.audio_url || response.output.audio.url;
                console.log("🔗 音频 URL:", audioUrl);
                // 下载音频文件
                const httpModule = audioUrl.startsWith('https://') ? https : http;
                httpModule.get(audioUrl, (audioRes) => {
                  console.log("📥 开始下载音频文件...");
                  const audioChunks = [];
                  audioRes.on("data", (audioChunk) => {
                    audioChunks.push(audioChunk);
                  });
                  audioRes.on("end", () => {
                    const audioBuffer = Buffer.concat(audioChunks);
                    console.log("✅ 音频下载完成，大小:", audioBuffer.length, "bytes");
                    resolve(audioBuffer);
                  });
                  audioRes.on("error", (audioErr) => {
                    console.error("❌ 音频下载失败:", audioErr);
                    reject(new Error(`音频下载失败: ${audioErr.message}`));
                  });
                }).on("error", (err) => {
                  console.error("❌ 音频 URL 请求失败:", err);
                  reject(new Error(`音频 URL 请求失败: ${err.message}`));
                });
              } else {
                console.error("❌ API 错误响应:", response);
                reject(new Error(`API 错误: ${response.error?.message || "未知错误"}`));
              }
            } catch (parseError) {
              console.error("❌ 解析响应失败:", parseError);
              reject(new Error(`解析响应失败: ${parseError.message}`));
            }
          } else {
            // 直接返回音频数据
            console.log("✅ 直接返回音频数据");
            resolve(buffer);
          }
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.write(postData);
      req.end();
    });

    console.log(
      "✅ 阿里云百炼 TTS 转换成功，音频大小:",
      audioBuffer.length,
      "bytes",
    );
    return audioBuffer;
  } catch (error) {
    console.error("❌ 阿里云百炼 TTS 转换失败:", error);
    throw new Error(`阿里云百炼 TTS 服务异常: ${error.message}`);
  }
}

/**
 * 使用 LangChain 进行语音合成
 */
export async function textToSpeechWithLangChain(text, options = {}, config = {}) {
  try {
    const apiKey = config.apiKey || process.env.DASHSCOPE_API_KEY;
    
    if (!apiKey) {
      throw new Error("阿里云百炼 TTS 服务未配置");
    }

    const {
      voice = "Cherry",
      format = "mp3",
      speechRate, // 保留参数但不使用（qwen3-tts-flash 不支持速度调整）
    } = options;

    // 验证声音是否支持，如果不支持使用默认声音
    // qwen3-tts-flash 模型只支持特定的音色列表
    const validVoice = flashModelVoices.includes(voice) ? voice : "Cherry";
    if (voice !== validVoice) {
      console.warn(`⚠️  声音 ${voice} 不支持，使用默认声音 ${validVoice}`);
    }

    console.log("🔗 使用 LangChain 调用阿里云百炼 TTS:", {
      text: text.substring(0, 50),
      voice: validVoice,
      format,
    });

    // 注意：LangChain 目前没有直接的阿里云 TTS 集成
    // 这里使用 OpenAI TTS 作为示例，实际项目中可能需要开发自定义 LangChain 集成
    // 或者使用现有的 TTS 实现
    
    // 构建请求体
    const bodyContent = JSON.stringify({
      model: "qwen3-tts-flash",
      input: {
        text: text,
        voice: validVoice,
        language_type: "Chinese"
      }
    });

    // 阿里百炼 TTS API URL
    const url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

    // 发送 POST 请求
    const audioBuffer = await new Promise((resolve, reject) => {
      const postData = bodyContent;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(postData),
        },
      };

      const req = https.request(url, options, (res) => {
        const chunks = [];

        res.on("data", (chunk) => {
          chunks.push(chunk);
        });

        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const contentType = res.headers["content-type"];

          // 检查响应类型
          if (contentType && contentType.includes("application/json")) {
            // 解析 JSON 响应
            try {
              const response = JSON.parse(buffer.toString("utf-8"));
              if (response.output && (response.output.audio_url || response.output.audio?.url)) {
                // 获取音频URL
                const audioUrl = response.output.audio_url || response.output.audio.url;
                // 下载音频文件
                const httpModule = audioUrl.startsWith('https://') ? https : http;
                httpModule.get(audioUrl, (audioRes) => {
                  const audioChunks = [];
                  audioRes.on("data", (audioChunk) => {
                    audioChunks.push(audioChunk);
                  });
                  audioRes.on("end", () => {
                    const audioBuffer = Buffer.concat(audioChunks);
                    resolve(audioBuffer);
                  });
                  audioRes.on("error", (audioErr) => {
                    reject(new Error(`音频下载失败: ${audioErr.message}`));
                  });
                }).on("error", (err) => {
                  reject(new Error(`音频 URL 请求失败: ${err.message}`));
                });
              } else {
                console.error("❌ API 错误响应:", response);
                reject(new Error(`API 错误: ${response.error?.message || "未知错误"}`));
              }
            } catch (parseError) {
              console.error("❌ 解析响应失败:", parseError);
              reject(new Error(`解析响应失败: ${parseError.message}`));
            }
          } else {
            // 直接返回音频数据
            resolve(buffer);
          }
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.write(postData);
      req.end();
    });

    console.log(
      "✅ LangChain 阿里云百炼 TTS 转换成功，音频大小:",
      audioBuffer.length,
      "bytes",
    );
    return audioBuffer;
  } catch (error) {
    console.error("❌ LangChain 阿里云百炼 TTS 转换失败:", error);
    throw new Error(`LangChain 阿里云百炼 TTS 服务异常: ${error.message}`);
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
    const fs = await import("fs");
    const path = await import("path");

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
    // 普通话音色
    {
      id: "Cherry",
      name: "Cherry",
      type: "标准女声",
      scene: "普通话",
      quality: "标准",
    },
    {
      id: "Serena",
      name: "Serena",
      type: "温柔女声",
      scene: "普通话",
      quality: "标准",
    },
    {
      id: "Chelsie",
      name: "Chelsie",
      type: "活力女声",
      scene: "普通话",
      quality: "标准",
    },
    {
      id: "Momo",
      name: "Momo",
      type: "可爱女声",
      scene: "普通话",
      quality: "标准",
    },
    {
      id: "Vivian",
      name: "Vivian",
      type: "知性女声",
      scene: "普通话",
      quality: "标准",
    },
    {
      id: "Moon",
      name: "Moon",
      type: "成熟女声",
      scene: "普通话",
      quality: "标准",
    },
    {
      id: "Maia",
      name: "Maia",
      type: "甜美女声",
      scene: "普通话",
      quality: "标准",
    },
    {
      id: "Kai",
      name: "Kai",
      type: "标准男声",
      scene: "普通话",
      quality: "标准",
    },
    {
      id: "Nofish",
      name: "Nofish",
      type: "磁性男声",
      scene: "普通话",
      quality: "标准",
    },
    {
      id: "Bella",
      name: "Bella",
      type: "活泼女声",
      scene: "普通话",
      quality: "标准",
    },
    // 方言音色
    {
      id: "Jada",
      name: "Jada",
      type: "粤语女声",
      scene: "方言",
      quality: "标准",
    },
    {
      id: "Dylan",
      name: "Dylan",
      type: "粤语男声",
      scene: "方言",
      quality: "标准",
    },
    {
      id: "Li",
      name: "Li",
      type: "台湾话女声",
      scene: "方言",
      quality: "标准",
    },
    {
      id: "Marcus",
      name: "Marcus",
      type: "台湾话男声",
      scene: "方言",
      quality: "标准",
    },
    {
      id: "Roy",
      name: "Roy",
      type: "东北话男声",
      scene: "方言",
      quality: "标准",
    },
    {
      id: "Peter",
      name: "Peter",
      type: "东北话男声",
      scene: "方言",
      quality: "标准",
    },
    {
      id: "Sunny",
      name: "Sunny",
      type: "东北话女声",
      scene: "方言",
      quality: "标准",
    },
    {
      id: "Eric",
      name: "Eric",
      type: "四川话男声",
      scene: "方言",
      quality: "标准",
    },
    {
      id: "Rocky",
      name: "Rocky",
      type: "四川话男声",
      scene: "方言",
      quality: "标准",
    },
    {
      id: "Kiki",
      name: "Kiki",
      type: "四川话女声",
      scene: "方言",
      quality: "标准",
    },
  ];
}

/**
 * 检查配置是否完整
 * @returns {boolean} 配置是否完整
 */
export function checkConfig() {
  const { apiKey } = getConfig();

  if (!apiKey) {
    console.error("❌ 阿里云百炼 TTS 配置不完整");
    console.error("当前配置:", {
      apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : "未设置",
    });
    console.error("请在 .env 文件中配置:");
    console.error("  DASHSCOPE_API_KEY=your_dashscope_api_key");
    console.error("或在前端管理界面配置阿里云百炼 API Key");
    return false;
  }
  return true;
}

export default {
  textToSpeech,
  textToSpeechFile,
  batchTextToSpeech,
  getSupportedVoices,
  checkConfig,
};
