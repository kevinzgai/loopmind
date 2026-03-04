import express from 'express';
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleGetCurrentUser,
  handleChangePassword,
  handleUpdateProfile
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/security.middleware.js';

const router = express.Router();

/**
 * @api {post} /auth/register 用户注册
 * @apiName Register
 * @apiGroup Auth
 * @apiDescription 注册新用户
 *
 * @apiBody {String} username 用户名
 * @apiBody {String} password 密码
 * @apiBody {String} email 邮箱
 *
 * @apiSuccess {String} message 注册成功消息
 * @apiSuccess {Object} user 用户信息
 */
router.post('/register', authLimiter, handleRegister);

/**
 * @api {post} /auth/login 用户登录
 * @apiName Login
 * @apiGroup Auth
 * @apiDescription 用户登录获取 Token
 *
 * @apiBody {String} username 用户名
 * @apiBody {String} password 密码
 *
 * @apiSuccess {String} token 访问 Token
 * @apiSuccess {Object} user 用户信息
 */
router.post('/login', authLimiter, handleLogin);

/**
 * @api {post} /auth/refresh 刷新 Token
 * @apiName RefreshToken
 * @apiGroup Auth
 * @apiDescription 刷新访问 Token
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {String} token 新的访问 Token
 */
router.post('/refresh', authenticateToken, handleRefreshToken);

// 受保护路由（需要认证）

/**
 * @api {get} /auth/me 获取当前用户信息
 * @apiName GetCurrentUser
 * @apiGroup Auth
 * @apiDescription 获取当前登录用户的详细信息
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {Object} user 用户信息
 */
router.get('/me', authenticateToken, handleGetCurrentUser);

/**
 * @api {post} /auth/logout 用户登出
 * @apiName Logout
 * @apiGroup Auth
 * @apiDescription 用户登出，失效 Token
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiSuccess {String} message 登出成功消息
 */
router.post('/logout', authenticateToken, handleLogout);

/**
 * @api {post} /auth/change-password 修改密码
 * @apiName ChangePassword
 * @apiGroup Auth
 * @apiDescription 修改当前用户的登录密码
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiBody {String} oldPassword 旧密码
 * @apiBody {String} newPassword 新密码
 *
 * @apiSuccess {String} message 成功消息
 */
router.post('/change-password', authenticateToken, handleChangePassword);

/**
 * @api {put} /auth/profile 更新个人资料
 * @apiName UpdateProfile
 * @apiGroup Auth
 * @apiDescription 更新当前用户的个人资料
 * @apiHeader {String} Authorization Bearer Token
 *
 * @apiBody {String} [nickname] 昵称
 * @apiBody {String} [avatar] 头像链接
 * @apiBody {String} [email] 邮箱
 *
 * @apiSuccess {String} message 成功消息
 * @apiSuccess {Object} user 更新后的用户信息
 */
router.put('/profile', authenticateToken, handleUpdateProfile);

export default router;
