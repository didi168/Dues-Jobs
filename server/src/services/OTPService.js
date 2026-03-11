const crypto = require('crypto');
const nodemailer = require('nodemailer');

class OTPService {
  constructor() {
    this.otpStore = new Map(); // In-memory store: email -> { code, expiresAt, attempts }
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 465,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    this.from = process.env.EMAIL_FROM || 'Dues Jobs <jobs@dues.com>';

    // Verify connection on startup
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('[OTP] SMTP Connection Error:', error.message || error);
      } else {
        console.log('[OTP] SMTP Server is ready for OTP emails');
      }
    });

    // Clean up expired OTPs every 5 minutes
    setInterval(() => this.cleanupExpiredOTPs(), 5 * 60 * 1000);
  }

  /**
   * Generate a 6-digit OTP code
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send OTP to email
   * @param {string} email - User's email
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async sendOTP(email) {
    try {
      // Check rate limiting (max 3 OTP requests per 10 minutes)
      const existing = this.otpStore.get(email);
      if (existing && existing.attempts >= 3) {
        const timeSinceFirst = Date.now() - existing.firstAttemptTime;
        if (timeSinceFirst < 10 * 60 * 1000) { // 10 minutes
          return {
            success: false,
            message: 'Too many OTP requests. Please try again later.',
          };
        }
      }

      // Generate OTP (valid for 15 minutes)
      const code = this.generateOTP();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

      // Store OTP
      this.otpStore.set(email, {
        code,
        expiresAt,
        attempts: (existing?.attempts || 0) + 1,
        firstAttemptTime: existing?.firstAttemptTime || Date.now(),
      });

      // Send email with branded template
      const html = this.getOTPEmailTemplate(code);

      const info = await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'Your Dues Jobs Verification Code',
        html: html,
      });

      console.log(`[OTP] Sent to ${email}. Code: ${code}. ID: ${info.messageId}`);

      return {
        success: true,
        message: 'OTP sent successfully',
      };
    } catch (err) {
      console.error(`[OTP] Failed to send to ${email}:`, err.message || err);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
      };
    }
  }

  /**
   * Verify OTP code
   * @param {string} email - User's email
   * @param {string} code - OTP code to verify
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async verifyOTP(email, code) {
    try {
      const stored = this.otpStore.get(email);

      if (!stored) {
        return {
          success: false,
          message: 'No OTP found for this email. Please request a new one.',
        };
      }

      // Check if OTP expired
      if (Date.now() > stored.expiresAt) {
        this.otpStore.delete(email);
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.',
        };
      }

      // Check if code matches
      if (stored.code !== code) {
        return {
          success: false,
          message: 'Invalid OTP code. Please try again.',
        };
      }

      // OTP verified successfully, delete it
      this.otpStore.delete(email);

      console.log(`[OTP] Verified successfully for ${email}`);

      return {
        success: true,
        message: 'Email verified successfully',
      };
    } catch (err) {
      console.error(`[OTP] Verification error for ${email}:`, err.message || err);
      return {
        success: false,
        message: 'Verification failed. Please try again.',
      };
    }
  }

  /**
   * Resend OTP to email
   * @param {string} email - User's email
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async resendOTP(email) {
    // Delete old OTP and send new one
    this.otpStore.delete(email);
    return this.sendOTP(email);
  }

  /**
   * Clean up expired OTPs from memory
   */
  cleanupExpiredOTPs() {
    const now = Date.now();
    for (const [email, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(email);
        console.log(`[OTP] Cleaned up expired OTP for ${email}`);
      }
    }
  }

  /**
   * Get branded OTP email template
   */
  getOTPEmailTemplate(code) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
              padding: 3rem 2rem;
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
              padding: 2.5rem 2rem;
              text-align: center;
            }
            .greeting {
              font-size: 1.1rem;
              color: #f0f6fc;
              margin-bottom: 1.5rem;
              font-weight: 500;
            }
            .otp-box {
              background: rgba(62, 207, 142, 0.08);
              border: 2px solid #3ecf8e;
              border-radius: 12px;
              padding: 2rem;
              margin: 2rem 0;
            }
            .otp-code {
              font-size: 3rem;
              font-weight: 800;
              color: #3ecf8e;
              letter-spacing: 0.5rem;
              font-family: 'Courier New', monospace;
              margin: 0;
            }
            .otp-label {
              font-size: 0.85rem;
              color: #8b949e;
              margin-top: 0.75rem;
            }
            .info-text {
              font-size: 0.95rem;
              color: #8b949e;
              margin: 1.5rem 0;
            }
            .footer {
              background-color: #0d1117;
              padding: 2rem;
              text-align: center;
              border-top: 1px solid #30363d;
              font-size: 0.85rem;
              color: #6e7681;
            }
            .security-notice {
              background: rgba(62, 207, 142, 0.1);
              border-left: 4px solid #3ecf8e;
              padding: 1rem;
              margin: 1.5rem 0;
              border-radius: 6px;
              font-size: 0.9rem;
              color: #3ecf8e;
            }
            .footer-link {
              color: #3ecf8e;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>🎯 Dues Jobs</h1>
              <p>Verify Your Email</p>
            </div>

            <!-- Content -->
            <div class="content">
              <p class="greeting">
                Welcome! 👋 Use the code below to verify your email and get started.
              </p>

              <!-- OTP Box -->
              <div class="otp-box">
                <p class="otp-code">${code}</p>
                <p class="otp-label">6-digit verification code</p>
              </div>

              <p class="info-text">
                This code expires in <strong>15 minutes</strong>
              </p>

              <!-- Security Notice -->
              <div class="security-notice">
                <strong>🔒 Keep it safe:</strong> Never share this code with anyone.
              </div>

              <p class="info-text" style="font-size: 0.85rem; color: #6e7681;">
                If you didn't create a Dues Jobs account, you can ignore this email.
              </p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p style="margin: 0;">
                © ${new Date().getFullYear()} Dues Jobs
              </p>
              <p style="margin: 0.5rem 0 0 0;">
                <a href="https://dues-jobs.com" class="footer-link">Visit our website</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

module.exports = new OTPService();
