export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    
    const { table, items, total } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // 1. เช็คก่อนว่าตัวแปรใน Vercel มาครบไหม
    if (!token || !chatId) {
        console.error("❌ ไม่พบ TELEGRAM_BOT_TOKEN หรือ TELEGRAM_CHAT_ID");
        return res.status(500).json({ error: "Server Configuration Error: Missing Token/ChatID" });
    }

    let msg = `🔔 *ออเดอร์ใหม่! (โต๊ะ ${table})*\n------------------\n`;
    items.forEach(i => {
        msg += `▫️ ${i.name} x${i.qty} = ${i.price * i.qty}\n`;
        if (i.note) msg += `   (📝 ${i.note})\n`; 
    });
    msg += `------------------\n💰 *ยอดรวม: ${total} บาท*\n`;
    msg += `📅 ${new Date().toLocaleTimeString('th-TH')}`;

    try {
        // 2. ยิงไป Telegram
        const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId, 
                text: msg, 
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: [[{ text: "💵 เช็คบิล / รับ QR", callback_data: `bill|${table}|${total}` }]] }
            })
        });

        // 3. อ่านผลลัพธ์จาก Telegram ว่าผ่านไหม?
        const telegramData = await telegramRes.json();

        if (!telegramRes.ok) {
            // ถ้าไม่ผ่าน ให้ Log Error ออกมาดู
            console.error("❌ Telegram API Error:", telegramData);
            return res.status(500).json({ error: "Telegram Error", details: telegramData });
        }

        return res.status(200).json({ status: 'ok' });

    } catch (e) {
        console.error("❌ Fetch Error:", e);
        return res.status(500).json({ error: e.message });
    }
}