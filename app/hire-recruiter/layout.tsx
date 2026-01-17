import { SessionProviderWrapper } from '@/components/providers/session-provider-wrapper';

// Force dynamic rendering for this route (required for useSession)
export const dynamic = 'force-dynamic';

export default function HireRecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProviderWrapper>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-[#0A1A2F] border-b border-[#E8C547]/20">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-2xl font-bold text-[#E8C547]">
              STAR Workforce Solutions
            </a>
            <nav className="flex items-center gap-6">
              <a href="/" className="text-white hover:text-[#E8C547] transition">
                Home
              </a>
              <a href="/services" className="text-white hover:text-[#E8C547] transition">
                Services
              </a>
              <a href="/auth/login" className="text-white hover:text-[#E8C547] transition">
                Sign In
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[#0A1A2F] border-t border-[#E8C547]/20 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
            <p>&copy; 2026 STAR Workforce Solutions. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </SessionProviderWrapper>
  );
}
