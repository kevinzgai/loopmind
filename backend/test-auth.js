/**
 * 认证功能测试脚本
 * 演示用户注册、登录、Token 验证等功能
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/auth';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = {
    success: `${colors.green}✅${colors.reset}`,
    error: `${colors.red}❌${colors.reset}`,
    info: `${colors.blue}ℹ️${colors.reset}`,
    warn: `${colors.yellow}⚠️${colors.reset}`
  }[type] || '';

  console.log(`${prefix} [${timestamp}] ${message}`);
}

async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  return {
    status: response.status,
    data
  };
}

async function requestWithToken(method, endpoint, token, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  return {
    status: response.status,
    data
  };
}

async function runTests() {
  console.log('\n' + colors.blue + '='.repeat(50) + colors.reset);
  console.log(colors.blue + '  认证功能测试' + colors.reset);
  console.log(colors.blue + '='.repeat(50) + colors.reset + '\n');

  let token = null;
  let userId = null;

  try {
    // 测试 1: 用户注册
    console.log(colors.yellow + '📝 测试 1: 用户注册' + colors.reset);
    const registerRes = await request('POST', '/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    if (registerRes.status === 201) {
      log('success', '用户注册成功');
      console.log('  用户信息:', JSON.stringify(registerRes.data.user, null, 2));
      userId = registerRes.data.user.id;
    } else {
      log('error', `注册失败: ${registerRes.data.error.message}`);
    }

    // 测试 2: 重复注册（应该失败）
    console.log('\n' + colors.yellow + '📝 测试 2: 重复注册（应该失败）' + colors.reset);
    const duplicateRes = await request('POST', '/register', {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    if (duplicateRes.status !== 201) {
      log('success', `正确拒绝: ${duplicateRes.data.error.message}`);
    } else {
      log('error', '应该拒绝重复注册');
    }

    // 测试 3: 用户登录
    console.log('\n' + colors.yellow + '📝 测试 3: 用户登录' + colors.reset);
    const loginRes = await request('POST', '/login', {
      username: 'testuser',
      password: 'password123'
    });

    if (loginRes.status === 200) {
      log('success', '用户登录成功');
      token = loginRes.data.token;
      console.log('  Token:', token.substring(0, 20) + '...');
      console.log('  过期时间:', new Date(loginRes.data.expiryTime).toLocaleString());
    } else {
      log('error', `登录失败: ${loginRes.data.error.message}`);
    }

    // 测试 4: 错误的密码登录（应该失败）
    console.log('\n' + colors.yellow + '📝 测试 4: 错误的密码登录（应该失败）' + colors.reset);
    const wrongPasswordRes = await request('POST', '/login', {
      username: 'testuser',
      password: 'wrongpassword'
    });

    if (wrongPasswordRes.status !== 200) {
      log('success', `正确拒绝: ${wrongPasswordRes.data.error.message}`);
    } else {
      log('error', '应该拒绝错误的密码');
    }

    // 测试 5: 获取当前用户信息
    console.log('\n' + colors.yellow + '📝 测试 5: 获取当前用户信息' + colors.reset);
    if (token) {
      const meRes = await requestWithToken('GET', '/me', token);

      if (meRes.status === 200) {
        log('success', '获取用户信息成功');
        console.log('  用户信息:', JSON.stringify(meRes.data.user, null, 2));
      } else {
        log('error', `获取失败: ${meRes.data.error.message}`);
      }
    }

    // 测试 6: 无效的 Token（应该失败）
    console.log('\n' + colors.yellow + '📝 测试 6: 无效的 Token（应该失败）' + colors.reset);
    const invalidTokenRes = await requestWithToken('GET', '/me', 'invalid_token_123');

    if (invalidTokenRes.status !== 200) {
      log('success', `正确拒绝: ${invalidTokenRes.data.error.message}`);
    } else {
      log('error', '应该拒绝无效的 Token');
    }

    // 测试 7: 修改密码
    console.log('\n' + colors.yellow + '📝 测试 7: 修改密码' + colors.reset);
    if (token) {
      const changePasswordRes = await requestWithToken('POST', '/change-password', token, {
        oldPassword: 'password123',
        newPassword: 'newpassword456',
        confirmPassword: 'newpassword456'
      });

      if (changePasswordRes.status === 200) {
        log('success', '密码修改成功');
      } else {
        log('error', `修改失败: ${changePasswordRes.data.error.message}`);
      }
    }

    // 测试 8: 使用新密码登录
    console.log('\n' + colors.yellow + '📝 测试 8: 使用新密码登录' + colors.reset);
    const newPasswordLoginRes = await request('POST', '/login', {
      username: 'testuser',
      password: 'newpassword456'
    });

    if (newPasswordLoginRes.status === 200) {
      log('success', '使用新密码登录成功');
      token = newPasswordLoginRes.data.token;
    } else {
      log('error', `登录失败: ${newPasswordLoginRes.data.error.message}`);
    }

    // 测试 9: 刷新 Token
    console.log('\n' + colors.yellow + '📝 测试 9: 刷新 Token' + colors.reset);
    if (token) {
      const refreshRes = await requestWithToken('POST', '/refresh', token);

      if (refreshRes.status === 200) {
        log('success', 'Token 刷新成功');
        const newToken = refreshRes.data.token;
        console.log('  新 Token:', newToken.substring(0, 20) + '...');
        token = newToken;
      } else {
        log('error', `刷新失败: ${refreshRes.data.error.message}`);
      }
    }

    // 测试 10: 用户登出
    console.log('\n' + colors.yellow + '📝 测试 10: 用户登出' + colors.reset);
    if (token) {
      const logoutRes = await requestWithToken('POST', '/logout', token);

      if (logoutRes.status === 200) {
        log('success', '用户登出成功');
      } else {
        log('error', `登出失败: ${logoutRes.data.error.message}`);
      }
    }

    // 测试 11: 使用已登出的 Token（应该失败）
    console.log('\n' + colors.yellow + '📝 测试 11: 使用已登出的 Token（应该失败）' + colors.reset);
    if (token) {
      const afterLogoutRes = await requestWithToken('GET', '/me', token);

      if (afterLogoutRes.status !== 200) {
        log('success', `正确拒绝: ${afterLogoutRes.data.error.message}`);
      } else {
        log('error', '应该拒绝已登出的 Token');
      }
    }

    console.log('\n' + colors.green + '✅ 所有测试完成！' + colors.reset + '\n');
  } catch (error) {
    log('error', `测试出错: ${error.message}`);
    console.error(error);
  }
}

// 运行测试
runTests();
