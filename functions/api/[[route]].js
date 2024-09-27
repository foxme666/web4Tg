import { verifyPhone, checkStatus, register, submitCode, getAdminRecords, updateAdminStatus, getTimeLimitEnabled } from '../../worker.js';

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
      response = await fetch(request);
  }

  return response;
};