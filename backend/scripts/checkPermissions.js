import mongoose from 'mongoose';
import User from '../src/models/UserSchema.js';
import Role from '../src/models/RoleSchema.js';
import Permission from '../src/models/PermissionSchema.js';
import 'dotenv/config';

async function connectDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aichat';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

async function checkAdminUser() {
  console.log('\n🔍 检查 Admin 用户...\n');
  
  try {
    const adminUsers = await User.find({ role: 'admin' });
    
    if (adminUsers.length === 0) {
      console.log('❌ 没有找到 admin 用户');
      return;
    }
    
    for (const user of adminUsers) {
      console.log(`\n用户: ${user.username}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Role: ${user.role}`);
      console.log(`  - Roles: ${JSON.stringify(user.roles || [])}`);
      console.log(`  - Permissions: ${JSON.stringify(user.permissions || [])}`);
      console.log(`  - isActive: ${user.isActive}`);
    }
  } catch (error) {
    console.error('❌ 检查用户失败:', error.message);
  }
}

async function checkRoles() {
  console.log('\n👥 检查角色配置...\n');
  
  try {
    const roles = await Role.find({});
    
    if (roles.length === 0) {
      console.log('❌ 没有找到任何角色');
      console.log('💡 提示: 运行 node scripts/initPermissions.js 初始化角色');
      return;
    }
    
    for (const role of roles) {
      console.log(`\n角色: ${role.name} (${role.code})`);
      console.log(`  - 描述: ${role.description}`);
      console.log(`  - 权限数量: ${role.permissions?.length || 0}`);
      console.log(`  - 权限列表: ${JSON.stringify(role.permissions || [], null, 2)}`);
      console.log(`  - 是否系统角色: ${role.isSystem}`);
    }
  } catch (error) {
    console.error('❌ 检查角色失败:', error.message);
  }
}

async function checkPermissions() {
  console.log('\n🔐 检查权限配置...\n');
  
  try {
    const permissions = await Permission.find({});
    
    if (permissions.length === 0) {
      console.log('❌ 没有找到任何权限');
      console.log('💡 提示: 运行 node scripts/initPermissions.js 初始化权限');
      return;
    }
    
    console.log(`✅ 找到 ${permissions.length} 个权限`);
    
    const groupedPermissions = {};
    permissions.forEach(p => {
      if (!groupedPermissions[p.category]) {
        groupedPermissions[p.category] = [];
      }
      groupedPermissions[p.category].push(p.code);
    });
    
    Object.entries(groupedPermissions).forEach(([category, perms]) => {
      console.log(`\n${category}:`);
      perms.forEach(p => console.log(`  - ${p}`));
    });
  } catch (error) {
    console.error('❌ 检查权限失败:', error.message);
  }
}

async function fixAdminUser() {
  console.log('\n🔧 修复 Admin 用户...\n');
  
  try {
    const adminUsers = await User.find({ role: 'admin' });
    
    if (adminUsers.length === 0) {
      console.log('❌ 没有找到 admin 用户');
      return;
    }
    
    // 检查是否有 admin 角色
    let adminRole = await Role.findOne({ code: 'admin' });
    
    if (!adminRole) {
      console.log('⚠️  admin 角色不存在，需要先初始化角色');
      console.log('💡 运行: node scripts/initPermissions.js');
      return;
    }
    
    for (const user of adminUsers) {
      if (!user.roles || !user.roles.includes('admin')) {
        user.roles = ['admin'];
        await user.save();
        console.log(`✅ 已为用户 ${user.username} 添加 admin 角色`);
      } else {
        console.log(`✓ 用户 ${user.username} 已有 admin 角色`);
      }
    }
  } catch (error) {
    console.error('❌ 修复用户失败:', error.message);
  }
}

async function main() {
  console.log('🚀 开始检查权限系统...\n');
  
  await connectDB();
  await checkPermissions();
  await checkRoles();
  await checkAdminUser();
  
  console.log('\n' + '='.repeat(50));
  console.log('是否要修复 admin 用户? (y/n)');
  console.log('='.repeat(50));
  
  // 自动修复
  await fixAdminUser();
  
  console.log('\n✨ 检查完成！');
  
  await mongoose.disconnect();
  console.log('👋 数据库连接已关闭');
}

main().catch(error => {
  console.error('❌ 检查失败:', error);
  process.exit(1);
});
