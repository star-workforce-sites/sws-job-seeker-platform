import { SessionProviderWrapper } from '@/components/providers/session-provider-wrapper';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProviderWrapper>{children}</SessionProviderWrapper>;
}
