import express from 'express';
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleGetCurrentUser,
  handleChangePassword
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * 认证路由
 */

// 公开路由（不需要认证）

/**
 * POST /api/auth/register
 * 用户注册
 */
router.post('/register', handleRegister);

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', handleLogin);

/**
 * POST /api/auth/refresh
 * 刷新 Token（需要有效的 Token）
 */
router.post('/refresh', authenticateToken, handleRefreshToken);

// 受保护路由（需要认证）

/**
 * GET /api/auth/me
 * 获取当前用户信息
 */
router.get('/me', authenticateToken, handleGetCurrentUser);

/**
 * POST /api/auth/logout
 * 用户登出
 */
router.post('/logout', authenticateToken, handleLogout);

/**
 * POST /api/auth/change-password
 * 修改密码
 */
router.post('/change-password', authenticateToken, handleChangePassword);

export default router;
