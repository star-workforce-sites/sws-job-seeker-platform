import { NextResponse } from 'next/server';

export async function GET() {
  const requiredVars = {
    'STRIPE_PRODUCT_ATS_OPTIMIZER': process.env.STRIPE_PRODUCT_ATS_OPTIMIZER,
    'STRIPE_PRICE_ATS_OPTIMIZER': process.env.STRIPE_PRICE_ATS_OPTIMIZER,
    'STRIPE_PRODUCT_COVER_LETTER': process.env.STRIPE_PRODUCT_COVER_LETTER,
    'STRIPE_PRICE_COVER_LETTER': process.env.STRIPE_PRICE_COVER_LETTER,
    'STRIPE_PRODUCT_RESUME_DISTRIBUTION': process.env.STRIPE_PRODUCT_RESUME_DISTRIBUTION,
    'STRIPE_PRICE_RESUME_DISTRIBUTION': process.env.STRIPE_PRICE_RESUME_DISTRIBUTION,
    'STRIPE_PRODUCT_DIY_PREMIUM': process.env.STRIPE_PRODUCT_DIY_PREMIUM,
    'STRIPE_PRICE_DIY_PREMIUM': process.env.STRIPE_PRICE_DIY_PREMIUM,
    'STRIPE_PRODUCT_RECRUITER_BASIC': process.env.STRIPE_PRODUCT_RECRUITER_BASIC,
    'STRIPE_PRICE_RECRUITER_BASIC': process.env.STRIPE_PRICE_RECRUITER_BASIC,
    'STRIPE_PRODUCT_RECRUITER_STANDARD': process.env.STRIPE_PRODUCT_RECRUITER_STANDARD,
    'STRIPE_PRICE_RECRUITER_STANDARD': process.env.STRIPE_PRICE_RECRUITER_STANDARD,
    'STRIPE_PRODUCT_RECRUITER_PRO': process.env.STRIPE_PRODUCT_RECRUITER_PRO,
    'STRIPE_PRICE_RECRUITER_PRO': process.env.STRIPE_PRICE_RECRUITER_PRO,
  };

  const missing: string[] = [];
  const present: string[] = [];
  const details: Record<string, any> = {};

  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value || value === '') {
      missing.push(key);
      details[key] = '❌ MISSING';
    } else {
      present.push(key);
      details[key] = `✅ ${value.substring(0, 12)}...`;
    }
  });

  const allSet = missing.length === 0;

  return NextResponse.json({
    status: allSet ? '✅ ALL STRIPE VARIABLES SET' : '❌ MISSING VARIABLES',
    summary: {
      total: Object.keys(requiredVars).length,
      present: present.length,
      missing: missing.length,
    },
    missingVariables: missing,
    details: details,
    timestamp: new Date().toISOString(),
  }, {
    status: allSet ? 200 : 500,
  });
}
