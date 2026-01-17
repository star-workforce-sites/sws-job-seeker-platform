import { SessionProviderWrapper } from '@/components/providers/session-provider-wrapper';

// Force dynamic rendering for this route (required for useSession)
export const dynamic = 'force-dynamic';

export default function HireRecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProviderWrapper>{children}</SessionProviderWrapper>;
}
