export async function onRequestPost(context) {
  const { request, env } = context;
  const { ADMIN_PASSWORD } = env;

  if (!ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ message: '管理员密码未配置' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { password } = await request.json();

  if (password === ADMIN_PASSWORD) {
    // 在这里，我们可能需要设置一个 cookie 或返回一个 token
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    return new Response(JSON.stringify({ message: '密码错误' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}