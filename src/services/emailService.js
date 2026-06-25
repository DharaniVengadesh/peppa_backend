const nodemailer = require('nodemailer');
const config = require('../config');

let transporter;

const getTransporter = () => {
  if (!transporter && config.smtp.host) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: false,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    });
  }
  return transporter;
};

const sendHouseholdInviteEmail = async ({ to, inviterName, householdName, inviteToken }) => {
  const joinUrl = `${config.appUrl}/api/v1/mobile/households/invites/${inviteToken}/accept`;
  const deepLink = `${config.mobileDeepLink}?token=${inviteToken}`;

  const html = `
    <h2>You're invited to join ${householdName} on Peppa</h2>
    <p>${inviterName} has invited you to manage pantry and meals together.</p>
    <p><a href="${joinUrl}">Accept invitation</a></p>
    <p>Or open in the Peppa app: ${deepLink}</p>
    <p><small>This invite expires in 7 days.</small></p>
  `;

  const transport = getTransporter();
  if (!transport) {
    console.log('[Email stub] Invite to', to, 'token:', inviteToken);
    return { stubbed: true };
  }

  await transport.sendMail({
    from: config.smtp.from,
    to,
    subject: `Join ${householdName} on Peppa`,
    html,
  });

  return { sent: true };
};

module.exports = { sendHouseholdInviteEmail };
