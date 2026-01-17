export function guestPurchaseConfirmationEmail(
  email: string,
  purchaseType: string,
  accessToken: string
) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_URL}/guest-dashboard?token=${accessToken}`;
  
  const productNames: Record<string, string> = {
    ats_optimizer: 'ATS Optimizer',
    cover_letter: 'Cover Letter Generator',
    resume_distribution: 'Resume Distribution Service',
  };

  return {
    to: email,
    subject: `Your ${productNames[purchaseType]} Purchase - STAR Workforce`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0A1A2F;">Thank You for Your Purchase!</h1>
          <p>Your payment for <strong>${productNames[purchaseType]}</strong> has been processed.</p>
          <p><a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background: #0A1A2F; color: #ffffff; text-decoration: none; border-radius: 6px;">Access Your Dashboard</a></p>
        </div>
      </body>
      </html>
    `,
    text: `Thank you for your purchase of ${productNames[purchaseType]}. Access your dashboard: ${dashboardUrl}`,
  };
}
