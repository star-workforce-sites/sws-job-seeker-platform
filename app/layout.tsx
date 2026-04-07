import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { Providers } from "./providers";
import AnalyticsTracker from "@/components/analytics-tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Career Accel Platform | AI Resume Optimizer, Interview Prep & Recruiter Job Search",
    template: "%s | STAR Workforce Solutions",
  },
  description: "Land your next job faster with AI-powered resume optimization for ATS, mock interview coaching, cover letter generation, and recruiter-assisted job search. Free tools to start.",
  keywords: [
    "AI resume optimizer", "ATS resume checker", "resume optimization tool",
    "how to pass ATS screening", "recruiter job search service",
    "AI interview prep", "cover letter generator", "resume distribution service",
    "job search automation", "career acceleration platform",
    "best resume optimization tool 2026", "recruiter applies for jobs for you",
    "how to get past ATS filters", "mock interview with AI coach",
    "personalized cover letter generator", "job market intelligence",
  ],
  metadataBase: new URL("https://www.starworkforcesolutions.com"),
  alternates: {
    canonical: "https://www.starworkforcesolutions.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.starworkforcesolutions.com",
    siteName: "STAR Workforce Solutions",
    title: "Career Accel Platform | AI Resume Optimizer, Interview Prep & Recruiter Job Search",
    description: "AI-powered career tools: ATS resume optimizer, interview coach, cover letter generator, and recruiter-assisted job search. Start free.",
    images: [
      {
        url: "/images/professional-deep-blue-and-gold-abstract-corporate-background-with-subtle-network-connections-920ce753.png",
        width: 1200,
        height: 630,
        alt: "STAR Workforce Solutions - Career Accel Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Career Accel Platform | AI Resume Optimizer & Recruiter Job Search",
    description: "Land your next job faster with AI resume optimization, interview prep, and recruiter-assisted job search.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Organization & SoftwareApplication JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": "STAR Workforce Solutions",
                  "legalName": "Startek LLC",
                  "url": "https://www.starworkforcesolutions.com",
                  "logo": "https://www.starworkforcesolutions.com/favicon.svg",
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+1-469-713-3993",
                    "contactType": "customer service",
                    "email": "info@starworkforcesolutions.com",
                    "areaServed": "US",
                    "availableLanguage": "English"
                  },
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "5465 Legacy Drive Suite 650",
                    "addressLocality": "Plano",
                    "addressRegion": "TX",
                    "postalCode": "75024",
                    "addressCountry": "US"
                  },
                  "sameAs": []
                },
                {
                  "@type": "WebSite",
                  "name": "STAR Workforce Solutions",
                  "url": "https://www.starworkforcesolutions.com",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://www.starworkforcesolutions.com/jobs?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "name": "Career Accel Platform",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Web",
                  "description": "AI-powered career acceleration platform with ATS resume optimizer, interview prep coach, cover letter generator, and recruiter-assisted job search",
                  "url": "https://www.starworkforcesolutions.com",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "description": "Free ATS resume scan and job search tools"
                  },
                  "provider": {
                    "@type": "Organization",
                    "name": "STAR Workforce Solutions"
                  }
                }
              ]
            })
          }}
        />
        {/* Google Analytics - gtag.js */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_path: window.location.pathname,
              send_page_view: true,
            });
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <Providers>
            <AnalyticsTracker />
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
