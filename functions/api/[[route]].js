import { Router } from 'itty-router';
import { verifyPhone, checkStatus, register, submitCode, getAdminRecords, updateAdminStatus } from '../../worker';

const router = Router();

router.post('/api/verify-phone', verifyPhone);
router.get('/api/check-status', checkStatus);
router.post('/api/register', register);
router.post('/api/submit-code', submitCode);
router.get('/api/admin/records', getAdminRecords);
router.post('/api/admin/update-status', updateAdminStatus);

export const onRequest = (context) => router.handle(context.request, context);