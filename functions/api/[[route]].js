import { Router } from 'itty-router';
import { verifyPhone, checkStatus, register, submitCode, getAdminRecords, updateAdminStatus, getTimeLimitEnabled } from '../../worker.js';
import { ABOUT_URL } from '../../config.js';

const router = Router();

router.post('/api/verify-phone', verifyPhone);
router.get('/api/check-status', checkStatus);
router.post('/api/register', register);
router.post('/api/submit-code', submitCode);
router.get('/api/admin/records', async (request, env) => {
  console.log('Admin records route matched');
  console.log('Request URL:', request.url);
  try {
    const response = await getAdminRecords(request, env);
    console.log('Response:', response);
    return response;
  } catch (error) {
    console.error('Error in getAdminRecords:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
router.post('/api/admin/update-status', updateAdminStatus);
router.get('/api/get-time-limit-enabled', getTimeLimitEnabled);

export const onRequest = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  let response;

  switch (path) {
    case '/api/verify-phone':
      response = await verifyPhone(request, { env });
      break;
    case '/api/check-status':
      response = await checkStatus(request, { env });
      break;
    case '/api/register':
      response = await register(request, { env });
      break;
    case '/api/submit-code':
      response = await submitCode(request, { env });
      break;
    case '/api/admin/records':
      response = await getAdminRecords(request, { env });
      break;
    case '/api/admin/update-status':
      response = await updateAdminStatus(request, { env });
      break;
    case '/api/get-time-limit-enabled':
      response = await getTimeLimitEnabled(request, { env });
      break;
    default:
      // 处理 HTML 页面请求
      if (!response) {
        let html = await fetch(request).then(res => res.text());
        
        // 替换 ABOUT_URL 占位符
        html = html.replace(/\{\{\s*ABOUT_URL\s*\}\}/g, env.ABOUT_URL || ABOUT_URL || '#');

        response = new Response(html, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      return response;
  }

  return response;
};