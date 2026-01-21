// Dashboard layout - SessionProvider is already in root layout
// No need for duplicate provider here

export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
