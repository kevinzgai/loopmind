import express from "express";
import { authenticateToken, authorizeAdmin, checkPermission } from "../middleware/auth.middleware.js";
import { getConfigUnmasked, updateConfig, getAIConfig, updateAIConfig, getEmbeddingConfig, updateEmbeddingConfig, getSpeechConfig, updateSpeechConfig } from "../services/database/configService.js";
import { testConnectivity } from "../services/ai/aiService.js";
import { textToSpeech as aliTextToSpeech } from "../services/voice/aliTtsService.js";
import { textToSpeech as siliconTextToSpeech } from "../services/voice/siliconFlowTtsService.js";
import path from "path";
import fs from "fs";
import readline from "readline";

const router = express.Router();

// ... (保留之前的 get/put config 路由)

/**
 * @api {get} /admin/logs 获取系统日志
 * @apiName GetSystemLogs
 * @apiGroup Admin
 * @apiDescription 获取最近的系统日志（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {Array} logs 日志列表
 */
router.get("/logs", authenticateToken, checkPermission('system:logs:view'), async (req, res) => {
  try {
    const logDir = "logs";
    if (!fs.existsSync(logDir)) {
      return res.json({ logs: [] });
    }

    // 找到最新的综合日志文件 combined-YYYY-MM-DD.log
    const files = fs
      .readdirSync(logDir)
      .filter((f) => f.startsWith("combined-") && f.endsWith(".log"))
      .sort()
      .reverse(); // 最新的在前

    if (files.length === 0) {
      return res.json({ logs: [] });
    }

    const logFile = path.join(logDir, files[0]);
    const logs = [];

    // 读取最后 1000 行
    const fileStream = fs.createReadStream(logFile);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      try {
        // 尝试解析日志格式
        // 格式: 2025-01-28 16:00:00 [INFO]: message {meta}
        const match = line.match(
          /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\]: (.*)$/,
        );
        if (match) {
          logs.push({
            timestamp: match[1],
            level: match[2].toLowerCase(),
            message: match[3],
          });
        }
      } catch (e) {
        // 忽略解析错误
      }
    }

    // 只返回最后 200 条，避免前端压力过大
    res.json({ logs: logs.slice(-200) });
  } catch (err) {
    console.error("❌ 获取系统日志失败:", err.message);
    res.status(500).json({ error: { message: "服务器错误" } });
  }
});

/**
 * @api {get} /admin/config 获取系统配置
 * @apiName GetSystemConfig
 * @apiGroup Admin
 * @apiDescription 获取系统全局配置（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {String} message 成功消息
 * @apiSuccess {Object} config 系统配置对象
 * @apiSuccess {Object} config.provider 默认 AI 提供商
 * @apiSuccess {Object} config.deepseek DeepSeek 配置
 * @apiSuccess {Object} config.qwen 通义千问配置
 * @apiSuccess {Object} config.doubao 火山引擎配置
 * @apiSuccess {Object} config.glm 智谱GLM配置
 * @apiSuccess {Object} config.moonshot Moonshot配置
 * @apiSuccess {Object} config.modelscope ModelScope (魔搭) 配置
 * @apiSuccess {Object} config.minimax MiniMax配置
 * @apiSuccess {Object} config.seedAsr SeedASR 语音配置
 */
router.get("/config", authenticateToken, checkPermission('system:config:view'), async (req, res) => {
  try {
    const cfg = await getConfigUnmasked();
    res.json({ message: "获取系统配置成功", config: cfg });
  } catch (err) {
    console.error("❌ 获取系统配置失败:", err.message);
    res.status(500).json({ error: { message: "服务器错误" } });
  }
});

/**
 * @api {post} /admin/config/test-connection 测试 AI 连通性
 * @apiName TestAIConnection
 * @apiGroup Admin
 * @apiDescription 测试指定 AI 提供商的配置是否可用
 */
router.post(
  "/config/test-connection",
  authenticateToken,
  checkPermission('system:config:edit'),
  async (req, res) => {
    try {
      const { provider, apiKey, baseURL, model } = req.body;

      if (!provider || !model) {
        return res.status(400).json({ error: { message: "缺少必要参数" } });
      }

      const result = await testConnectivity({
        provider,
        apiKey,
        baseURL,
        model,
      });
      res.json(result);
    } catch (err) {
      console.error("❌ 测试连接失败:", err.message);
      res.status(500).json({ error: { message: err.message || "测试失败" } });
    }
  },
);

