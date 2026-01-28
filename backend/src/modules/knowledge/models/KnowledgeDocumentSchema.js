import mongoose from 'mongoose';

const knowledgeDocumentSchema = new mongoose.Schema(
  {
    kbId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeBase',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    error: String,
    charCount: {
      type: Number,
      default: 0
    },
    chunkCount: {
      type: Number,
      default: 0
    },
    originalPath: String,
    fileSize: Number
  },
  {
    timestamps: true,
    collection: 'knowledge_documents'
  }
);

knowledgeDocumentSchema.virtual('id').get(function () {
  return this._id.toString();
});

knowledgeDocumentSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    ret.id = doc._id.toString();
    return ret;
  }
});

const KnowledgeDocument = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);

export default KnowledgeDocument;
