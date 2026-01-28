import mongoose from 'mongoose';

const knowledgeChunkSchema = new mongoose.Schema(
  {
    kbId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeBase',
      required: true,
      index: true
    },
    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeDocument',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true
    },
    embedding: {
      type: [Number],
      required: true
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true,
    collection: 'knowledge_chunks'
  }
);

knowledgeChunkSchema.virtual('id').get(function () {
  return this._id.toString();
});

knowledgeChunkSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    ret.id = doc._id.toString();
    return ret;
  }
});

// 注意：如果使用 MongoDB Atlas 向量搜索，需要在 Atlas UI 中手动创建 Search Index。
// 如果是本地测试或普通搜索，可以使用传统索引。

const KnowledgeChunk = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);

export default KnowledgeChunk;
