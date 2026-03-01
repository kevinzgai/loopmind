import {
  createAgent,
  getUserAgents,
  getPublishedAgents,
  getAgent,
  updateAgent,
  publishAgent,
  unpublishAgent,
  deleteAgent,
  getOrCreateMemory,
  getUserMemory,
} from "../services/agentService.js";
import { callAI } from "../../../services/ai/aiService.js";

/**
 * 智能体控制器
 */

/**
 * 自动生成智能体配置
 * POST /api/agent/generate-config
 */
export async function handleGenerateAgentConfig(req, res, next) {
  try {
    const { prompt, type = 'personality' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: {
          message: "请描述你想要的智能体",
          code: "MISSING_PROMPT",
        },
      });
    }

    let systemPrompt = '';
    
    if (type === 'personality') {
      systemPrompt = `你是一位专业的AI智能体设计师。用户想要创建一个智能体，描述如下：

"${prompt}"

请为这个智能体生成详细的人设与指令。要求：
1. 明确智能体的角色定位和专业领域
2. 描述智能体的性格特点和说话风格
3. 说明智能体擅长处理的问题类型
4. 设定智能体的回答方式和注意事项

请直接输出人设内容，不要包含任何其他说明文字。字数控制在200-500字。`;
    } else {
      systemPrompt = `You are an expert AI agent designer.
User request: "${prompt}"

Generate a valid JSON configuration for an AI agent based on the request.
The JSON must have these fields:
- name: A creative name (string)
- description: A short description (string, max 100 chars)
- category: Suggest a category (string), choose from: '编程', '写作', '生活', '教育', '娱乐', '职场', '创意'.
- personality: A detailed system prompt defining the agent's role, style, and constraints (string)
- initialMemory: A greeting message (string)
- avatar: A single emoji char (string)
- voice: Suggest a voice id (string), choose from: 'xiaoxian' (female), 'xiaoyu' (male), 'yoyo' (child). Default to 'xiaoxian'.

Return ONLY the raw JSON string. Do not include markdown formatting like \`\`\`json.`;
    }

    const aiResponse = await callAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ]);

    const content = aiResponse.choices[0].message.content.trim();

    if (type === 'personality') {
      res.status(200).json({
        message: "人设生成成功",
        personality: content,
      });
    } else {
      let configStr = content;
      if (configStr.startsWith("```json")) {
        configStr = configStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (configStr.startsWith("```")) {
        configStr = configStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const config = JSON.parse(configStr);

      res.status(200).json({
        message: "Agent config generated",
        config,
      });
    }
  } catch (error) {
    console.error("❌ Failed to generate agent config:", error);
    next(error);
  }
}

/**
 * 创建智能体
 * POST /api/agent/create
 */
export async function handleCreateAgent(req, res, next) {
  try {
    const userId = req.user.userId;
    const {
      name,
      description,
      avatar,
      category,
      model,
      personality,
      initialMemory,
      voice,
      speechRate,
      knowledgeBaseId,
    } = req.body;

    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        error: {
          message: "智能体名称不能为空",
          code: "MISSING_NAME",
        },
      });
    }

    const agent = await createAgent(userId, req.user.username, {
      name,
      description,
      avatar,
      category: category || "生活",
      model: model || "deepseek",
      personality,
      initialMemory,
      voice,
      speechRate,
      knowledgeBaseId,
    });

    res.status(201).json({
      message: "智能体创建成功",
      agent,
    });
  } catch (error) {
    console.error("❌ 创建智能体失败:", error.message);
    next(error);
  }
}

/**
 * 获取用户的智能体列表
 * GET /api/agent/my-agents
 */
export async function handleGetUserAgents(req, res, next) {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const result = await getUserAgents(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      message: "获取用户智能体列表成功",
      ...result,
    });
  } catch (error) {
    console.error("❌ 获取用户智能体列表失败:", error.message);
    next(error);
  }
}

/**
 * 获取已发布的智能体列表（广场）
 * GET /api/agent/published
 */
export async function handleGetPublishedAgents(req, res, next) {
  try {
    const { page = 1, limit = 10, category, search } = req.query;

    const result = await getPublishedAgents({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      search,
    });

    res.status(200).json({
      message: "获取已发布智能体列表成功",
      ...result,
    });
  } catch (error) {
    console.error("❌ 获取已发布智能体列表失败:", error.message);
    next(error);
  }
}

/**
 * 获取智能体详情
 * GET /api/agent/:agentId
 */
export async function handleGetAgent(req, res, next) {
  try {
    const { agentId } = req.params;

    const agent = await getAgent(agentId);

    res.status(200).json({
      message: "获取智能体详情成功",
      agent,
    });
  } catch (error) {
    console.error("❌ 获取智能体详情失败:", error.message);
    next(error);
  }
}

/**
 * 更新智能体
 * PUT /api/agent/:agentId
 */
export async function handleUpdateAgent(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId } = req.params;
    const updateData = req.body;

    const agent = await updateAgent(agentId, userId, updateData);

    res.status(200).json({
      message: "智能体更新成功",
      agent,
    });
  } catch (error) {
    console.error("❌ 更新智能体失败:", error.message);
    next(error);
  }
}

/**
 * 发布智能体
 * POST /api/agent/:agentId/publish
 */
export async function handlePublishAgent(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId } = req.params;

    const agent = await publishAgent(agentId, userId);

    res.status(200).json({
      message: "智能体发布成功",
      agent,
    });
  } catch (error) {
    console.error("❌ 发布智能体失败:", error.message);
    next(error);
  }
}

/**
 * 下架智能体
 * POST /api/agent/:agentId/unpublish
 */
export async function handleUnpublishAgent(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId } = req.params;

    const agent = await unpublishAgent(agentId, userId);

    res.status(200).json({
      message: "智能体下架成功",
      agent,
    });
  } catch (error) {
    console.error("❌ 下架智能体失败:", error.message);
    next(error);
  }
}
export async function handleDeleteAgent(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId } = req.params;

    const result = await deleteAgent(agentId, userId);

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ 删除智能体失败:", error.message);
    next(error);
  }
}

/**
 * 获取用户与智能体的记忆
 * GET /api/agent/:agentId/memory
 */
export async function handleGetMemory(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId } = req.params;

    const memory = await getUserMemory(agentId, userId);

    res.status(200).json({
      message: "获取记忆成功",
      memory: memory || {
        agentId,
        userId,
        content: "",
        contentLength: 0,
        conversationCount: 0,
        keywords: [],
      },
    });
  } catch (error) {
    console.error("❌ 获取记忆失败:", error.message);
    next(error);
  }
}

export default {
  handleCreateAgent,
  handleGetUserAgents,
  handleGetPublishedAgents,
  handleGetAgent,
  handleUpdateAgent,
  handlePublishAgent,
  handleUnpublishAgent,
  handleDeleteAgent,
  handleGetMemory,
};
