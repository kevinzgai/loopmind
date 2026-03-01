import {
  SILICONFLOW_API_KEY,
  SILICONFLOW_BASE_URL,
  SILICONFLOW_TTS_MODEL,
} from "../../config/config.js";

/**
 * 硅基流动 TTS (文字转语音) 服务
 */

/**
 * 预处理 TTS 文本，过滤掉 Markdown 符号和特殊字符
 */
function preprocessText(text) {
  if (!text) return "";
  
  return text
    // 1. 过滤 Markdown 标题 (### Header)
    .replace(/^#+\s+/gm, "")
    // 2. 过滤 Markdown 列表符号 (- Item, * Item, + Item)
    .replace(/^[\s]*[-*+]\s+/gm, "")
    // 3. 过滤 Markdown 粗体和斜体 (***bold***, **bold**, *italic*)
    .replace(/\*{1,3}(.*?)\*{1,3}/g, "$1")
    .replace(/_{1,3}(.*?)_{1,3}/g, "$1")
    // 4. 过滤代码块和行内代码 (`code`, ```code```)
    .replace(/`{1,3}(.*?)/g, "$1")
    // 5. 过滤 Markdown 链接 [text](url) -> text
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    // 6. 过滤分割线 (---, ***, ___)
    .replace(/^[\s]*[-*_]{3,}[\s]*$/gm, "")
    // 7. 过滤引用符号 (> text)
    .replace(/^[\s]*>\s+/gm, "")
    // 8. 过滤一些容易被读出来的特殊符号，但保留基本标点 (,.!?;:()，。！？：；（）)
    .replace(/[#*`~_<>|\\{}[\]]/g, "")
    // 9. 将多个连续空格/换行合并为一个
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 文字转语音
 * @param {string} text - 要转换的文字
 * @param {Object} options - 配置选项
 * @param {Object} config - 服务配置 (apiKey, baseURL, ttsModel)
 * @returns {Promise<Buffer>} 音频数据
 */
export async function textToSpeech(text, options = {}, config = {}) {
  try {
    // 预处理文本，过滤符号
    const processedText = preprocessText(text);
    if (!processedText) {
      console.warn("⚠️ TTS 预处理后文本为空，跳过转换");
      return Buffer.alloc(0);
    }

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

    // 提取纯音色名称 (去掉可能存在的前缀)
    let pureVoiceName = targetVoice;
    if (targetVoice.includes(":")) {
      pureVoiceName = targetVoice.split(":").pop();
    }

    // 检查是否是有效的硅基流动预置音色 (根据用户提供确切列表)
    const validVoices = [
      "alex", "benjamin", "charles", "david", // 男生
      "anna", "bella", "claire", "diana"      // 女生
    ];
    
    if (!validVoices.includes(pureVoiceName.toLowerCase())) {
      console.warn(`⚠️ 检测到未知音色 ID: "${voice}", 已回退到默认音色 "anna"`);
      pureVoiceName = "anna";
    }

    // 根据硅基流动文档，使用系统预置音色时，建议采用 "${model}:${voice}" 的格式
    // 这样可以确保音色与模型完全匹配，避免 Invalid voice 错误
    let finalModel = model || SILICONFLOW_TTS_MODEL || "FunAudioLLM/CosyVoice2-0.5B";
    let finalVoiceId = pureVoiceName.toLowerCase();

    if (validVoices.includes(pureVoiceName.toLowerCase())) {
      // 强制使用 "模型名:音色名" 的标准格式
      finalVoiceId = `${finalModel}:${pureVoiceName.toLowerCase()}`;
      console.log(`💡 检测到系统预置音色，已自动校准为标准格式: "${finalVoiceId}"`);
    } else if (!finalVoiceId.includes(":")) {
      // 如果不是预置音色且没有冒号，尝试补全当前模型前缀 (兼容逻辑)
      finalVoiceId = `${finalModel}:${finalVoiceId}`;
    }
    
    console.log(`🎯 最终确定的参数: model="${finalModel}", voice="${finalVoiceId}"`);

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

    console.log("🔊 硅基流动 TTS 开始转换:", {
      originalText: text.substring(0, 30) + "...",
      processedText: processedText.substring(0, 50) + (processedText.length > 50 ? "..." : ""),
      voice: finalVoiceId,
      model: finalModel,
      speed: finalSpeed,
      originalSpeed: speed,
      gain,
    });

    // 使用自定义请求以支持 gain 和 sample_rate 等 OpenAI SDK 不直接支持的参数
    const requestBody = {
      model: finalModel,
      input: processedText,
      voice: finalVoiceId,
      speed: finalSpeed,
      gain,
      response_format,
      sample_rate,
    };

    console.log("📡 发送请求到硅基流动 API:", {
      url: `${baseURL}/audio/speech`,
      body: { ...requestBody, input: processedText.substring(0, 20) + "..." },
    });

    const fetchResponse = await fetch(`${baseURL}/audio/speech`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!fetchResponse.ok) {
      const errorText = await fetchResponse.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        errorJson = { message: errorText };
      }
      
      const errorMsg = `硅基流动 API 响应错误 (${fetchResponse.status}): ${errorJson.message || errorText}`;
      console.error("❌ " + errorMsg, {
        code: errorJson.code,
        data: errorJson.data
      });
      throw new Error(errorMsg);
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
 * 获取支持的语音列表 (根据用户提供的 SiliconFlow 预置音色列表)
 */
export function getSupportedVoices() {
  // 这 8 个音色属于 fishaudio 系列模型
  const fishModel = "fishaudio/fish-speech-1.5";
  return [
    { id: `alex`, name: "Alex (沉稳男声)", description: "硅基流动预置音色" },
    { id: `benjamin`, name: "Benjamin (低沉男声)", description: "硅基流动预置音色" },
    { id: `charles`, name: "Charles (磁性男声)", description: "硅基流动预置音色" },
    { id: `david`, name: "David (欢快男声)", description: "硅基流动预置音色" },
    { id: `anna`, name: "Anna (沉稳女声)", description: "硅基流动预置音色" },
    { id: `bella`, name: "Bella (激情女声)", description: "硅基流动预置音色" },
    { id: `claire`, name: "Claire (温柔女声)", description: "硅基流动预置音色" },
    { id: `diana`, name: "Diana (欢快女声)", description: "硅基流动预置音色" },
  ];
}

export default {
  textToSpeech,
  getSupportedVoices,
};
