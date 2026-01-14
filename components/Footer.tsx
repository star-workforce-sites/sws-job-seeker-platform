import Link from "next/link"
import { Shield, Lock, CheckCircle2 } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0F172A] border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap justify-center gap-6 mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-2 text-[#CBD5E1] text-sm">
            <Lock className="w-5 h-5 text-[#E8C547]" />
            <span style={{ fontFamily: "Open Sans, sans-serif" }}>256-bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-2 text-[#CBD5E1] text-sm">
            <Shield className="w-5 h-5 text-[#E8C547]" />
            <span style={{ fontFamily: "Open Sans, sans-serif" }}>GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-[#CBD5E1] text-sm">
            <CheckCircle2 className="w-5 h-5 text-[#E8C547]" />
            <span style={{ fontFamily: "Open Sans, sans-serif" }}>FTC Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-[#CBD5E1] text-sm">
            <CheckCircle2 className="w-5 h-5 text-[#E8C547]" />
            <span style={{ fontFamily: "Open Sans, sans-serif" }}>29 CFR § 1625.2</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3
              className="font-bold text-white mb-4 uppercase text-sm tracking-wide"
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}
            >
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/services"
                  className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/jobs"
                  className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/ats-optimizer"
                  className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  ATS Tool
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className="font-bold text-white mb-4 uppercase text-sm tracking-wide"
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}
            >
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact?subject=About Us Inquiry"
                  className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact?subject=Blog Inquiry"
                  className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact?subject=Careers Inquiry"
                  className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className="font-bold text-white mb-4 uppercase text-sm tracking-wide"
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}
            >
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact?subject=Help Center Inquiry"
                  className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className="font-bold text-white mb-4 uppercase text-sm tracking-wide"
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}
            >
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/legal/privacy"
                  className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms"
                  className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/disclaimer"
                  className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                  style={{ fontFamily: "Open Sans, sans-serif" }}
                >
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 space-y-4">
          <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded text-sm text-[#CBD5E1]">
            <p
              className="font-semibold text-[#E8C547] mb-2"
              style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}
            >
              Legal Compliance Notice:
            </p>
            <p style={{ fontFamily: "Open Sans, sans-serif" }} className="text-xs leading-relaxed">
              STAR Workforce Solutions is a resume marketing and distribution service. We do not guarantee employment.
              We are not a staffing agency or employment agency. We charge for resume marketing and recruiter support
              services, not job placement. Offshore recruiters are independent contractors and not employees of the
              jobseeker or STAR Workforce Solutions. All services are paid upfront and are NOT contingent on job
              placement. AI tools may be used to assist with resume analysis and distribution. Users must verify all
              AI-generated output. See full disclaimer{" "}
              <Link href="/legal/disclaimer" className="text-[#E8C547] underline hover:text-white transition-colors">
                here
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center text-[#CBD5E1]">
            <p className="text-sm" style={{ fontFamily: "Open Sans, sans-serif" }}>
              © {currentYear} STAR Workforce Solutions. All rights reserved. Since 2013. Consulting & Contract Services
              Only — USA & Canada.
            </p>
            <div className="flex gap-4 justify-center my-4">
              <Link
                href="https://www.linkedin.com/company/star-workforce-solutions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
              <Link
                href="https://x.com/star_workforce"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#CBD5E1] hover:text-[#E8C547] transition-colors duration-200"
                aria-label="X (formerly Twitter)"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
              <div className="text-[#CBD5E1] cursor-default" aria-label="GitHub (decorative)">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
