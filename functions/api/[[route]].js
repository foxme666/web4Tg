import { Router } from 'itty-router';
import { verifyPhone, checkStatus, register, submitCode, getAdminRecords, updateAdminStatus } from '../../worker.js';

const router = Router();

router.post('/api/verify-phone', verifyPhone);
router.get('/api/check-status', checkStatus);
router.post('/api/register', register);
router.post('/api/submit-code', submitCode);
router.get('/api/admin/records', getAdminRecords);
router.post('/api/admin/update-status', updateAdminStatus);

export const onRequest = async ({ request, env }) => {
  // 将环境变量传递给上下文
  return router.handle(request, { env });
};