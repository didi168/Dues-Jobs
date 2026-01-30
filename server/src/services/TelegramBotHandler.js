const fetch = require('node-fetch');

/**
 * TelegramBotHandler
 * Simple long-polling bot listener to provide users with their Chat ID.
 * This is used to link their Telegram account to the website.
 */
class TelegramBotHandler {
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
    this.offset = 0;
    this.isRunning = false;
  }

  start() {
    if (!this.token || this.token === 'mock_token') {
      console.warn('[TelegramBot] No valid token found. Bot listener disabled.');
      return;
    }
    this.isRunning = true;
    this.poll();
    console.log('[TelegramBot] Listener started.');
  }

  async poll() {
    while (this.isRunning) {
      try {
        const response = await fetch(`${this.baseUrl}/getUpdates?offset=${this.offset}&timeout=30`);
        const data = await response.json();

        if (data.ok && data.result.length > 0) {
          for (const update of data.result) {
            this.offset = update.update_id + 1;
            if (update.message && update.message.text) {
              await this.handleMessage(update.message);
            }
          }
        }
      } catch (err) {
        console.error('[TelegramBot] Polling error:', err.message);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait before retry
      }
    }
  }

  async handleMessage(message) {
    const text = message.text ? message.text.toLowerCase() : '';
    const chatId = message.chat.id;
    const firstName = message.from ? message.from.first_name : 'there';

    let responseText = '';

    if (text === '/start') {
      responseText = `👋 *Welcome to Dues Jobs, ${firstName}!*\n\nI'm here to help you get notified about new job opportunities.\n\nTo link your account:\n1️⃣ Copy your Chat ID below\n2️⃣ Paste it on the Dues Jobs website settings\n3️⃣ Click Save\n\n📌 *Your Chat ID:* \`${chatId}\``;
    } else {
      responseText = `🤖 *Dues Jobs Bot*\n\nYour message: _"${text || 'Media/None'}"_\n\nIf you need your Chat ID for the dashboard, here it is:\n\n📌 *Chat ID:* \`${chatId}\`\n\nType /start for more info.`;
    }
    
    try {
      await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseText,
          parse_mode: 'Markdown',
        }),
      });
    } catch (err) {
      console.error('[TelegramBot] Error sending message:', err.message);
    }
  }

  stop() {
    this.isRunning = false;
  }
}

module.exports = new TelegramBotHandler();
