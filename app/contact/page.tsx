import { Suspense } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import ContactFormClient from "@/components/contact-form-client"

export const metadata = {
  title: "Contact Us | STAR Workforce Solutions",
  description: "Get in touch with our team. We respond within 24 hours.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0A1A2F] to-[#132A47] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-white">Get in Touch</h1>
          <p className="text-lg text-gray-300">
            Have questions? We're here to help. Our team responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Form Section - NOW ON TOP */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 border-2 border-[#E8C547]/20">
            <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
            <Suspense fallback={<div className="animate-pulse h-96 bg-gray-100 rounded-lg"></div>}>
              <ContactFormClient />
            </Suspense>
          </Card>
        </div>
      </section>

      {/* Contact Details Section - Compact */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-4 text-center border border-border">
              <Mail className="w-6 h-6 text-[#E8C547] mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Email</h3>
              <a href="mailto:info@starworkforcesolutions.com" className="text-xs text-primary hover:underline">
                info@starworkforcesolutions.com
              </a>
            </Card>

            <Card className="p-4 text-center border border-border">
              <Phone className="w-6 h-6 text-[#E8C547] mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Phone</h3>
              <a href="tel:+14697133993" className="text-xs text-primary hover:underline">
                (469) 713-3993
              </a>
            </Card>

            <Card className="p-4 text-center border border-border">
              <MapPin className="w-6 h-6 text-[#E8C547] mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Address</h3>
              <p className="text-xs text-muted-foreground">
                5465 Legacy Drive Suite 650<br />Plano, TX 75024
              </p>
            </Card>

            <Card className="p-4 text-center border border-border">
              <Clock className="w-6 h-6 text-[#E8C547] mx-auto mb-2" />
              <h3 className="font-semibold text-sm mb-1">Hours</h3>
              <p className="text-xs text-muted-foreground">
                Mon-Fri 9AM-5PM CST
              </p>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
