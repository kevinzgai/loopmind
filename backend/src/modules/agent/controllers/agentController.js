import { success, error as errorResp } from '../../../utils/response.js';
import Agent from '../models/AgentSchema.js';
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
      return errorResp(res, '请描述你想要的智能体', -1, 400);
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
      return success(res, { personality: content }, '人设生成成功');
    } else {
      let configStr = content;
      if (configStr.startsWith('```json')) {
        configStr = configStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (configStr.startsWith('```')) {
        configStr = configStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      const config = JSON.parse(configStr);
      return success(res, { config }, 'Agent config generated');
    }
  } catch (err) {
    console.error('❌ Failed to generate agent config:', err);
    return errorResp(res, 'Internal server error', -1, 500);
  }
}

/**
 * 获取已发布智能体的实际分类列表
 * GET /api/agent/categories
 */
export async function handleGetAgentCategories(req, res, next) {
  try {
    const categories = await Agent.distinct('category', { isPublished: true });
    const sorted = categories.filter(Boolean).sort();
    return success(res, { categories: sorted }, '获取分类列表成功');
  } catch (err) {
    console.error('❌ 获取分类列表失败:', err.message);
    return errorResp(res, 'Internal server error', -1, 500);
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
      knowledgeBaseIds,
      enableKnowledgeBase,
      ttsConfig,
      greeting,
      sensitiveWords,
      variables,
      tools,
      features
    } = req.body;

    if (!name) {
      return errorResp(res, '智能体名称不能为空', -1, 400);
    }

    const agent = await createAgent(userId, req.user.username, {
      name,
      description,
      avatar,
      category: category || '生活',
      model: model || 'deepseek',
      personality,
      initialMemory,
      voice,
      speechRate,
      knowledgeBaseId,
      knowledgeBaseIds: knowledgeBaseIds || [],
      enableKnowledgeBase: enableKnowledgeBase || false,
      ttsConfig: ttsConfig || { voice: 'Cherry', speechRate: 150, autoPlay: false },
      greeting: greeting || { enabled: false, text: '', quickQuestions: [] },
      sensitiveWords: sensitiveWords || [],
      variables: variables || [],
      tools: tools || [],
      features: features || {
        conversationOperator: true,
        nextQuestionSuggestion: false,
        textToSpeech: false,
        speechToText: false,
        contentModeration: true
      }
    });

    return success(res, { agent }, '智能体创建成功', 201);
  } catch (err) {
    console.error('❌ 创建智能体失败:', err.message);
    return errorResp(res, 'Internal server error', -1, 500);
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
    const result = await getUserAgents(userId, { page: parseInt(page), limit: parseInt(limit) });
    return success(res, result, '获取用户智能体列表成功');
  } catch (err) {
    console.error('❌ 获取用户智能体列表失败:', err.message);
    return errorResp(res, 'Internal server error', -1, 500);
  }
}

export async function handleGetPublishedAgents(req, res, next) {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const result = await getPublishedAgents({ page: parseInt(page), limit: parseInt(limit), category, search });
    return success(res, result, '获取已发布智能体列表成功');
  } catch (err) {
    console.error('❌ 获取已发布智能体列表失败:', err.message);
    return errorResp(res, 'Internal server error', -1, 500);
  }
}

export async function handleGetAgent(req, res, next) {
  try {
    const { agentId } = req.params;
    const agent = await getAgent(agentId);
    return success(res, { agent }, '获取智能体详情成功');
  } catch (err) {
    console.error('❌ 获取智能体详情失败:', err.message);
    return errorResp(res, 'Internal server error', -1, 500);
  }
}

export async function handleUpdateAgent(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId } = req.params;
    const agent = await updateAgent(agentId, userId, req.body);
    return success(res, { agent }, '智能体更新成功');
  } catch (err) {
    console.error('❌ 更新智能体失败:', err.message);
    return errorResp(res, 'Internal server error', -1, 500);
  }
}

export async function handlePublishAgent(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId } = req.params;
    const agent = await publishAgent(agentId, userId);
    return success(res, { agent }, '智能体发布成功');
  } catch (err) {
    console.error('❌ 发布智能体失败:', err.message);
    return errorResp(res, 'Internal server error', -1, 500);
  }
}

export async function handleUnpublishAgent(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId } = req.params;
    const agent = await unpublishAgent(agentId, userId);
    return success(res, { agent }, '智能体下架成功');
  } catch (err) {
    console.error('❌ 下架智能体失败:', err.message);
    return errorResp(res, 'Internal server error', -1, 500);
  }
}

export async function handleDeleteAgent(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId } = req.params;
    await deleteAgent(agentId, userId);
    return success(res, null, '智能体删除成功');
  } catch (err) {
    console.error('❌ 删除智能体失败:', err.message);
    return errorResp(res, 'Internal server error', -1, 500);
  }
}

export async function handleGetMemory(req, res, next) {
  try {
    const userId = req.user.userId;
    const { agentId } = req.params;
    const memory = await getUserMemory(agentId, userId);
    return success(res, {
      memory: memory || { agentId, userId, content: '', contentLength: 0, conversationCount: 0, keywords: [] }
    }, '获取记忆成功');
  } catch (err) {
    console.error('❌ 获取记忆失败:', err.message);
    return errorResp(res, 'Internal server error', -1, 500);
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
