export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation skeleton */}
      <div className="h-16 bg-primary/5 border-b border-border"></div>

      {/* Hero skeleton */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/5 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-12 bg-muted rounded mb-4 w-48 mx-auto"></div>
          <div className="h-6 bg-muted rounded w-96 mx-auto"></div>
        </div>
      </section>

      {/* Contact section skeleton */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 border border-border rounded h-32 bg-muted/30"></div>
            ))}
          </div>
          <div className="p-8 border border-border rounded h-96 bg-muted/30"></div>
        </div>
      </section>

      {/* Footer skeleton */}
      <div className="h-32 bg-slate-900 border-t border-border"></div>
    </div>
  )
}