/**
 * @api {put} /admin/config 更新系统配置
 * @apiName UpdateSystemConfig
 * @apiGroup Admin
 * @apiDescription 更新系统全局配置（需要管理员权限）
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiBody {String} [provider] 默认 AI 提供商
 * @apiBody {Object} [deepseek] DeepSeek 配置
 * @apiBody {Object} [qwen] 通义千问配置
 * @apiBody {Object} [doubao] 火山引擎配置
 * @apiBody {Object} [glm] 智谱GLM配置
 * @apiBody {Object} [moonshot] Moonshot配置
 * @apiBody {Object} [modelscope] ModelScope (魔搭) 配置
 * @apiBody {Object} [minimax] MiniMax配置
 * @apiBody {Object} [seedAsr] SeedASR 语音配置
 *
 * @apiSuccess {String} message 成功消息
 */
router.put("/config", authenticateToken, checkPermission('system:config:edit'), async (req, res) => {
  try {
    const payload = req.body || {};
    await updateConfig(payload);
    res.json({ message: "系统配置已更新" });
  } catch (err) {
    console.error("❌ 更新系统配置失败:", err.message);
    res.status(400).json({ error: { message: err.message || "请求参数错误" } });
  }
});

/**
 * @api {get} /admin/config/ai 获取 AI 模型配置
 * @apiName GetAIConfig
 * @apiGroup Admin
 * @apiDescription 获取 AI 模型配置（新格式）
 * @apiHeader {String} Authorization Bearer Token
 */
router.get("/config/ai", authenticateToken, checkPermission('system:config:ai'), async (req, res) => {
  try {
    const cfg = await getAIConfig();
    res.json(cfg);
  } catch (err) {
    console.error("❌ 获取 AI 模型配置失败:", err.message);
    res.status(500).json({ error: { message: "服务器错误" } });
  }
});

/**
 * @api {put} /admin/config/ai 更新 AI 模型配置
 * @apiName UpdateAIConfig
 * @apiGroup Admin
 * @apiDescription 更新 AI 模型配置（新格式）
 * @apiHeader {String} Authorization Bearer Token
 */
router.put("/config/ai", authenticateToken, checkPermission('system:config:ai'), async (req, res) => {
  try {
    const payload = req.body || {};
    await updateAIConfig(payload);
    res.json({ message: "AI 模型配置已更新" });
  } catch (err) {
    console.error("❌ 更新 AI 模型配置失败:", err.message);
    res.status(400).json({ error: { message: err.message || "请求参数错误" } });
  }
});

/**
 * @api {get} /admin/config/embedding 获取 Embedding 模型配置
 * @apiName GetEmbeddingConfig
 * @apiGroup Admin
 * @apiDescription 获取 Embedding 模型配置（新格式）
 * @apiHeader {String} Authorization Bearer Token
 */
router.get("/config/embedding", authenticateToken, checkPermission('system:config:embedding'), async (req, res) => {
  try {
    const cfg = await getEmbeddingConfig();
    res.json(cfg);
  } catch (err) {
    console.error("❌ 获取 Embedding 模型配置失败:", err.message);
    res.status(500).json({ error: { message: "服务器错误" } });
  }
});

/**
 * @api {put} /admin/config/embedding 更新 Embedding 模型配置
 * @apiName UpdateEmbeddingConfig
 * @apiGroup Admin
 * @apiDescription 更新 Embedding 模型配置（新格式）
 * @apiHeader {String} Authorization Bearer Token
 */
router.put("/config/embedding", authenticateToken, checkPermission('system:config:embedding'), async (req, res) => {
  try {
    const payload = req.body || {};
    await updateEmbeddingConfig(payload);
    res.json({ message: "Embedding 模型配置已更新" });
  } catch (err) {
    console.error("❌ 更新 Embedding 模型配置失败:", err.message);
    res.status(400).json({ error: { message: err.message || "请求参数错误" } });
  }
});

/**
 * @api {get} /admin/config/speech 获取语音服务配置
 * @apiName GetSpeechConfig
 * @apiGroup Admin
 * @apiDescription 获取语音服务配置（新格式）
 * @apiHeader {String} Authorization Bearer Token
 */
router.get("/config/speech", authenticateToken, checkPermission('system:config:speech'), async (req, res) => {
  try {
    const cfg = await getSpeechConfig();
    res.json(cfg);
  } catch (err) {
    console.error("❌ 获取语音服务配置失败:", err.message);
    res.status(500).json({ error: { message: "服务器错误" } });
  }
});

