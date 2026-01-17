import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'STAR Workforce <info@starworkforcesolutions.com>',
      to: [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}
