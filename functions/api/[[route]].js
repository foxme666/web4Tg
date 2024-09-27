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
  console.log('Request received:', context.request.url);
  console.log('Request method:', context.request.method);
  try {
    const response = await router.handle(context.request, context);
    console.log('Response status:', response.status);
    return response;
  } catch (error) {
    console.error('Error in onRequest:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export async function onRequest(context) {
  // ... 现有的请求处理逻辑 ...

  let html = // ... 获取 HTML 内容 ...

  // 替换 ABOUT_URL 占位符
  html = html.replace('{{ ABOUT_URL }}', context.env.ABOUT_URL || ABOUT_URL || '#');

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}