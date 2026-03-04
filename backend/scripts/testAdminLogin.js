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

async function testAdminLogin() {
  console.log('\n🧪 测试 Admin 用户登录流程...\n');
  
  try {
    // 1. 查找 admin 用户
    const adminUser = await User.findOne({ username: 'admin' });
    
    if (!adminUser) {
      console.log('❌ Admin 用户不存在');
      return;
    }
    
    console.log('✅ 找到 Admin 用户:');
    console.log(`  - Username: ${adminUser.username}`);
    console.log(`  - Email: ${adminUser.email}`);
    console.log(`  - Role: ${adminUser.role}`);
    console.log(`  - Roles: ${JSON.stringify(adminUser.roles)}`);
    console.log(`  - Permissions: ${JSON.stringify(adminUser.permissions)}`);
    console.log(`  - isActive: ${adminUser.isActive}`);
    
    // 2. 获取 admin 角色
    const adminRole = await Role.findOne({ code: 'admin' });
    
    if (!adminRole) {
      console.log('❌ Admin 角色不存在');
      return;
    }
    
    console.log('\n✅ Admin 角色信息:');
    console.log(`  - Name: ${adminRole.name}`);
    console.log(`  - Code: ${adminRole.code}`);
    console.log(`  - Permissions: ${adminRole.permissions.length} 个`);
    
    // 3. 获取所有权限
    const allPermissions = await Permission.find({});
    console.log(`\n✅ 系统共有 ${allPermissions.length} 个权限`);
    
    // 4. 模拟权限检查
    console.log('\n🔍 模拟权限检查:');
    
    const testPermissions = [
      'system:config:view',
      'system:config:edit',
      'system:user:view',
      'system:logs:view'
    ];
    
    // 收集用户所有权限
    const userPermissions = new Set();
    
    // 从角色获取权限
    if (adminUser.roles && adminUser.roles.length > 0) {
      for (const roleCode of adminUser.roles) {
        const roleData = await Role.findOne({ code: roleCode });
        if (roleData && roleData.permissions) {
          roleData.permissions.forEach(p => userPermissions.add(p));
        }
      }
    }
    
    // 从用户额外权限获取
    if (adminUser.permissions && Array.isArray(adminUser.permissions)) {
      adminUser.permissions.forEach(p => userPermissions.add(p));
    }
    
    console.log(`\n用户拥有的权限 (${userPermissions.size} 个):`);
    Array.from(userPermissions).forEach(p => console.log(`  - ${p}`));
    
    // 测试权限检查
    console.log('\n权限检查结果:');
    testPermissions.forEach(permission => {
      const hasPermission = userPermissions.has(permission);
      console.log(`  ${hasPermission ? '✅' : '❌'} ${permission}: ${hasPermission ? '有权限' : '无权限'}`);
    });
    
    // 5. 检查前端需要的条件
    console.log('\n🎯 前端显示系统配置的条件:');
    const isAdmin = adminUser.role === 'admin' || adminUser.role === 'super_admin';
    const hasRoles = adminUser.roles && adminUser.roles.length > 0;
    const hasAdminRole = adminUser.roles && adminUser.roles.includes('admin');
    
    console.log(`  - 用户 role 字段: ${adminUser.role}`);
    console.log(`  - 是否为 admin 或 super_admin: ${isAdmin}`);
    console.log(`  - 用户 roles 数组: ${hasRoles ? JSON.stringify(adminUser.roles) : '空'}`);
    console.log(`  - 是否包含 admin 角色: ${hasAdminRole}`);
    console.log(`  - 权限数量: ${userPermissions.size}`);
    
    if (isAdmin && hasAdminRole && userPermissions.size > 0) {
      console.log('\n✅ Admin 用户配置正确，应该能够看到系统配置！');
    } else {
      console.log('\n❌ Admin 用户配置有问题，请检查：');
      if (!isAdmin) console.log('  - role 字段不是 admin 或 super_admin');
      if (!hasAdminRole) console.log('  - roles 数组中没有 admin 角色');
      if (userPermissions.size === 0) console.log('  - 没有任何权限');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

async function main() {
  await connectDB();
  await testAdminLogin();
  await mongoose.disconnect();
  console.log('\n👋 数据库连接已关闭');
}

main().catch(error => {
  console.error('❌ 执行失败:', error);
  process.exit(1);
});
