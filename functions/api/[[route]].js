import { Router } from 'itty-router';
import { verifyPhone, checkStatus, register, submitCode, getAdminRecords, updateAdminStatus, testKV } from '../../worker.js';

const router = Router();

router.post('/api/verify-phone', verifyPhone);
router.get('/api/check-status', checkStatus);
router.post('/api/register', register);
router.post('/api/submit-code', submitCode);
router.get('/api/admin/records', getAdminRecords);
router.post('/api/admin/update-status', updateAdminStatus);
router.get('/api/test-kv', testKV);  // 添加这一行

export const onRequest = async ({ request, env }) => {
  console.log('Request received:', request.url);
  return router.handle(request, { env });
};