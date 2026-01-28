
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import KnowledgeChunk from '../src/modules/knowledge/models/KnowledgeChunkSchema.js';
import { upsertChunks } from '../src/modules/knowledge/services/vectorStoreService.js';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chart-ai';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  }
}

async function migrate() {
  await connectDB();

  console.log('🚀 Starting migration to LanceDB...');

  try {
    const total = await KnowledgeChunk.countDocuments();
    console.log(`📊 Found ${total} chunks in MongoDB.`);

    const batchSize = 100;
    let processed = 0;

    for (let i = 0; i < total; i += batchSize) {
      const chunks = await KnowledgeChunk.find()
        .skip(i)
        .limit(batchSize)
        .lean();

      if (chunks.length > 0) {
        await upsertChunks(chunks);
        processed += chunks.length;
        console.log(`✅ Migrated ${processed}/${total} chunks`);
      }
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
