import mongoose from 'mongoose';
import Permission from '../src/models/PermissionSchema.js';
import Role from '../src/models/RoleSchema.js';
import User from '../src/models/UserSchema.js';
import 'dotenv/config';

const SYSTEM_PERMISSIONS = [
  {
    code: 'system:config:view',
    name: '查看系统配置',
    category: 'system',
    description: '查看系统配置信息',
    resource: 'system_config',
    action: 'view',
    isSystem: true
  },
  {
    code: 'system:config:edit',
    name: '编辑系统配置',
    category: 'system',
    description: '编辑系统配置信息',
    resource: 'system_config',
    action: 'edit',
    isSystem: true
  },
  {
    code: 'system:config:ai',
    name: 'AI模型配置',
    category: 'system',
    description: '配置AI模型相关参数',
    resource: 'ai_config',
    action: 'manage',
    isSystem: true
  },
  {
    code: 'system:config:embedding',
    name: 'Embedding配置',
    category: 'system',
    description: '配置Embedding模型相关参数',
    resource: 'embedding_config',
    action: 'manage',
    isSystem: true
  },
  {
    code: 'system:config:speech',
    name: '语音服务配置',
    category: 'system',
    description: '配置语音服务相关参数',
    resource: 'speech_config',
    action: 'manage',
    isSystem: true
  },
  {
    code: 'system:user:view',
    name: '查看用户列表',
    category: 'user',
    description: '查看用户列表和详情',
    resource: 'user',
    action: 'view',
    isSystem: true
  },
  {
    code: 'system:user:create',
    name: '创建用户',
    category: 'user',
    description: '创建新用户',
    resource: 'user',
    action: 'create',
    isSystem: true
  },
  {
    code: 'system:user:edit',
    name: '编辑用户',
    category: 'user',
    description: '编辑用户信息',
    resource: 'user',
    action: 'edit',
    isSystem: true
  },
  {
    code: 'system:user:delete',
    name: '删除用户',
    category: 'user',
    description: '删除用户',
    resource: 'user',
    action: 'delete',
    isSystem: true
  },
  {
    code: 'system:user:reset-password',
    name: '重置用户密码',
    category: 'user',
    description: '重置用户密码',
    resource: 'user',
    action: 'execute',
    isSystem: true
  },
  {
    code: 'system:logs:view',
    name: '查看系统日志',
    category: 'system',
    description: '查看系统日志',
    resource: 'system_logs',
    action: 'view',
    isSystem: true
  },
  {
    code: 'agent:manage',
    name: '管理智能体',
    category: 'agent',
    description: '创建、编辑、删除智能体',
    resource: 'agent',
    action: 'manage',
    isSystem: true
  },
  {
    code: 'knowledge:manage',
    name: '管理知识库',
    category: 'knowledge',
    description: '创建、编辑、删除知识库',
    resource: 'knowledge',
    action: 'manage',
    isSystem: true
  }
];

const SYSTEM_ROLES = [
  {
    code: 'super_admin',
    name: '超级管理员',
    description: '拥有所有权限，不可修改',
    permissions: [],
    isSystem: true
  },
  {
    code: 'admin',
    name: '系统管理员',
    description: '管理系统配置和用户',
    permissions: [
      'system:config:view',
      'system:config:edit',
      'system:config:ai',
      'system:config:embedding',
      'system:config:speech',
      'system:user:view',
      'system:user:create',
      'system:user:edit',
      'system:user:delete',
      'system:user:reset-password',
      'system:logs:view'
    ],
    isSystem: true
  },
  {
    code: 'operator',
    name: '运营人员',
    description: '管理智能体和知识库',
    permissions: [
      'agent:manage',
      'knowledge:manage',
      'system:logs:view'
    ],
    isSystem: true
  },
  {
    code: 'user',
    name: '普通用户',
    description: '基础用户权限',
    permissions: [
      'agent:manage',
      'knowledge:manage'
    ],
    isSystem: true
  }
];

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

async function initPermissions() {
  console.log('\n📋 开始初始化权限...');
  
  for (const permissionData of SYSTEM_PERMISSIONS) {
    try {
      const existing = await Permission.findOne({ code: permissionData.code });
      
      if (existing) {
        console.log(`  ✓ 权限已存在: ${permissionData.code}`);
      } else {
        await Permission.create(permissionData);
        console.log(`  ✅ 创建权限: ${permissionData.code}`);
      }
    } catch (error) {
      console.error(`  ❌ 创建权限失败 ${permissionData.code}:`, error.message);
    }
  }
  
  console.log('✅ 权限初始化完成');
}

async function initRoles() {
  console.log('\n👥 开始初始化角色...');
  
  for (const roleData of SYSTEM_ROLES) {
    try {
      const existing = await Role.findOne({ code: roleData.code });
      
      if (existing) {
        if (roleData.code === 'super_admin') {
          const allPermissions = await Permission.find({});
          existing.permissions = allPermissions.map(p => p.code);
          await existing.save();
          console.log(`  ✓ 更新超级管理员权限: ${roleData.code}`);
        } else {
          console.log(`  ✓ 角色已存在: ${roleData.code}`);
        }
      } else {
        if (roleData.code === 'super_admin') {
          const allPermissions = await Permission.find({});
          roleData.permissions = allPermissions.map(p => p.code);
        }
        
        await Role.create(roleData);
        console.log(`  ✅ 创建角色: ${roleData.code}`);
      }
    } catch (error) {
      console.error(`  ❌ 创建角色失败 ${roleData.code}:`, error.message);
    }
  }
  
  console.log('✅ 角色初始化完成');
}

async function migrateUsers() {
  console.log('\n🔄 开始迁移用户数据...');
  
  try {
    const users = await User.find({});
    let updatedCount = 0;
    
    for (const user of users) {
      if (!user.roles || user.roles.length === 0) {
        if (user.role === 'admin') {
          user.roles = ['admin'];
        } else {
          user.roles = ['user'];
        }
        await user.save();
        updatedCount++;
        console.log(`  ✓ 更新用户角色: ${user.username} -> ${user.roles.join(', ')}`);
      }
    }
    
    console.log(`✅ 用户数据迁移完成，共更新 ${updatedCount} 个用户`);
  } catch (error) {
    console.error('❌ 用户数据迁移失败:', error.message);
  }
}

async function main() {
  console.log('🚀 开始初始化权限系统...\n');
  
  await connectDB();
  await initPermissions();
  await initRoles();
  await migrateUsers();
  
  console.log('\n✨ 权限系统初始化完成！');
  
  await mongoose.disconnect();
  console.log('👋 数据库连接已关闭');
}

main().catch(error => {
  console.error('❌ 初始化失败:', error);
  process.exit(1);
});
