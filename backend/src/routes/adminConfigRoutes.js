import express from "express";
import { authenticateToken } from "../shared/middleware/authMiddleware.js";
import { authorizeAdmin } from "../shared/middleware/authMiddleware.js";
import { getConfigUnmasked, updateConfig, getAIConfig, updateAIConfig, getEmbeddingConfig, updateEmbeddingConfig } from "../services/configService.js";
import { testConnectivity } from "../services/aiService.js";
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
router.get("/logs", authenticateToken, authorizeAdmin, async (req, res) => {
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
router.get("/config", authenticateToken, authorizeAdmin, async (req, res) => {
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
  authorizeAdmin,
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
router.put("/config", authenticateToken, authorizeAdmin, async (req, res) => {
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
router.get("/config/ai", authenticateToken, authorizeAdmin, async (req, res) => {
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
router.put("/config/ai", authenticateToken, authorizeAdmin, async (req, res) => {
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
router.get("/config/embedding", authenticateToken, authorizeAdmin, async (req, res) => {
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
router.put("/config/embedding", authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const payload = req.body || {};
    await updateEmbeddingConfig(payload);
    res.json({ message: "Embedding 模型配置已更新" });
  } catch (err) {
    console.error("❌ 更新 Embedding 模型配置失败:", err.message);
    res.status(400).json({ error: { message: err.message || "请求参数错误" } });
  }
});

export default router;
