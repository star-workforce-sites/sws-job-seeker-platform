import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Legal Disclaimer - STAR Workforce Solutions',
  description: 'Legal Disclaimer for STAR Workforce Solutions',
}

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
              <h1 className="text-4xl font-bold text-foreground premium-heading">Legal Disclaimer</h1>
            </div>
            <p className="text-muted-foreground premium-body">Last updated: November 2024</p>
          </div>

          <Card className="p-8 space-y-8">
            <section className="p-6 bg-destructive/5 border border-destructive/20 rounded-lg">
              <h2 className="text-2xl font-bold text-foreground mb-4 premium-heading">CRITICAL DISCLAIMER</h2>
              <p className="text-foreground font-semibold mb-3 premium-body">
                STAR Workforce Solutions is a resume marketing and distribution service ONLY. We are NOT:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground premium-body">
                <li><strong>Not a staffing agency or employment agency</strong></li>
                <li><strong>Not a job placement service</strong> - we charge for marketing and recruiter support, not job placement</li>
                <li><strong>Not guaranteeing employment</strong> in any way</li>
                <li><strong>Not liable for recruiter responses</strong> or lack thereof</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 premium-heading">Service Scope & Geographic Limitations</h2>
              <p className="text-muted-foreground mb-3 premium-body">
                <strong>Consulting & Contract Services Only:</strong> STAR Workforce Solutions specializes exclusively in consulting and contract job opportunities. NO full-time permanent positions are offered on this platform.
              </p>
              <p className="text-muted-foreground mb-3 premium-body">
                <strong>Geographic Service Area:</strong> USA and Canada only.
              </p>
              <p className="text-muted-foreground premium-body">
                <strong>Industries Served:</strong> Software, AI, Machine Learning, Cloud, Cybersecurity, Data Engineering, DevOps, and High-Tech industries only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 premium-heading">No Employment Guarantee or Salary Negotiation</h2>
              <p className="text-muted-foreground mb-3 premium-body">
                STAR Workforce Solutions does not guarantee employment outcomes. Our services are designed to maximize your visibility to recruiters and improve your application quality. Employment results depend on multiple factors including qualifications, market conditions, and recruiter decisions.
              </p>
              <p className="text-muted-foreground premium-body">
                <strong>STAR Workforce Solutions does not negotiate salaries or contracts on behalf of users.</strong> Users are solely responsible for all salary negotiations and contract terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 premium-heading">Offshore Recruiter Status & Liability</h2>
              <p className="text-muted-foreground mb-3 premium-body">
                Offshore recruiters are <strong>independent contractors</strong> and are NOT employees of STAR Workforce Solutions or the job seeker. STAR Workforce Solutions is not liable for recruiter actions, inactions, responses, or lack of responses.
              </p>
              <p className="text-muted-foreground premium-body">
                All services are paid upfront and are NOT contingent on job placement outcomes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 premium-heading">AI Tools Disclaimer</h2>
              <p className="text-muted-foreground mb-3 premium-body">
                <strong>AI tools may make mistakes.</strong> We use AI tools to automate certain processes including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-3 premium-body">
                <li>Resume analysis and ATS optimization</li>
                <li>Resume distribution and matching</li>
                <li>Cover letter generation</li>
                <li>Interview preparation</li>
                <li>Data redaction for privacy</li>
              </ul>
              <p className="text-muted-foreground premium-body">
                <strong>Users must review and verify all AI-generated output before submission.</strong> AI tools may produce incorrect, incomplete, or misleading results. STAR Workforce Solutions is not liable for errors in AI-generated content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 premium-heading">Data Privacy & Sensitive Information</h2>
              <p className="text-muted-foreground mb-3 premium-body">
                Our system automatically redacts sensitive data including Social Security Numbers, dates of birth, and personal addresses before distribution. However, users are responsible for ensuring all personal information is accurate and legal to share.
              </p>
              <p className="text-muted-foreground premium-body">
                We comply with privacy regulations and data protection standards (GDPR, CCPA, PIPEDA, etc.).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 premium-heading">User Responsibility</h2>
              <p className="text-muted-foreground mb-3 premium-body">
                Users are responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground premium-body">
                <li>Accuracy and completeness of all resume and application information</li>
                <li>Compliance with all job application terms and conditions</li>
                <li>All salary negotiations and contract reviews</li>
                <li>Verifying all AI-generated output before use</li>
                <li>All job application and employment decisions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 premium-heading">Employment Practices & Compliance</h2>
              <p className="text-muted-foreground mb-3 premium-body">
                STAR Workforce Solutions operates in accordance with:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-3 premium-body">
                <li>29 CFR § 1625.2 (federal employment compliance)</li>
                <li>FTC regulations and guidelines</li>
                <li>Applicable state and provincial employment laws</li>
                <li>U.S. and Canadian job marketing regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 premium-heading">Work Visa Sponsorship Options</h2>
              <p className="text-muted-foreground mb-3 premium-body">
                STAR Workforce Solutions supports positions with the following visa sponsorship options:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground premium-body">
                <li>TN Visa</li>
                <li>H-1B Visa</li>
                <li>L-1 Visa</li>
                <li>STEM OPT</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 premium-heading">Resume Accuracy</h2>
              <p className="text-muted-foreground premium-body">
                Users are responsible for ensuring the accuracy and completeness of all information provided in resumes and applications. STAR Workforce Solutions reserves the right to remove content that is fraudulent or misrepresents qualifications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 premium-heading">Limitation of Liability</h2>
              <p className="text-muted-foreground mb-3 premium-body">
                <strong>STAR Workforce Solutions shall NOT be liable for:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-3 premium-body">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Recruiter responses or lack thereof</li>
                <li>Employment outcomes or rejections</li>
                <li>Salary negotiations or contract terms</li>
                <li>Errors in AI-generated content</li>
                <li>Data breaches or security incidents (beyond our reasonable control)</li>
              </ul>
              <p className="text-muted-foreground premium-body">
                All services are delivered on a <strong>best-effort basis only.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 premium-heading">Complaint Resolution & Regulatory Escalation</h2>
              <p className="text-muted-foreground mb-3 premium-body">
                We have established a comprehensive complaint resolution workflow:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-3 premium-body">
                <li>Initial review: 48 hours</li>
                <li>Internal resolution attempt: 30 days</li>
                <li>Escalation to management: 60 days</li>
                <li>Regulatory reporting: when applicable</li>
              </ul>
              <p className="text-muted-foreground premium-body">
                Contact: info@starworkforcesolutions.com for complaint inquiries
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 premium-heading">Changes to Services</h2>
              <p className="text-muted-foreground premium-body">
                STAR Workforce Solutions reserves the right to modify or discontinue services with 30 days' notice to users.
              </p>
            </section>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
