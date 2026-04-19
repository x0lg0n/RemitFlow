export function Footer() {
  return (
    <footer className="mt-10 border-t border-[var(--border)] py-6 text-center text-sm text-[var(--muted)]">
      <p>Built on Stellar · SEP-31 Cross-Border Payments · Soroban Smart Contracts</p>
      <p className="mt-1">© {new Date().getFullYear()} RemitFlow</p>
    </footer>
  );
}
