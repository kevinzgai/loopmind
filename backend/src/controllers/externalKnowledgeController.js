import { createRetriever } from '../modules/knowledge/services/langchainRetriever.js';

/**
 * @api {post} /external/knowledge/:kbId/query 知识库查询
 * @apiName ExternalKnowledgeQuery
 * @apiGroup ExternalKnowledge
 * @apiVersion 1.0.0
 * 
 * @apiHeader {String} X-API-Key API 访问密钥
 * 
 * @apiParam {String} kbId 知识库ID
 * @apiBody {String} query 查询关键词
 * @apiBody {Number} [topK=3] 返回结果数量
 * 
 * @apiSuccess {String} kbId 知识库ID
 * @apiSuccess {String} query 查询关键词
 * @apiSuccess {Object[]} results 检索结果列表
 * @apiSuccess {String} results.content 文档内容
 * @apiSuccess {Object} results.metadata 文档元数据
 */
export async function handleExternalKnowledgeQuery(req, res) {
  try {
    const { kbId } = req.params;
    const { query, topK = 3 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Missing query parameter' });
    }

    // 创建检索器
    const retriever = createRetriever(kbId, { topK });
    
    // 执行检索
    const docs = await retriever.invoke(query);

    // 格式化结果
    const results = docs.map(doc => ({
      content: doc.pageContent,
      metadata: doc.metadata
    }));

    res.json({
      kbId,
      query,
      results
    });

  } catch (error) {
    console.error('❌ 外部知识库查询错误:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
