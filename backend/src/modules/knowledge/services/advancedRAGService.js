import { generateEmbeddings } from './embeddingService.js';
import { searchVector } from './vectorStoreService.js';
import KnowledgeChunk from '../models/KnowledgeChunkSchema.js';
import KnowledgeBase from '../models/KnowledgeBaseSchema.js';

/**
 * 高级 RAG 检索服务
 * 支持多知识库混合检索、关键词+向量混合搜索
 */
class AdvancedRAGService {
  /**
   * 多知识库并行检索
   * @param {string[]} knowledgeBaseIds - 多个知识库 ID
   * @param {string} query - 查询文本
   * @param {object} options - 检索选项
   */
  async multiKBSearch(knowledgeBaseIds, query, options = {}) {
    const { topK = 3, minScore = 0.5 } = options;

    if (!knowledgeBaseIds?.length) return [];

    // 并行检索所有知识库
    const searchPromises = knowledgeBaseIds.map((kbId) =>
      this.hybridSearch(kbId, query, { topK, minScore }).catch((err) => {
        console.error(`❌ 知识库 ${kbId} 检索失败:`, err.message);
        return [];
      })
    );

    const results = await Promise.all(searchPromises);

    // 合并结果并去重
    const merged = results.flat();
    const deduped = this.deduplicateResults(merged);

    // 重新排序（按相关性分数）
    deduped.sort((a, b) => (b.score || 0) - (a.score || 0));

    return deduped.slice(0, topK * knowledgeBaseIds.length);
  }

  /**
   * 混合搜索：关键词搜索 + 向量搜索融合
   */
  async hybridSearch(knowledgeBaseId, query, options = {}) {
    const { topK = 5, vectorWeight = 0.7, keywordWeight = 0.3, minScore = 0.3 } = options;

    const [vectorResults, keywordResults] = await Promise.all([
      this.vectorSearch(knowledgeBaseId, query, { topK: topK * 2 }),
      this.keywordSearch(knowledgeBaseId, query, { topK: topK * 2 }),
    ]);

    // RRF (Reciprocal Rank Fusion) 融合
    const fusedResults = this.reciprocalRankFusion(
      vectorResults,
      keywordResults,
      vectorWeight,
      keywordWeight
    );

    return fusedResults
      .filter((r) => r.score >= minScore)
      .slice(0, topK);
  }

  /**
   * 纯向量检索
   */
  async vectorSearch(knowledgeBaseId, query, options = {}) {
    const { topK = 5 } = options;

    try {
      const queryEmbedding = await generateEmbeddings([query]);
      if (!queryEmbedding?.[0]) return [];

      const results = await searchVector(
        `kb_${knowledgeBaseId}`,
        queryEmbedding[0],
        topK
      );

      return results.map((r, idx) => ({
        ...r,
        score: 1 - (idx / results.length) * 0.5, // 位置衰减分数
        searchType: 'vector',
      }));
    } catch (error) {
      console.error('❌ 向量检索失败:', error.message);
      return [];
    }
  }

  /**
   * 关键词检索（BM25 近似：MongoDB 全文检索）
   */
  async keywordSearch(knowledgeBaseId, query, options = {}) {
    const { topK = 5 } = options;

    try {
      // 提取关键词（去除停用词）
      const keywords = this.extractKeywords(query);
      if (!keywords.length) return [];

      // 构建正则表达式匹配
      const keywordRegex = keywords.map((k) => `(?=.*${k})`).join('');
      const chunks = await KnowledgeChunk.find({
        knowledgeBaseId,
        content: { $regex: keywordRegex, $options: 'i' },
      })
        .sort({ createdAt: -1 })
        .limit(topK);

      return chunks.map((chunk, idx) => ({
        id: chunk._id.toString(),
        content: chunk.content,
        metadata: {
          documentId: chunk.documentId,
          knowledgeBaseId: chunk.knowledgeBaseId,
        },
        score: 1 - (idx / chunks.length) * 0.5,
        searchType: 'keyword',
      }));
    } catch (error) {
      console.error('❌ 关键词检索失败:', error.message);
      return [];
    }
  }

