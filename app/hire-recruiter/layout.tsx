import Navigation from '@/components/navigation';
import Footer from '@/components/footer';

// Force dynamic rendering for this route (required for useSession)
export const dynamic = 'force-dynamic';

export default function HireRecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
