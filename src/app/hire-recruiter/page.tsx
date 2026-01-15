import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Check } from "lucide-react"

export default function HireRecruiterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <section className="abstract-gradient text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-4 premium-heading">Hire an Offshore Recruiter</h1>
          <p className="text-xl mb-8 premium-body">90-900 Job Applications on Autopilot. 90% Feedback Success Rate.</p>
          <Link href="#pricing">
            <Button className="bg-[#E8C547] hover:bg-[#D4AF37] text-[#0A1A2F] font-bold py-4 px-8 text-lg premium-heading">
              View Pricing Plans
            </Button>
          </Link>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 premium-heading">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 border-2">
              <h3 className="text-2xl font-bold mb-2 premium-heading">Basic</h3>
              <p className="text-4xl font-bold mb-2 premium-heading">$199/month</p>
              <p className="text-sm text-muted-foreground mb-6 premium-body">3-5 applications/day</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 premium-body"><Check className="w-5 h-5 text-primary" />Dashboard tracking</li>
                <li className="flex items-center gap-2 premium-body"><Check className="w-5 h-5 text-primary" />Email support</li>
                <li className="flex items-center gap-2 premium-body"><Check className="w-5 h-5 text-primary" />Weekly reports</li>
              </ul>
              <Link href="/contact?subject=Hire Recruiter - Basic Plan">
                <Button className="w-full premium-heading">Choose Basic</Button>
              </Link>
            </Card>
            
            <Card className="p-8 border-2 border-primary bg-primary/5">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm inline-block mb-4 premium-heading">Most Popular</div>
              <h3 className="text-2xl font-bold mb-2 premium-heading">Standard</h3>
              <p className="text-4xl font-bold mb-2 premium-heading">$399/month</p>
              <p className="text-sm text-muted-foreground mb-6 premium-body">10-15 applications/day</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 premium-body"><Check className="w-5 h-5 text-primary" />Advanced dashboard</li>
                <li className="flex items-center gap-2 premium-body"><Check className="w-5 h-5 text-primary" />Priority support</li>
                <li className="flex items-center gap-2 premium-body"><Check className="w-5 h-5 text-primary" />Daily updates</li>
              </ul>
              <Link href="/contact?subject=Hire Recruiter - Standard Plan">
                <Button className="w-full bg-primary hover:bg-primary/90 premium-heading">Choose Standard</Button>
              </Link>
            </Card>
            
            <Card className="p-8 border-2">
              <h3 className="text-2xl font-bold mb-2 premium-heading">Pro</h3>
              <p className="text-4xl font-bold mb-2 premium-heading">$599/month</p>
              <p className="text-sm text-muted-foreground mb-6 premium-body">20-30 applications/day</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 premium-body"><Check className="w-5 h-5 text-primary" />Full analytics</li>
                <li className="flex items-center gap-2 premium-body"><Check className="w-5 h-5 text-primary" />24/7 support</li>
                <li className="flex items-center gap-2 premium-body"><Check className="w-5 h-5 text-primary" />Dedicated recruiter</li>
              </ul>
              <Link href="/contact?subject=Hire Recruiter - Pro Plan">
                <Button className="w-full premium-heading">Choose Pro</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
