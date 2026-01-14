"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login attempt:", formData)
    // API call would go here
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div
        className="text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom right, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.70) 50%, rgba(0, 0, 0, 0.30) 100%), url(/images/professional-deep-blue-and-gold-abstract-corporate-background-with-subtle-network-connections-920ce753.png)",
          backgroundSize: "auto, cover",
          backgroundPosition: "center, center",
          backgroundAttachment: "scroll, fixed",
        }}
      >
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold premium-heading mb-3">Welcome Back</h1>
          <p className="text-lg text-white/90 premium-body">Sign in to access your STAR Workforce Solutions account</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 premium-body">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2 premium-body">Password</label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full"
              />
            </div>

            <div className="text-right">
              <Link
                href="/contact?subject=Password Reset Request"
                className="text-sm text-primary hover:underline premium-body"
              >
                Forgot password?
              </Link>
            </div>

            <Button className="w-full bg-secondary hover:bg-secondary/90 text-primary py-6 h-auto text-base premium-heading font-semibold">
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground premium-body">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-secondary/10 premium-body bg-transparent"
            >
              Google
            </Button>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-secondary/10 premium-body bg-transparent"
            >
              LinkedIn
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6 premium-body">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
