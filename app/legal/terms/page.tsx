import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'

export const metadata = {
  title: 'Terms of Service - STAR Workforce Solutions',
  description: 'Terms of Service for STAR Workforce Solutions',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: November 2024</p>
          </div>

          <Card className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using STAR Workforce Solutions, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Use License</h2>
              <p className="text-muted-foreground mb-3">
                Permission is granted to temporarily download one copy of the materials (information or software) on STAR Workforce Solutions for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile or reverse engineer any software contained on the website</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
                <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Disclaimer</h2>
              <p className="text-muted-foreground">
                The materials on STAR Workforce Solutions are provided on an 'as is' basis. STAR Workforce Solutions makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Limitations</h2>
              <p className="text-muted-foreground">
                In no event shall STAR Workforce Solutions or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on STAR Workforce Solutions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Accuracy of Materials</h2>
              <p className="text-muted-foreground">
                The materials appearing on STAR Workforce Solutions could include technical, typographical, or photographic errors. STAR Workforce Solutions does not warrant that any of the materials on the website are accurate, complete, or current.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Links</h2>
              <p className="text-muted-foreground">
                STAR Workforce Solutions has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by STAR Workforce Solutions of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Modifications</h2>
              <p className="text-muted-foreground">
                STAR Workforce Solutions may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Governing Law</h2>
              <p className="text-muted-foreground">
                These terms and conditions are governed by and construed in accordance with the laws of the United States of America, and you irrevocably submit to the exclusive jurisdiction of the courts located in that location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at support@starworkforce.com
              </p>
            </section>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
