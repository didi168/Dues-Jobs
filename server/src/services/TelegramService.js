const fetch = require('node-fetch');

class TelegramService {
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  async sendDailySummary(chatId, jobs) {
    if (!this.token || this.token === 'mock_token') {
      console.log(`[Telegram] Mock send to ${chatId}: ${jobs.length} jobs`);
      return;
    }

    if (!chatId || jobs.length === 0) return;

    const message = `📢 *Daily Job Summary*\nFound ${jobs.length} new jobs:\n\n` +
      jobs.map(j => `• [${j.title}](${j.apply_url}) at ${j.company}`).slice(0, 10).join('\n') +
      (jobs.length > 10 ? `\n\n...and ${jobs.length - 10} more.` : '');

    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
      
      const data = await response.json();
      if (!data.ok) {
        console.error('[Telegram] API Error:', data);
      } else {
        console.log(`[Telegram] Sent to ${chatId}`);
      }
    } catch (err) {
      console.error('[Telegram] Network Error:', err);
    }
  }
}

module.exports = new TelegramService();
