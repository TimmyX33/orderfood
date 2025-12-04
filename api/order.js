export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    const { table, items, total } = req.body;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    let msg = `🔔 *ออเดอร์ใหม่! (โต๊ะ ${table})*\n------------------\n`;
    items.forEach(i => {
        msg += `▫️ ${i.name} x${i.qty} = ${i.price * i.qty}\n`;
        if (i.note) msg += `   (📝 ${i.note})\n`; // แสดงหมายเหตุในแชท
    });
    msg += `------------------\n💰 *ยอดรวม: ${total} บาท*\n`;
    msg += `📅 ${new Date().toLocaleTimeString('th-TH')}`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId, text: msg, parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "💵 เช็คบิล / รับ QR", callback_data: `bill|${table}|${total}` }]] }
        })
    });
    res.status(200).json({ status: 'ok' });
}