  /**
   * Reciprocal Rank Fusion 算法融合两个结果集
   */
  reciprocalRankFusion(vectorResults, keywordResults, vectorWeight = 0.7, keywordWeight = 0.3) {
    const k = 60; // RRF 常数
    const scoreMap = new Map();
    const contentMap = new Map();

    // 处理向量检索结果
    vectorResults.forEach((result, rank) => {
      const id = result.id || result._id?.toString();
      if (!id) return;
      const score = (vectorWeight * 1) / (k + rank + 1);
      scoreMap.set(id, (scoreMap.get(id) || 0) + score);
      contentMap.set(id, result);
    });

    // 处理关键词检索结果
    keywordResults.forEach((result, rank) => {
      const id = result.id || result._id?.toString();
      if (!id) return;
      const score = (keywordWeight * 1) / (k + rank + 1);
      scoreMap.set(id, (scoreMap.get(id) || 0) + score);
      if (!contentMap.has(id)) contentMap.set(id, result);
    });

    // 按融合分数排序
    return Array.from(scoreMap.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([id, score]) => ({
        ...contentMap.get(id),
        score,
        searchType: 'hybrid',
      }));
  }

  /**
   * 去重结果
   */
  deduplicateResults(results) {
    const seen = new Set();
    return results.filter((r) => {
      const id = r.id || r._id?.toString();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }

  /**
   * 提取关键词（简单停用词过滤）
   */
  extractKeywords(text) {
    const stopWords = new Set([
      '的', '了', '是', '在', '我', '有', '和', '就', '不', '都', '一',
      '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '什么',
      '怎么', '可以', '吗', '吧', '啊', '哦', '嗯', 'the', 'a', 'an', 'is',
      'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    ]);

    // 提取中文词和英文词
    const cnWords = text.match(/[\u4e00-\u9fa5]{2,}/g) || [];
    const enWords = text.match(/[a-zA-Z]{3,}/g) || [];

    return [...cnWords, ...enWords].filter((w) => !stopWords.has(w.toLowerCase()));
  }

  /**
   * 评估知识库质量
   */
  async evaluateKBQuality(knowledgeBaseId) {
    const chunks = await KnowledgeChunk.find({ knowledgeBaseId });

    if (!chunks.length) {
      return { score: 0, issues: ['知识库为空'], suggestions: ['请上传文档'] };
    }

    const issues = [];
    const suggestions = [];

    // 检查分片数量
    if (chunks.length < 5) {
      issues.push('文档分片数量过少');
      suggestions.push('建议上传更多文档以提升检索效果');
    }

    // 检查平均分片长度
    const avgLength = chunks.reduce((sum, c) => sum + c.content.length, 0) / chunks.length;
    if (avgLength < 50) {
      issues.push('文档分片内容过短');
      suggestions.push('检查文档格式，确保内容完整');
    } else if (avgLength > 800) {
      issues.push('文档分片内容过长');
      suggestions.push('考虑减小分片大小以提升检索精度');
    }

    // 质量评分（0-100）
    let score = 100;
    score -= issues.length * 15;
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      totalChunks: chunks.length,
      avgChunkLength: Math.round(avgLength),
      issues,
      suggestions,
    };
  }

  /**
   * 构建增强的检索上下文
   * 包含来源信息、相关性分数
   */
  buildContext(results, maxLength = 3000) {
    if (!results.length) return '';

    const lines = ['## 相关知识库内容:\n'];
    let totalLength = 0;

    for (const result of results) {
      const content = result.content || result.pageContent || '';
      const source = result.metadata?.source || '知识库';
      const score = result.score ? `(相关度: ${(result.score * 100).toFixed(0)}%)` : '';

      const entry = `### 来源: ${source} ${score}\n${content}\n`;

      if (totalLength + entry.length > maxLength) break;

      lines.push(entry);
      totalLength += entry.length;
    }

    return lines.join('\n');
  }
}

export default new AdvancedRAGService();
