import Link from "next/link";
import { Github, Twitter, Mail, Heart } from "lucide-react";
import { RemitFlowLogo } from "@/components/brand/RemitFlowLogo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[var(--border)] bg-gradient-to-b from-transparent to-[var(--background-deep)]/60">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-6 md:col-span-2">
            <RemitFlowLogo />
            <p className="text-base text-[var(--foreground-muted)] max-w-md leading-relaxed font-medium">
              The smartest way to move money across borders. Powered by Stellar
              and optimized corridor routing, saving 3-5% on every transaction through
              intelligent anchor routing.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-all shadow-[var(--shadow-sm)]"
                aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-all shadow-[var(--shadow-sm)]"
                aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@remitflow.finance"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-all shadow-[var(--shadow-sm)]"
                aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/send"
                  className="text-sm font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors">
                  Send Money
                </Link>
              </li>
              <li>
                <Link
                  href="/corridors"
                  className="text-sm font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors">
                  View Corridors
                </Link>
              </li>
              <li>
                <Link
                  href="/history"
                  className="text-sm font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors">
                  Transaction History
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--foreground)]">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors">
                  Stellar Network
                </a>
              </li>
              <li>
                <a
                  href="https://developers.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors">
                  SEP-31 Protocol
                </a>
              </li>
              <li>
                <a
                  href="https://soroban.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors">
                  Soroban Contracts
                </a>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-sm font-bold text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors">
                  Account Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-16 border-t border-[var(--border)] pt-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <p className="text-sm font-bold text-[var(--foreground-subtle)]">
              © {currentYear} RemitFlow. Built with{" "}
              <Heart className="inline h-3 w-3 text-rose-400" /> on Stellar
            </p>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground-subtle)]">
                SEP-31 Payments
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground-subtle)]">
                Soroban Smart Contracts
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground-subtle)]">
                Real-time Anchor Routing
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