/**
 * @api {put} /admin/config/speech 更新语音服务配置
 * @apiName UpdateSpeechConfig
 * @apiGroup Admin
 * @apiDescription 更新语音服务配置（新格式）
 * @apiHeader {String} Authorization Bearer Token
 */
router.put("/config/speech", authenticateToken, checkPermission('system:config:speech'), async (req, res) => {
  try {
    const payload = req.body || {};
    await updateSpeechConfig(payload);
    res.json({ message: "语音服务配置已更新" });
  } catch (err) {
    console.error("❌ 更新语音服务配置失败:", err.message);
    res.status(400).json({ error: { message: err.message || "请求参数错误" } });
  }
});

/**
 * @api {post} /admin/config/test-tts 测试 TTS 语音服务
 * @apiName TestTTS
 * @apiGroup Admin
 * @apiDescription 测试指定的 TTS 服务是否可用
 * @apiHeader {String} Authorization Bearer Token
 * 
 * @apiBody {String} provider 服务提供商 (siliconflow/aliyun)
 * @apiBody {String} [text] 测试文本 (默认: "你好，这是语音测试")
 * @apiBody {String} [voice] 音色ID
 * @apiBody {Number} [speechRate] 语速
 * 
 * @apiSuccess {Boolean} success 是否成功
 * @apiSuccess {String} message 结果消息
 * @apiSuccess {String} [audioUrl] 音频URL (可选)
 */
router.post("/config/test-tts", authenticateToken, checkPermission('system:config:speech'), async (req, res) => {
  try {
    const { provider, text = "你好，这是语音测试", voice, speechRate } = req.body;

    if (!provider) {
      return res.status(400).json({ error: { message: "缺少 provider 参数" } });
    }

    // 获取系统配置
    const config = await getConfigUnmasked();
    const speechConfig = config.speech || {};
    const providerConfig = speechConfig[provider] || {};

    // 检查 API Key
    if (!providerConfig.apiKey && provider !== 'edge') {
      return res.status(400).json({ 
        success: false, 
        message: `${provider} 未配置 API Key` 
      });
    }

    let audioBuffer;
    let effectiveVoice = voice || providerConfig.ttsVoice;
    let effectiveSpeechRate = speechRate || providerConfig.speechRate || 150;

    // 设置默认音色
    if (!effectiveVoice) {
      effectiveVoice = provider === 'siliconflow' ? 'anna' : 'Cherry';
    }

    try {
      if (provider === 'siliconflow') {
        console.log("🧪 测试硅基流动 TTS 服务");
        audioBuffer = await siliconTextToSpeech(
          text,
          {
            voice: effectiveVoice,
            speed: effectiveSpeechRate,
          },
          providerConfig,
        );
      } else if (provider === 'aliyun') {
        console.log("🧪 测试阿里云 TTS 服务");
        audioBuffer = await aliTextToSpeech(
          text,
          {
            voice: effectiveVoice,
            format: "mp3",
            // qwen3-tts-flash 模型不支持速度调整，因此不传递 speechRate 参数
          },
          providerConfig,
        );
      } else {
        return res.status(400).json({ 
          success: false, 
          message: `不支持的 TTS 提供商: ${provider}` 
        });
      }

      // 将音频转换为 base64 返回
      const audioBase64 = audioBuffer.toString('base64');
      const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

      res.json({
        success: true,
        message: `${provider} TTS 服务测试成功`,
        audioUrl: audioUrl,
        audioSize: audioBuffer.length,
        voice: effectiveVoice,
        speechRate: effectiveSpeechRate
      });
    } catch (ttsError) {
      console.error("❌ TTS 服务测试失败:", ttsError);
      res.json({
        success: false,
        message: `${provider} TTS 服务测试失败: ${ttsError.message}`
      });
    }
  } catch (err) {
    console.error("❌ 测试 TTS 服务失败:", err.message);
    res.status(500).json({ error: { message: err.message || "服务器错误" } });
  }
});

// ─── 智能体分类管理 ──────────────────────────────────────────────────────────
// 分类数据存储在系统配置的 agentCategories 字段中

/**
 * @api {get} /admin/config/agent-categories 获取智能体分类列表
 * @apiGroup Admin
 */
