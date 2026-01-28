import { BaseRetriever } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";
import { searchKnowledge } from "./knowledgeService.js";
import { generateEmbedding } from "./embeddingService.js";

/**
 * 自定义 LangChain 检索器
 * 将现有的 knowledgeService 对接到 LangChain 生态
 */
export class ChartAIRetriever extends BaseRetriever {
  static lc_name() {
    return "ChartAIRetriever";
  }

  constructor(fields) {
    super(fields);
    this.kbId = fields.kbId;
    this.limit = fields.limit || 3;
  }

  async _getRelevantDocuments(query) {
    try {
      // 1. 生成查询向量
      const queryVector = await generateEmbedding(query);
      
      // 2. 调用现有的检索服务
      const chunks = await searchKnowledge(this.kbId, queryVector, this.limit);
      
      // 3. 转换为 LangChain Document 对象
      return chunks.map(chunk => new Document({
        pageContent: chunk.content,
        metadata: {
          ...chunk.metadata,
          score: chunk.score,
          docId: chunk.docId
        }
      }));
    } catch (error) {
      console.error("❌ LangChain Retriever Error:", error);
      return [];
    }
  }
}

/**
 * 工厂函数：为指定知识库创建检索器
 */
export function createRetriever(kbId, limit = 3) {
  return new ChartAIRetriever({ kbId, limit });
}
