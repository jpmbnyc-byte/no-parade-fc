export function OrderCancel() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--gold)]">Checkout cancelled</p>
      <h1 className="mt-4 text-3xl" style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        Your kit is still saved.
      </h1>
      <p className="mt-4 text-sm text-[var(--muted)]">Nothing was charged. Head back in and pick up where you left off.</p>
      <a href="/" className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-[var(--gold)]">
        ← Back to Build Your Crest
      </a>
    </main>
  );
}
