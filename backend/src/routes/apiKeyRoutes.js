import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getMyApiKeys,
  createApiKey,
  deleteApiKey,
  toggleApiKeyStatus,
  getApiKeyStats,
  getAllApiKeysStats,
  getMyApiKey,
  resetMyApiKey
} from '../controllers/apiKeyController.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/my-key', getMyApiKey);
router.post('/reset-key', resetMyApiKey);

router.get('/', getMyApiKeys);
router.post('/', createApiKey);
router.delete('/:id', deleteApiKey);
router.patch('/:id/toggle', toggleApiKeyStatus);
router.get('/:id/stats', getApiKeyStats);
router.get('/stats/overview', getAllApiKeysStats);

export default router;
