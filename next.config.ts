import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Old site pages that no longer exist — redirect to relevant pages
      // Both with and without trailing slash to cover all GSC 404 variants
      {
        source: '/about',
        destination: '/',
        permanent: true,
      },
      {
        source: '/about/',
        destination: '/',
        permanent: true,
      },
      {
        source: '/star-workforce-benefits',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/star-workforce-benefits/',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/automation',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/automation/',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/work-at-star',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/work-at-star/',
        destination: '/contact',
        permanent: true,
      },
      // Old employer register path from static sitemap
      {
        source: '/employer/register',
        destination: '/auth/register',
        permanent: true,
      },
      {
        source: '/employer/register/',
        destination: '/auth/register',
        permanent: true,
      },
      // HTTP → HTTPS and non-www → www are handled by Vercel automatically,
      // but capture common legacy paths that may appear in external links
      {
        source: '/jobs/',
        destination: '/jobs',
        permanent: true,
      },
      {
        source: '/services/',
        destination: '/services',
        permanent: true,
      },
      {
        source: '/contact/',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/faq/',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/hire-recruiter/',
        destination: '/hire-recruiter',
        permanent: true,
      },
      {
        source: '/tools/ats-optimizer/',
        destination: '/tools/ats-optimizer',
        permanent: true,
      },
      {
        source: '/auth/login/',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/auth/register/',
        destination: '/auth/register',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
