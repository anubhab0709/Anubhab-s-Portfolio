import { Resend } from 'resend';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

let resendClient = null;

function getResendClient() {
  if (!env.RESEND_API_KEY) {
    throw new ApiError(503, 'Contact email service is not configured yet.');
  }

  if (!resendClient) {
    resendClient = new Resend(env.RESEND_API_KEY);
  }

  return resendClient;
}

function validateContactConfig() {
  if (!env.CONTACT_FROM_EMAIL || !env.CONTACT_TO_EMAIL) {
    throw new ApiError(503, 'Contact email addresses are not configured yet.');
  }
}

export async function sendContactEmail({ name, email, subject, message }) {
  validateContactConfig();

  const resend = getResendClient();
  const safeName = name.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeEmail = email.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeSubject = subject.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');

  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
    <h2>New Portfolio Contact Message</h2>
    <p><strong>Name:</strong> ${safeName}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Subject:</strong> ${safeSubject}</p>
    <p><strong>Message:</strong><br/>${safeMessage}</p>
  </div>`;

  const text = [
    'New Portfolio Contact Message',
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    'Message:',
    message
  ].join('\n');

  const result = await resend.emails.send({
    from: env.CONTACT_FROM_EMAIL,
    to: env.CONTACT_TO_EMAIL,
    reply_to: email,
    subject: `[Portfolio] ${subject}`,
    html,
    text
  });

  return result;
}
