import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://localhost:27017/aichat';

async function checkDatabase() {
  try {
    console.log('🔗 正在连接 MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      dbName: 'aichat',
      retryWrites: true,
      w: 'majority'
    });
    console.log('✅ MongoDB 连接成功');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 数据库中的集合:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    if (collections.length === 0) {
      console.log('⚠️  数据库中没有集合');
    }

    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`  ${col.name}: ${count} 条记录`);
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ 数据库连接已关闭');
  }
}

checkDatabase();
