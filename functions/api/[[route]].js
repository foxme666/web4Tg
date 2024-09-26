import { Router } from 'itty-router';
import { verifyPhone, checkStatus, register, submitCode, getAdminRecords, updateAdminStatus, testKV, getAllKVRecords } from '../../worker.js';

const router = Router();

router.post('/api/verify-phone', verifyPhone);
router.get('/api/check-status', checkStatus);
router.post('/api/register', register);
router.post('/api/submit-code', submitCode);
router.get('/api/admin/records', (request, env) => {
  console.log('Admin records route matched');
  return getAdminRecords(request, env);
});
router.post('/api/admin/update-status', updateAdminStatus);
router.get('/api/test-kv', testKV);
router.get('/api/test-all-kv', getAllKVRecords);

export const onRequest = async ({ request, env }) => {
  console.log('Request received:', request.url);
  const response = await router.handle(request, { env });
  console.log('Response status:', response.status);
  return response;
};