router.get('/config/agent-categories', authenticateToken, checkPermission('system:config:view'), async (req, res) => {
  try {
    const cfg = await getConfigUnmasked();
    const categories = cfg.agentCategories || [
      { value: '编程', label: '编程', icon: '💻', desc: '代码辅助、算法、架构设计' },
      { value: '写作', label: '写作', icon: '✍️', desc: '文案创作、翻译、论文辅助' },
      { value: '教育', label: '教育', icon: '🎓', desc: '语言学习、学科辅导、知识科普' },
      { value: '生活', label: '生活', icon: '🏠', desc: '饮食健康、旅行、情感咨询' },
      { value: '娱乐', label: '娱乐', icon: '🎮', desc: '游戏角色、同人创作、幽默段子' },
      { value: '职场', label: '职场', icon: '💼', desc: '面试技巧、简历优化、项目管理' },
      { value: '创意', label: '创意', icon: '🎨', desc: '灵感生成、艺术设计助手' }
    ];
    res.json({ categories });
  } catch (err) {
    console.error('❌ 获取分类列表失败:', err.message);
    res.status(500).json({ error: { message: '服务器错误' } });
  }
});

/**
 * @api {put} /admin/config/agent-categories 更新整个分类列表
 * @apiGroup Admin
 */
router.put('/config/agent-categories', authenticateToken, checkPermission('system:config:edit'), async (req, res) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: { message: 'categories 必须是数组' } });
    }
    // 校验每项
    for (const cat of categories) {
      if (!cat.value || !cat.label) {
        return res.status(400).json({ error: { message: '每个分类必须包含 value 和 label' } });
      }
    }
    await updateConfig({ agentCategories: categories });
    res.json({ message: '分类列表已更新', categories });
  } catch (err) {
    console.error('❌ 更新分类列表失败:', err.message);
    res.status(400).json({ error: { message: err.message || '请求参数错误' } });
  }
});

/**
 * @api {post} /admin/config/agent-categories 新增分类
 * @apiGroup Admin
 */
router.post('/config/agent-categories', authenticateToken, checkPermission('system:config:edit'), async (req, res) => {
  try {
    const { value, label, icon, desc } = req.body;
    if (!value || !label) {
      return res.status(400).json({ error: { message: 'value 和 label 不能为空' } });
    }
    const cfg = await getConfigUnmasked();
    const categories = cfg.agentCategories || [];
    if (categories.find(c => c.value === value)) {
      return res.status(400).json({ error: { message: '分类标识已存在' } });
    }
    categories.push({ value, label, icon: icon || '🏷️', desc: desc || '' });
    await updateConfig({ agentCategories: categories });
    res.status(201).json({ message: '分类创建成功', category: { value, label, icon, desc } });
  } catch (err) {
    console.error('❌ 创建分类失败:', err.message);
    res.status(400).json({ error: { message: err.message || '请求参数错误' } });
  }
});

/**
 * @api {put} /admin/config/agent-categories/:value 更新指定分类
 * @apiGroup Admin
 */
router.put('/config/agent-categories/:value', authenticateToken, checkPermission('system:config:edit'), async (req, res) => {
  try {
    const { value } = req.params;
    const { label, icon, desc } = req.body;
    const cfg = await getConfigUnmasked();
    const categories = cfg.agentCategories || [];
    const idx = categories.findIndex(c => c.value === value);
    if (idx === -1) {
      return res.status(404).json({ error: { message: '分类不存在' } });
    }
    if (label) categories[idx].label = label;
    if (icon !== undefined) categories[idx].icon = icon;
    if (desc !== undefined) categories[idx].desc = desc;
    await updateConfig({ agentCategories: categories });
    res.json({ message: '分类更新成功', category: categories[idx] });
  } catch (err) {
    console.error('❌ 更新分类失败:', err.message);
    res.status(400).json({ error: { message: err.message || '请求参数错误' } });
  }
});

/**
 * @api {delete} /admin/config/agent-categories/:value 删除指定分类
 * @apiGroup Admin
 */
router.delete('/config/agent-categories/:value', authenticateToken, checkPermission('system:config:edit'), async (req, res) => {
  try {
    const { value } = req.params;
    const cfg = await getConfigUnmasked();
    const categories = (cfg.agentCategories || []).filter(c => c.value !== value);
    await updateConfig({ agentCategories: categories });
    res.json({ message: '分类已删除' });
  } catch (err) {
    console.error('❌ 删除分类失败:', err.message);
    res.status(400).json({ error: { message: err.message || '请求参数错误' } });
  }
});

export default router;
