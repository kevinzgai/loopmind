import User from '../../models/UserSchema.js';
import Role from '../../models/RoleSchema.js';
import Permission from '../../models/PermissionSchema.js';

export async function userHasPermission(userId, permissionCode) {
  try {
    console.log('🔍 Checking permission for user:', userId, 'permission:', permissionCode);
    
    const user = await User.findById(userId);
    
    console.log('👤 User found:', {
      id: user._id,
      role: user.role,
      roles: user.roles,
      hasAdminRole: user.role === 'admin' || user.role === 'super_admin',
      hasAdminInRoles: user.roles && user.roles.some(r => r === 'admin' || r.code === 'admin' || r === 'super_admin' || r.code === 'super_admin')
    });
    
    if (!user) {
      console.log('❌ User not found');
      return false;
    }

    // 管理员（admin 或 super_admin）拥有所有权限，不需要细致检查
    // 检查 user.role 字段
    if (user.role === 'admin' || user.role === 'super_admin') {
      console.log('✅ User is admin (by role field), granting all permissions');
      return true;
    }

    // 检查 user.roles 数组
    if (user.roles && user.roles.length > 0) {
      const hasAdminRole = user.roles.some(r => {
        // roles 可能是字符串数组，也可能是对象数组
        if (typeof r === 'string') {
          return r === 'admin' || r === 'super_admin';
        } else if (typeof r === 'object' && r !== null) {
          return r.code === 'admin' || r.code === 'super_admin';
        }
        return false;
      });
      
      if (hasAdminRole) {
        console.log('✅ User is admin (by roles array), granting all permissions');
        return true;
      }
    }

    console.log('❌ User is not admin, checking specific permissions');

    // 其他用户需要细致的权限检查
    const allPermissions = new Set();

    // 从角色获取权限
    if (user.roles && user.roles.length > 0) {
      for (const roleItem of user.roles) {
        // roles 可能是字符串，也可能是对象
        const roleCode = typeof roleItem === 'string' ? roleItem : roleItem.code;
        const role = await Role.findOne({ code: roleCode });
        if (role && role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(p => allPermissions.add(p));
        }
      }
    }

    // 从用户额外权限获取
    if (user.permissions && Array.isArray(user.permissions)) {
      user.permissions.forEach(p => allPermissions.add(p));
    }

    const hasPermission = allPermissions.has(permissionCode);
    console.log('🔍 Permission check result:', {
      hasPermission,
      allPermissions: Array.from(allPermissions)
    });
    
    return hasPermission;
  } catch (error) {
    console.error('❌ 检查用户权限失败:', error);
    return false;
  }
}

export async function getUserPermissions(userId) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return [];
    }

    // 管理员（admin 或 super_admin）拥有所有权限
    if (user.role === 'admin' || user.role === 'super_admin' || 
        (user.roles && (user.roles.includes('admin') || user.roles.includes('super_admin')))) {
      const allPermissions = await Permission.find({});
      return allPermissions.map(p => p.code);
    }

    // 其他用户需要细致的权限检查
    const allPermissions = new Set();

    // 从角色获取权限
    if (user.roles && user.roles.length > 0) {
      for (const roleCode of user.roles) {
        const role = await Role.findOne({ code: roleCode });
        if (role && role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(p => allPermissions.add(p));
        }
      }
    }

    // 从用户额外权限获取
    if (user.permissions && Array.isArray(user.permissions)) {
      user.permissions.forEach(p => allPermissions.add(p));
    }

    return Array.from(allPermissions);
  } catch (error) {
    console.error('获取用户权限失败:', error);
    return [];
  }
}

export async function assignRoleToUser(userId, roleCode) {
  try {
    const role = await Role.findOne({ code: roleCode });
    if (!role) {
      throw new Error('角色不存在');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (!user.roles.includes(roleCode)) {
      user.roles.push(roleCode);
      await user.save();
    }

    return user;
  } catch (error) {
    console.error('分配角色失败:', error);
    throw error;
  }
}

export async function revokeRoleFromUser(userId, roleCode) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    user.roles = user.roles.filter(r => r !== roleCode);
    await user.save();

    return user;
  } catch (error) {
    console.error('撤销角色失败:', error);
    throw error;
  }
}

