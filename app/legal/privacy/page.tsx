import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Privacy Policy - STAR Workforce Solutions',
  description: 'Privacy Policy for STAR Workforce Solutions',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: November 2024</p>
          </div>

          <Card className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-3">
                We collect information you provide directly to us, such as when you create an account, submit a resume, or contact us. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Name, email address, and phone number</li>
                <li>Resume and work history information</li>
                <li>Payment information</li>
                <li>Communication preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Privacy Protection Notice</h2>
              <p className="text-muted-foreground mb-3">
                STAR Workforce Solutions implements rigorous privacy protection measures throughout your user journey:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Automatic redaction of sensitive data (SSN, DOB, addresses)</li>
                <li>Encrypted data transmission and storage</li>
                <li>Limited access to personal information by authorized personnel only</li>
                <li>Regular security audits and compliance updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground">
                We use the information we collect to provide, maintain, and improve our services, process transactions, send transactional and promotional communications, and comply with legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Your Rights</h2>
              <p className="text-muted-foreground mb-3">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this privacy policy, please contact us at privacy@starworkforce.com
              </p>
            </section>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
