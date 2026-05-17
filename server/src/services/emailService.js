const sgMail = require('@sendgrid/mail');
const env = require('../config/env');

/**
 * SendGrid email service — configured via SENDGRID_API_KEY env variable.
 * If the key is not set, email sending is silently skipped.
 */
if (env.SENDGRID_API_KEY) {
  sgMail.setApiKey(env.SENDGRID_API_KEY);
  console.log('📧 Email service configured (SendGrid)');
} else {
  console.log('📧 Email service not configured (SENDGRID_API_KEY missing). Email reminders disabled.');
}

/**
 * Send a renewal reminder email
 * @param {string} to - Recipient email address
 * @param {object} details - { appName, plan, renewalDate, cost }
 */
const sendRenewalReminder = async (to, { appName, plan, renewalDate, cost }) => {
  if (!env.SENDGRID_API_KEY) {
    console.log(`📧 [SKIP] Renewal reminder for ${appName} — email not configured`);
    return null;
  }

  const formattedDate = new Date(renewalDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedCost = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(cost);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#0F0F1A;font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F1A;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#16162A;border-radius:16px;border:1px solid rgba(255,255,255,0.07);overflow:hidden;">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#7C6AF0 0%,#22D3EE 100%);padding:32px;text-align:center;">
                  <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.02em;">SubTrackr</h1>
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Subscription Renewal Reminder</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:32px;">
                  <h2 style="margin:0 0 8px;color:#F0F0F8;font-size:20px;font-weight:600;">Upcoming Renewal</h2>
                  <p style="margin:0 0 24px;color:#A8A8C0;font-size:14px;line-height:1.6;">Your subscription is renewing soon. Here are the details:</p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(124,106,240,0.06);border-radius:12px;border:1px solid rgba(255,255,255,0.05);">
                    <tr>
                      <td style="padding:20px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:8px 0;color:#A8A8C0;font-size:13px;">App</td>
                            <td style="padding:8px 0;color:#F0F0F8;font-size:14px;font-weight:600;text-align:right;">${appName}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;color:#A8A8C0;font-size:13px;border-top:1px solid rgba(255,255,255,0.05);">Plan</td>
                            <td style="padding:8px 0;color:#F0F0F8;font-size:14px;font-weight:500;text-align:right;border-top:1px solid rgba(255,255,255,0.05);">${plan}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;color:#A8A8C0;font-size:13px;border-top:1px solid rgba(255,255,255,0.05);">Renewal Date</td>
                            <td style="padding:8px 0;color:#F59E0B;font-size:14px;font-weight:600;text-align:right;border-top:1px solid rgba(255,255,255,0.05);">${formattedDate}</td>
                          </tr>
                          <tr>
                            <td style="padding:8px 0;color:#A8A8C0;font-size:13px;border-top:1px solid rgba(255,255,255,0.05);">Amount</td>
                            <td style="padding:8px 0;color:#10B981;font-size:18px;font-weight:700;text-align:right;border-top:1px solid rgba(255,255,255,0.05);">${formattedCost}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:24px 0 0;color:#62628A;font-size:12px;text-align:center;line-height:1.5;">
                    This is an automated reminder from SubTrackr.<br>
                    Manage your subscriptions at any time from your dashboard.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const msg = {
      to,
      from: env.EMAIL_FROM || '"SubTrackr" <noreply@subtrackr.com>',
      subject: `🔔 ${appName} renewal in 3 days — ${formattedCost}`,
      html,
    };
    const [response] = await sgMail.send(msg);
    console.log(`📧 Renewal reminder sent to ${to} for ${appName} (status ${response.statusCode})`);
    return response;
  } catch (error) {
    console.error(`📧 Failed to send reminder to ${to}:`, error.message);
    return null;
  }
};

module.exports = { sendRenewalReminder };
