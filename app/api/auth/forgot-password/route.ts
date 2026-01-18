import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // For security, always return success (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, resetUrl);

    console.log(`Password reset requested for ${email}`);
    console.log(`Reset token: ${resetToken}`); // For testing - remove in production

    return NextResponse.json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
