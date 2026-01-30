const { Resend } = require('resend');

class EmailService {
  constructor() {
    // We reuse SMTP_PASS if RESEND_API_KEY isn't set, as it contains the re_... key
    const apiKey = process.env.RESEND_API_KEY || process.env.SMTP_PASS;
    this.resend = new Resend(apiKey);
    this.from = process.env.EMAIL_FROM || 'Dues Jobs <jobs@dues.com>';
  }

  async sendDailySummary(email, jobs) {
    if (!email || !jobs || jobs.length === 0) {
      console.log(`[Email] Skipping send to ${email || 'unknown'}: no jobs or email provided.`);
      return;
    }

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Daily Job Summary</h1>
        <p>Hi there! We found ${jobs.length} new jobs matching your preferences:</p>
        <ul style="list-style: none; padding: 0;">
          ${jobs.map(j => `
            <li style="margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
              <a href="${j.apply_url}" style="text-decoration: none; color: #4f46e5; font-weight: bold; font-size: 1.1em;">${j.title}</a><br/>
              <span style="color: #666;">at ${j.company} • ${j.location || 'Remote'}</span>
            </li>
          `).join('')}
        </ul>
        <div style="margin-top: 20px; font-size: 0.8em; color: #999; border-top: 2px solid #eee; padding-top: 10px;">
          <p>Sent with ❤️ by Dues Jobs. Manage your alerts on your dashboard.</p>
        </div>
      </div>
    `;

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: email,
        subject: `Your Daily Job Summary - ${jobs.length} New Jobs`,
        html: html,
      });

      if (error) {
        throw error;
      }

      console.log(`[Email] Sent successfully to ${email}. ID: ${data?.id}`);
    } catch (err) {
      console.error(`[Email] Failed to send to ${email}:`, err.message || err);
    }
  }
}

module.exports = new EmailService();
