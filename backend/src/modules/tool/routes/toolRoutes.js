import express from 'express';
import toolController from '../controllers/toolController.js';
import { authenticateToken as authMiddleware } from '../../../middleware/auth.middleware.js';

const router = express.Router();

// 公开路由（无需认证）
router.get('/public', toolController.getPublicTools.bind(toolController));
router.get('/builtin', toolController.getBuiltinTools.bind(toolController));
router.get('/search', toolController.searchTools.bind(toolController));

// 需要认证的路由
router.use(authMiddleware);

router.post('/', toolController.createTool.bind(toolController));
router.get('/', toolController.getTools.bind(toolController));
router.get('/:toolId', toolController.getTool.bind(toolController));
router.put('/:toolId', toolController.updateTool.bind(toolController));
router.delete('/:toolId', toolController.deleteTool.bind(toolController));
router.post('/:toolId/publish', toolController.publishTool.bind(toolController));
router.post('/:toolId/execute', toolController.executeTool.bind(toolController));
router.get('/:toolId/stats', toolController.getToolStats.bind(toolController));

export default router;
