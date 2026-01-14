import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import CookieConsent from "@/components/cookie-consent"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "STAR Workforce Solutions - Premium Contract & Consulting Career Services",
  description:
    "STAR Workforce Solutions: Consulting and contract job placement services for Software, AI, ML, Cloud, Cybersecurity, Data Engineering, DevOps professionals in USA & Canada. Resume distribution, ATS optimization, dedicated recruiter placement, and AI-powered career tools since 2013.",
  keywords:
    "consulting jobs, contract jobs, workforce solutions, resume distribution, ATS optimization, recruiter services, software engineer jobs, AI jobs, ML jobs, cloud jobs, cybersecurity jobs, Canada jobs USA jobs",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.jpg", sizes: "192x192", type: "image/jpeg" },
      { url: "/icon-512x512.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: [{ url: "/apple-touch-icon.jpg", sizes: "180x180", type: "image/jpeg" }],
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${openSans.variable}`}>
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || "G-2KEG2N039D"}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || "G-2KEG2N039D"}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className={`font-sans antialiased bg-background text-foreground`}>
        {children}
        <CookieConsent />
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}
