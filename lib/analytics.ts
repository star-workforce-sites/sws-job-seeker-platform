declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

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
    window.gtag("config", "G-2KEG2N039D", {
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
