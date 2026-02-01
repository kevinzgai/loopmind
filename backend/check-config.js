import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/aichat';

const configSchema = new mongoose.Schema({}, { strict: false });

const Config = mongoose.model('Config', configSchema);

async function checkConfig() {
  try {
    console.log('🔗 正在连接 MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: 'aichat',
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ MongoDB 连接成功');

    const config = await Config.findOne();
    if (!config) {
      console.error('❌ 未找到任何配置');
      process.exit(1);
    }

    console.log('📊 数据库中的配置:');
    console.log(JSON.stringify(config, null, 2));

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ 数据库连接已关闭');
  }
}

checkConfig();
