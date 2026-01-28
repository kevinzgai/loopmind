import mongoose from 'mongoose';

const knowledgeBaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '知识库名称不能为空'],
      trim: true,
      maxlength: [50, '知识库名称最多 50 个字符']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, '知识库描述最多 500 个字符']
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    documentCount: {
      type: Number,
      default: 0
    },
    chunkCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'knowledge_bases'
  }
);

knowledgeBaseSchema.virtual('id').get(function () {
  return this._id.toString();
});

knowledgeBaseSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    ret.id = doc._id.toString();
    return ret;
  }
});

const KnowledgeBase = mongoose.model('KnowledgeBase', knowledgeBaseSchema);

export default KnowledgeBase;
