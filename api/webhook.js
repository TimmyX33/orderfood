export default async function handler(req, res) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const ppID = process.env.PROMPTPAY_ID;
    const body = req.body;

    if (body.callback_query) {
        const cbId = body.callback_query.id;
        const chatId = body.callback_query.message.chat.id;
        const [action, table, amount] = body.callback_query.data.split('|');

        if (action === 'bill') {
            await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId, 
                    photo: `https://promptpay.io/${ppID}/${amount}.png`,
                    caption: `✅ *QR Code โต๊ะ ${table}* (ยอด ${amount} บ.)`, 
                    parse_mode: 'Markdown'
                })
            });
            await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({ callback_query_id: cbId, text: 'กำลังสร้าง QR Code...' })
            });
        }
    }
    res.status(200).send('OK');
}