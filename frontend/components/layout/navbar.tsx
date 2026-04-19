"use client";

import Link from "next/link";
import { useMemo } from "react";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { WalletStatus } from "@/components/wallet/WalletStatus";
import { useSession } from "@/hooks/useSession";

export function Navbar() {
  const { session } = useSession();

  const navLinks = useMemo(() => {
    const links = [
      { href: "/", label: "Rates" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/send", label: "Send" },
      { href: "/history", label: "History" },
      { href: "/profile", label: "Profile" },
    ];

    if (session?.role === "anchor" || session?.role === "admin") {
      links.push({ href: "/anchor/dashboard", label: "Anchor" });
    }

    return links;
  }, [session?.role]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Remit<span className="text-[var(--primary)]">Flow</span>
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>{session ? <WalletStatus /> : <WalletConnect />}</div>
      </div>
    </header>
  );
}
