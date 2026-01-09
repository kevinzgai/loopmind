import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, '..', '..', '.env') });

/**
 * MongoDB 数据库连接
 */

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'aichat';

/**
 * 连接到 MongoDB
 */
export async function connectDatabase() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI 环境变量未设置');
    }

    console.log('🔗 正在连接 MongoDB...');
    console.log(`   数据库: ${MONGODB_DB_NAME}`);

    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
      retryWrites: true,
      w: 'majority'
    });

    console.log('✅ MongoDB 连接成功');

    // 监听连接事件
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB 连接已断开');
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB 连接错误:', error);
    });

    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB 连接失败:', error.message);
    throw error;
  }
}

/**
 * 断开 MongoDB 连接
 */
export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB 连接已断开');
  } catch (error) {
    console.error('❌ 断开连接失败:', error.message);
    throw error;
  }
}

/**
 * 获取数据库连接状态
 */
export function getDatabaseStatus() {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port
  };
}

export default {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus
};
