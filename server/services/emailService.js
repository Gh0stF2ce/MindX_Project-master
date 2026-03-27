const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_SECURE } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) {
      return null;
    }

    const normalizedPassword = SMTP_PASSWORD.replace(/\s+/g, '');

    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true',
      family: 4,
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
      auth: {
        user: SMTP_USER,
        pass: normalizedPassword,
      },
    });

    return this.transporter;
  }

  async sendCodeEmail({ to, code, subject, title }) {
    const transporter = this.getTransporter();
    const from = process.env.SMTP_FROM?.replace('your_email@gmail.com', process.env.SMTP_USER) || process.env.SMTP_USER;

    if (!transporter) {
      console.log(`[EMAIL FALLBACK] ${subject} for ${to}: ${code}`);
      return;
    }

    try {
      await Promise.race([
        transporter.sendMail({
          from,
          to,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
              <h2>${title}</h2>
              <p>Ваш код подтверждения:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</div>
              <p>Код действует 10 минут.</p>
              <p>Если это были не вы, просто проигнорируйте письмо.</p>
            </div>
          `,
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('SMTP timeout exceeded')), 6000)
        ),
      ]);
    } catch (error) {
      console.error(`[EMAIL ERROR] ${subject} for ${to}: ${error.message}`);
      console.log(`[EMAIL FALLBACK] ${subject} for ${to}: ${code}`);
    }
  }
}

module.exports = new EmailService();