export async function addPermissionToUser(userId, permissionCode) {
  try {
    const permission = await Permission.findOne({ code: permissionCode });
    if (!permission) {
      throw new Error('权限不存在');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (!user.permissions.includes(permissionCode)) {
      user.permissions.push(permissionCode);
      await user.save();
    }

    return user;
  } catch (error) {
    console.error('添加权限失败:', error);
    throw error;
  }
}

export async function removePermissionFromUser(userId, permissionCode) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    user.permissions = user.permissions.filter(p => p !== permissionCode);
    await user.save();

    return user;
  } catch (error) {
    console.error('移除权限失败:', error);
    throw error;
  }
}

export async function createRole(roleData) {
  try {
    const { code, name, description, permissions, isSystem } = roleData;

    const existingRole = await Role.findOne({ code });
    if (existingRole) {
      throw new Error('角色代码已存在');
    }

    const role = new Role({
      code,
      name,
      description,
      permissions: permissions || [],
      isSystem: isSystem || false
    });

    await role.save();
    return role;
  } catch (error) {
    console.error('创建角色失败:', error);
    throw error;
  }
}

export async function updateRole(roleCode, updateData) {
  try {
    const role = await Role.findOne({ code: roleCode });
    if (!role) {
      throw new Error('角色不存在');
    }

    if (role.isSystem) {
      throw new Error('系统角色不能修改');
    }

    const { name, description, permissions } = updateData;

    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    if (permissions) role.permissions = permissions;

    await role.save();
    return role;
  } catch (error) {
    console.error('更新角色失败:', error);
    throw error;
  }
}

export async function deleteRole(roleCode) {
  try {
    const role = await Role.findOne({ code: roleCode });
    if (!role) {
      throw new Error('角色不存在');
    }

    if (role.isSystem) {
      throw new Error('系统角色不能删除');
    }

    await Role.deleteOne({ code: roleCode });

    await User.updateMany(
      { roles: roleCode },
      { $pull: { roles: roleCode } }
    );

    return { message: '角色删除成功' };
  } catch (error) {
    console.error('删除角色失败:', error);
    throw error;
  }
}

export async function getAllRoles() {
  try {
    const roles = await Role.find({}).sort({ createdAt: -1 });
    return roles;
  } catch (error) {
    console.error('获取角色列表失败:', error);
    throw error;
  }
}

export async function getRoleByCode(roleCode) {
  try {
    const role = await Role.findOne({ code: roleCode });
    if (!role) {
      throw new Error('角色不存在');
    }
    return role;
  } catch (error) {
    console.error('获取角色失败:', error);
    throw error;
  }
}

export async function createPermission(permissionData) {
  try {
    const { code, name, category, description, resource, action, isSystem } = permissionData;

    const existingPermission = await Permission.findOne({ code });
    if (existingPermission) {
      throw new Error('权限代码已存在');
    }

    const permission = new Permission({
      code,
      name,
      category,
      description,
      resource,
      action,
      isSystem: isSystem || false
    });

    await permission.save();
    return permission;
  } catch (error) {
    console.error('创建权限失败:', error);
    throw error;
  }
}

export async function getAllPermissions() {
  try {
    const permissions = await Permission.find({}).sort({ category: 1, createdAt: 1 });
    return permissions;
  } catch (error) {
    console.error('获取权限列表失败:', error);
    throw error;
  }
}

export async function getPermissionsByCategory(category) {
  try {
    const permissions = await Permission.find({ category }).sort({ createdAt: 1 });
    return permissions;
  } catch (error) {
    console.error('获取分类权限失败:', error);
    throw error;
  }
}

export async function getUsersByRole(roleCode) {
  try {
    const users = await User.find({ roles: roleCode }).select('-passwordHash');
    return users;
  } catch (error) {
    console.error('获取角色用户失败:', error);
    throw error;
  }
}

export default {
  userHasPermission,
  getUserPermissions,
  assignRoleToUser,
  revokeRoleFromUser,
  addPermissionToUser,
  removePermissionFromUser,
  createRole,
  updateRole,
  deleteRole,
  getAllRoles,
  getRoleByCode,
  createPermission,
  getAllPermissions,
  getPermissionsByCategory,
  getUsersByRole
};
