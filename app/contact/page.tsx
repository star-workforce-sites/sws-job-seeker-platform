import { Suspense } from "react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { Mail, Phone, MessageSquare } from "lucide-react"
import ContactFormClient from "@/components/contact-form-client"
import ContactLoading from "./loading"

export const metadata = {
  title: "Contact Us | STAR Workforce Solutions",
  description: "Get in touch with our team. We respond within 24 hours.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/5 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground premium-heading">Get in Touch</h1>
          <p className="text-lg text-muted-foreground premium-body">
            Have questions? We're here to help. Contact our team and we'll respond within 24 hours to
            info@starworkforcesolutions.com
          </p>
        </div>
      </section>

      {/* Contact Details Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center bg-gray-50 dark:bg-gray-900 border-2 border-primary/20 rounded-lg">
            <h2 className="text-2xl font-bold text-foreground mb-6 premium-heading">Our Office</h2>
            <div className="space-y-4 text-foreground">
              <div>
                <p className="font-semibold text-lg premium-heading">Address</p>
                <p className="text-muted-foreground premium-body">5465 Legacy Drive Suite 650</p>
                <p className="text-muted-foreground premium-body">Plano, TX 75024</p>
              </div>
              <div>
                <p className="font-semibold text-lg premium-heading">Phone</p>
                <a href="tel:+14697133993" className="text-primary hover:text-primary/80 premium-body">
                  (469) 713-3993
                </a>
              </div>
              <div>
                <p className="font-semibold text-lg premium-heading">Email</p>
                <a
                  href="mailto:info@starworkforcesolutions.com"
                  className="text-primary hover:text-primary/80 premium-body"
                >
                  info@starworkforcesolutions.com
                </a>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="mt-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3345.8721766767234!2d-96.82266708436516!3d33.00798768088953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x864c3d5c7b5d5b5d%3A0x1b5d5b5d5b5d5b5d!2s5465%20Legacy%20Dr%20Suite%20650%2C%20Plano%2C%20TX%2075024!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: "8px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="STAR Workforce Solutions Office Location"
              />
            </div>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Contact Methods */}
            <Card className="p-6 border border-border">
              <Mail className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-foreground mb-2 premium-heading">Email</h3>
              <p className="text-muted-foreground text-sm premium-body">info@starworkforcesolutions.com</p>
            </Card>

            <Card className="p-6 border border-border">
              <Phone className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-foreground mb-2 premium-heading">Phone</h3>
              <p className="text-muted-foreground text-sm premium-body">(469) 713-3993</p>
            </Card>

            <Card className="p-6 border border-border">
              <MessageSquare className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold text-foreground mb-2 premium-heading">Live Chat</h3>
              <p className="text-muted-foreground text-sm premium-body">Available Mon-Fri 9AM-5PM EST</p>
            </Card>
          </div>

          <Suspense fallback={<ContactLoading />}>
            <ContactFormClient />
          </Suspense>
        </div>
      </section>

      <Footer />
    </div>
  )
}
