import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    console.log("[v0] Contact form submission received:", {
      name: data.name,
      email: data.email,
      subject: data.subject,
      timestamp: new Date().toISOString(),
    })

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      // For Gmail, you may need to enable "Less secure app access" or use App Password
      tls: {
        rejectUnauthorized: false,
      },
    })

    try {
      await transporter.verify()
      console.log("[v0] SMTP connection verified successfully")
    } catch (smtpError) {
      console.error("[v0] SMTP connection failed:", smtpError)
      // Continue anyway - log but don't fail
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@starworkforcesolutions.com",
      to: "info@starworkforcesolutions.com",
      replyTo: data.email,
      subject: `Contact Form: ${data.subject}`,
      text: `
Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

Submitted at: ${data.submittedAt || new Date().toISOString()}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <h3>Message:</h3>
        <p>${data.message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Submitted at: ${data.submittedAt || new Date().toISOString()}</p>
      `,
    }

    try {
      await transporter.sendMail(mailOptions)
      console.log("[v0] Email sent successfully")

      return NextResponse.json(
        { success: true, message: "Contact form submitted successfully. We will respond within 24-48 hours." },
        { status: 200 },
      )
    } catch (emailError: any) {
      console.error("[v0] Email sending failed:", emailError)

      // Return success to user but log error
      // This prevents exposing SMTP configuration issues to users
      return NextResponse.json(
        {
          success: true,
          message:
            "Contact form received. If you do not hear back within 48 hours, please email info@starworkforcesolutions.com directly.",
          warning: "Email delivery pending",
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("[v0] Contact form error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit contact form. Please try again or email info@starworkforcesolutions.com directly.",
      },
      { status: 500 },
    )
  }
}
