declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-2KEG2N039D"

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_ID, {
      page_path: url,
    })
  }
}

// Helper function to track button clicks
export const trackButtonClick = (buttonLabel: string) => {
  trackEvent("click", "Button", buttonLabel)
}

// Helper function to track link clicks
export const trackLinkClick = (linkLabel: string) => {
  trackEvent("click", "Link", linkLabel)
}

// Helper function to track form submissions
export const trackFormSubmit = (formName: string) => {
  trackEvent("submit", "Form", formName)
}

// ========== E-COMMERCE & CONVERSION TRACKING ==========

// Track when user clicks a "Buy" or "Pay" button (before Stripe redirect)
export const trackBeginCheckout = (product: string, price: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: "USD",
      value: price,
      items: [{ item_name: product, price: price, quantity: 1 }],
    })
  }
}

// Track successful purchase (after Stripe redirect back)
export const trackPurchase = (product: string, price: number, transactionId?: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "purchase", {
      currency: "USD",
      value: price,
      transaction_id: transactionId || `${product}_${Date.now()}`,
      items: [{ item_name: product, price: price, quantity: 1 }],
    })
  }
}

// Track subscription signup
export const trackSubscription = (plan: string, price: number) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "begin_checkout", {
      currency: "USD",
      value: price,
      items: [{ item_name: `Recruiter ${plan}`, price: price, quantity: 1 }],
    })
    trackEvent("subscribe_click", "Subscription", plan, price)
  }
}

// Track free tool usage (shows engagement before conversion)
export const trackFreeToolUse = (tool: string) => {
  trackEvent("free_tool_use", "Engagement", tool)
}

// Track upgrade prompt shown (paywall)
export const trackUpgradePrompt = (tool: string) => {
  trackEvent("upgrade_prompt_shown", "Conversion", tool)
}

// Track upgrade button click (from paywall)
export const trackUpgradeClick = (tool: string, price: number) => {
  trackEvent("upgrade_click", "Conversion", tool, price)
}

// Track file upload (resume/cover letter)
export const trackFileUpload = (tool: string) => {
  trackEvent("file_upload", "Engagement", tool)
}

// Track signup/login
export const trackAuth = (method: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "login", { method })
  }
}

// Track signup
export const trackSignup = (method: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "sign_up", { method })
  }
}
