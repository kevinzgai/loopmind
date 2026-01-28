import lancedb from '@lancedb/lancedb';
import path from 'path';
import fs from 'fs/promises';

// 数据存储目录
const DB_DIR = path.join(process.cwd(), 'data', 'lancedb');
const TABLE_NAME = 'knowledge_chunks';

let db = null;
let table = null;

/**
 * 获取数据库连接
 */
async function getDB() {
  if (db) return db;
  
  try {
    // 确保目录存在
    await fs.mkdir(DB_DIR, { recursive: true });
    db = await lancedb.connect(DB_DIR);
    return db;
  } catch (error) {
    console.error('❌ LanceDB 连接失败:', error);
    throw error;
  }
}

/**
 * 获取或创建表
 * @param {number} vectorDim 向量维度，首次创建时需要
 */
async function getTable(vectorDim = 1536) {
  if (table) return table;
  
  const database = await getDB();
  const tableNames = await database.tableNames();
  
  if (tableNames.includes(TABLE_NAME)) {
    table = await database.openTable(TABLE_NAME);
  } else {
    // 首次创建，需要至少一条数据或 schema 定义
    // LanceDB nodejs 客户端通常通过数据推断 schema
    // 这里我们先不创建，等到有数据插入时再创建
    return null; 
  }
  
  return table;
}

/**
 * 批量插入或更新向量数据
 * @param {Array} chunks 数据块数组
 * @param {number} vectorDim 向量维度
 */
export async function upsertChunks(chunks, vectorDim = 1536) {
  if (!chunks || chunks.length === 0) return;

  const database = await getDB();
  const tableNames = await database.tableNames();
  
  // 转换数据格式以适配 LanceDB
  // LanceDB 期望: { id: string, vector: number[], ...metadata }
  // 关键修改：字段名全部小写，避免 SQL 过滤时的大小写敏感问题
  const data = chunks.map(chunk => ({
    id: chunk.id || chunk._id.toString(),
    vector: chunk.embedding,
    content: chunk.content,
    kbid: chunk.kbId.toString(),   // kbId -> kbid
    docid: chunk.docId.toString(), // docId -> docid
    metadata: JSON.stringify(chunk.metadata || {})
  }));

  if (!tableNames.includes(TABLE_NAME)) {
    // 创建表
    console.log(`Creating LanceDB table '${TABLE_NAME}' with ${data.length} records...`);
    table = await database.createTable(TABLE_NAME, data);
  } else {
    table = await database.openTable(TABLE_NAME);
    // 覆盖模式：先删除旧的（如果有），再插入
    // LanceDB 支持 merge/upsert，但简单起见，我们追加数据
    // 注意：LanceDB 目前的 upsert 支持可能有限，通常是 append
    // 如果需要更新，建议先根据 docId 删除旧数据
    // 但 upsertChunks 通常用于新文档，所以直接 add
    await table.add(data);
  }
  
  console.log(`✅ 已向 LanceDB 插入 ${chunks.length} 条向量数据`);
}

/**
 * 删除指定文档的所有向量块
 * @param {string} docId 文档ID
 */
export async function deleteChunksByDocId(docId) {
  const tbl = await getTable();
  if (!tbl) return;
  
  try {
    // LanceDB 删除语法：delete("filter_expression")
    // 使用小写字段名
    await tbl.delete(`docid = '${docId}'`);
    console.log(`🗑️ 已从 LanceDB 删除文档向量: ${docId}`);
  } catch (error) {
    console.error(`❌ 删除 LanceDB 数据失败 (${docId}):`, error);
  }
}

/**
 * 删除指定知识库的所有向量块
 * @param {string} kbId 知识库ID
 */
export async function deleteChunksByKbId(kbId) {
  const tbl = await getTable();
  if (!tbl) return;
  
  try {
    // 使用小写字段名
    await tbl.delete(`kbid = '${kbId}'`);
    console.log(`🗑️ 已从 LanceDB 删除知识库向量: ${kbId}`);
  } catch (error) {
    console.error(`❌ 删除 LanceDB 数据失败 (${kbId}):`, error);
  }
}

/**
 * 向量搜索
 * @param {string} kbId 知识库ID
 * @param {number[]} queryVector 查询向量
 * @param {number} limit 返回数量
 * @returns {Promise<Array>} 搜索结果
 */
export async function searchVector(kbId, queryVector, limit = 5) {
  const tbl = await getTable();
  if (!tbl) return [];
  
  try {
    // 执行向量搜索
    // 使用小写字段名
    const results = await tbl.vectorSearch(queryVector)
      .filter(`kbid = '${kbId}'`) 
      .limit(limit)
      .toArray();
      
    // 转换回应用层格式
    return results.map(row => ({
      id: row.id,
      content: row.content,
      // vector: row.vector, // 通常不需要返回向量
      score: row._distance ? (1 - row._distance) : 0, // LanceDB 默认是 L2 distance (越小越好)，我们需要转化为相似度
      // 注意：如果是 cosine distance，通常 0 是相同，1 是相反。
      // 需要确认 metric type。默认为 L2。
      // 简单处理：仅返回距离或转换后的分数
      docId: row.docid, // docid -> docId
      metadata: row.metadata ? JSON.parse(row.metadata) : {}
    }));
  } catch (error) {
    console.error('❌ 向量搜索失败:', error);
    return [];
  }
}

/**
 * 重置/清空所有数据
 */
export async function resetVectorDB() {
  const database = await getDB();
  const tableNames = await database.tableNames();
  if (tableNames.includes(TABLE_NAME)) {
    await database.dropTable(TABLE_NAME);
    table = null;
    console.log('⚠️ LanceDB 表已重建');
  }
}
