import Link from "next/link";
import { Globe, Github, Twitter, Mail, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-gradient-to-b from-transparent to-slate-950/50">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">RemitFlow</span>
            </div>
            <p className="text-sm text-[var(--foreground-muted)] max-w-md leading-relaxed">
              The smartest way to send money across borders. Powered by Stellar
              blockchain, saving you 3-5% on every transaction through
              intelligent anchor routing.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[var(--foreground-muted)] hover:bg-white/10 hover:text-white transition-all"
                aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[var(--foreground-muted)] hover:bg-white/10 hover:text-white transition-all"
                aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
              <a
                href="mailto:contact@remitflow.io"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-[var(--foreground-muted)] hover:bg-white/10 hover:text-white transition-all"
                aria-label="Email">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/send"
                  className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors">
                  Send Money
                </Link>
              </li>
              <li>
                <Link
                  href="/corridors"
                  className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors">
                  View Corridors
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors">
                  Transaction History
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors">
                  Stellar Network
                </a>
              </li>
              <li>
                <a
                  href="https://developers.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors">
                  SEP-31 Protocol
                </a>
              </li>
              <li>
                <a
                  href="https://soroban.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors">
                  Soroban Contracts
                </a>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-[var(--border)] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-[var(--foreground-subtle)]">
              © {currentYear} RemitFlow. Built with{" "}
              <Heart className="inline h-3 w-3 text-rose-400" /> on Stellar
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-[var(--foreground-subtle)]">
                SEP-31 Cross-Border Payments
              </span>
              <span className="text-xs text-[var(--foreground-subtle)]">
                Soroban Smart Contracts
              </span>
              <span className="text-xs text-[var(--foreground-subtle)]">
                Real-time Anchor Routing
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
