const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    const port = parseInt(process.env.SMTP_PORT || '465');
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: port,
      secure: port === 465, // Use TLS for 465, STARTTLS for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000, // 10 second timeout
      socketTimeout: 10000,
    });
    this.from = process.env.EMAIL_FROM || 'Dues Jobs <jobs@dues.com>';

    this.transporter.verify((error, success) => {
      if (error) {
        console.error('[Email] SMTP Connection Error:', error.message || error);
      } else {
        console.log('[Email] SMTP Server is ready to take our messages');
      }
    });
  }

  async sendDailySummary(email, jobs) {
    if (!email || !jobs || jobs.length === 0) {
      console.log(`[Email] Skipping send to ${email || 'unknown'}: no jobs or email provided.`);
      return false;
    }

    try {
      const jobsHtml = jobs.map((job, index) => `
      <tr style="border-bottom: 1px solid #30363d;">
        <td style="padding: 1.25rem 0;">
          <div style="display: flex; gap: 1rem; align-items: flex-start;">
            <div style="flex-shrink: 0; width: 40px; height: 40px; background: linear-gradient(135deg, #3ecf8e 0%, #2db876 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1rem;">
              ${index + 1}
            </div>
            <div style="flex: 1; min-width: 0;">
              <h3 style="margin: 0 0 0.3rem 0; font-size: 0.95rem; font-weight: 700; color: #f0f6fc; word-break: break-word;">
                <a href="${job.apply_url}" style="color: #3ecf8e; text-decoration: none;">${job.title}</a>
              </h3>
              <p style="margin: 0 0 0.4rem 0; color: #8b949e; font-size: 0.85rem;">
                ${job.company}
              </p>
              <div style="display: flex; gap: 0.75rem; font-size: 0.8rem; color: #6e7681; flex-wrap: wrap;">
                <span>${job.source}</span>
                ${job.location ? `<span>•</span><span>${job.location}</span>` : '<span>•</span><span>Remote</span>'}
                ${job.salary ? `<span>•</span><span>${job.salary}</span>` : ''}
              </div>
            </div>
          </div>
        </td>
      </tr>
    `).join('');

      const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #f0f6fc;
              background-color: #0d1117;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #161b22;
              border-radius: 12px;
              overflow: hidden;
              border: 1px solid #30363d;
            }
            .header {
              background: linear-gradient(135deg, #3ecf8e 0%, #2db876 100%);
              color: white;
              padding: 2.5rem 2rem;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 1.75rem;
              font-weight: 800;
              letter-spacing: -0.02em;
            }
            .header p {
              margin: 0.5rem 0 0 0;
              opacity: 0.95;
              font-size: 0.9rem;
            }
            .content {
              padding: 2rem;
            }
            .greeting {
              font-size: 0.95rem;
              color: #f0f6fc;
              margin-bottom: 1.5rem;
              font-weight: 500;
              line-height: 1.5;
            }
            .jobs-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 1.5rem;
            }
            .cta-section {
              background: rgba(62, 207, 142, 0.08);
              padding: 1rem;
              border-radius: 8px;
              text-align: center;
              border: 1px solid rgba(62, 207, 142, 0.2);
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #3ecf8e 0%, #2db876 100%);
              color: white;
              padding: 0.65rem 1.25rem;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
              font-size: 0.85rem;
              transition: all 0.3s ease;
            }
            .footer {
              background-color: #0d1117;
              padding: 1rem 2rem;
              text-align: center;
              border-top: 1px solid #30363d;
              font-size: 0.75rem;
              color: #6e7681;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Your Daily Job Matches</h1>
              <p>Opportunities tailored to your preferences</p>
            </div>

            <div class="content">
              <p class="greeting">
                Hey! 👋 We found <span style="color: #3ecf8e; font-weight: 600;">${jobs.length} new job${jobs.length !== 1 ? 's' : ''}</span> for you today.
              </p>

              <table class="jobs-table">
                <tbody>
                  ${jobsHtml}
                </tbody>
              </table>

              <div class="cta-section">
                <p style="margin: 0 0 0.75rem 0; color: #3ecf8e; font-weight: 600; font-size: 0.9rem;">
                  Ready to apply?
                </p>
                <a href="${process.env.FRONTEND_URL || 'https://dues-jobs.com'}/dashboard" class="cta-button">
                  View All Jobs
                </a>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0;">
                © ${new Date().getFullYear()} Dues Jobs • Your personal job discovery assistant
              </p>
              <p style="margin: 0.5rem 0 0 0;">
                <a href="${process.env.FRONTEND_URL || 'https://dues-jobs.com'}/dashboard" style="color: #3ecf8e; text-decoration: none;">Dashboard</a> • 
                <a href="${process.env.FRONTEND_URL || 'https://dues-jobs.com'}/settings" style="color: #3ecf8e; text-decoration: none;">Settings</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

      const info = await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: `🎯 ${jobs.length} New Job${jobs.length !== 1 ? 's' : ''} Matching Your Preferences`,
        html: html,
      });

      console.log(`[Email] Sent successfully to ${email}. ID: ${info.messageId}`);
      return true;
    } catch (err) {
      console.error(`[Email] Failed to send to ${email}:`, err.message || err);
      return false;
    }
  }
}

module.exports = new EmailService();

// Test helper
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
  
  const testEmail = process.env.SMTP_USER;
  console.log(`[Email Test] Sending test email to ${testEmail}...`);
  
  const service = new EmailService();
  setTimeout(async () => {
    try {
      const info = await service.transporter.sendMail({
        from: service.from,
        to: testEmail,
        subject: 'Test Email from Dues Jobs',
        text: 'If you are reading this, your SMTP configuration is working!'
      });
      console.log(`[Email Test] Email sent successfully. ID: ${info.messageId}`);
    } catch (err) {
      console.error('[Email Test] Full Error:', err);
    }
    process.exit(0);
  }, 1000);
}
