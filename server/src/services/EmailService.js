const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass',
      },
    });
  }

  async sendDailySummary(email, jobs) {
    if (!email || jobs.length === 0) return;

    const jobRows = jobs.map(j => 
      `<li><a href="${j.source_url}"><b>${j.title}</b></a> at ${j.company} (${j.location || 'Remote'})</li>`
    ).join('');

    const html = `
      <h1>Daily Job Summary</h1>
      <p>We found ${jobs.length} new jobs matching your preferences:</p>
      <ul>${jobRows}</ul>
      <p><small>Sent by Dues Jobs</small></p>
    `;

    const text = `Daily Job Summary\n\nFound ${jobs.length} new jobs:\n` + 
      jobs.map(j => `- ${j.title} at ${j.company} (${j.source_url})`).join('\n');

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Your Daily Job Summary - ${jobs.length} New Jobs`,
        text,
        html,
      });
      console.log(`[Email] Sent to ${email}: ${info.messageId}`);
    } catch (err) {
      console.error(`[Email] Failed to send to ${email}`, err);
    }
  }
}

module.exports = new EmailService();
