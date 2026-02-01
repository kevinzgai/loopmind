import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/aichat';

async function checkSystemConfig() {
  try {
    console.log('🔗 正在连接 MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: 'aichat',
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ MongoDB 连接成功');

    const systemConfig = await mongoose.connection.db.collection('system_config').findOne();
    if (!systemConfig) {
      console.error('❌ 未找到 system_config');
      process.exit(1);
    }

    console.log('📊 system_config 数据:');
    console.log(JSON.stringify(systemConfig, null, 2));

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ 数据库连接已关闭');
  }
}

checkSystemConfig();
