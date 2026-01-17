// Force dynamic rendering for this route
// This MUST be in a server component (layout), not in client component (page)
export const dynamic = 'force-dynamic';

export default function HireRecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
