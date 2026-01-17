'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// CRITICAL: Force dynamic rendering to prevent static generation
// This page uses useSession() which requires runtime session context
export const dynamic = 'force-dynamic';

export default function HireRecruiter() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: 'Basic Plan',
      price: '$199',
      period: '/month',
      description: '3-5 daily job applications',
      features: [
        '3-5 targeted applications per day',
        'Resume optimization',
        'Cover letter customization',
        'Weekly progress reports',
        'Email support'
      ],
      subscriptionType: 'recruiter_basic'
    },
    {
      name: 'Standard Plan',
      price: '$399',
      period: '/month',
      description: '10-15 daily job applications',
      features: [
        '10-15 targeted applications per day',
        'Advanced resume optimization',
        'Custom cover letters',
        'Bi-weekly strategy calls',
        'Priority email support',
        'Interview preparation'
      ],
      subscriptionType: 'recruiter_standard',
      popular: true
    },
    {
      name: 'Pro Plan',
      price: '$599',
      period: '/month',
      description: '20-30 daily job applications',
      features: [
        '20-30 targeted applications per day',
        'Premium resume optimization',
        'Personalized cover letters',
        'Weekly strategy calls',
        'Priority phone support',
        'Interview coaching',
        'Salary negotiation support'
      ],
      subscriptionType: 'recruiter_pro'
    }
  ];

  const handleSelectPlan = async (subscriptionType: string) => {
    if (!session) {
      router.push(`/auth/login?callbackUrl=/hire-recruiter`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionType }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1A2F] to-[#132A47] text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Hire Your <span className="text-[#E8C547]">Dedicated Offshore Recruiter</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Let our expert recruiters handle your job search while you focus on interview preparation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-lg p-8 ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#E8C547] to-[#D4AF37] text-[#0A1A2F] scale-105 shadow-2xl'
                  : 'bg-white/10 backdrop-blur-lg'
              } relative`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#0A1A2F] text-[#E8C547] px-4 py-1 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-1">
                  {plan.price}
                  <span className="text-lg font-normal">{plan.period}</span>
                </div>
                <p className={`text-sm ${plan.popular ? 'text-[#0A1A2F]/80' : 'text-gray-400'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <svg
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.popular ? 'text-[#0A1A2F]' : 'text-[#E8C547]'
                      }`}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.subscriptionType)}
                disabled={loading || status === 'loading'}
                className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
                  plan.popular
                    ? 'bg-[#0A1A2F] text-[#E8C547] hover:bg-[#132A47]'
                    : 'bg-[#E8C547] text-[#0A1A2F] hover:bg-[#D4AF37]'
                } disabled:opacity-50`}
              >
                {loading ? 'Processing...' : status === 'loading' ? 'Loading...' : 'Choose Plan'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-400">
            Not sure which plan is right for you?{' '}
            <a href="/contact" className="text-[#E8C547] hover:underline">
              Contact us
            </a>{' '}
            for personalized guidance
          </p>
        </div>
      </div>
    </div>
  );
}
