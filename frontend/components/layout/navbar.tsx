"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Settings, LogOut, ChevronDown, Menu, X } from "lucide-react";
import { RemitFlowLogo } from "@/components/brand/RemitFlowLogo";
import { useSession } from "@/hooks/useSession";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const { session, logout } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = useMemo(() => {
    const links = [
      { href: "/", label: "Home" },
      { href: "/send", label: "Send" },
      { href: "/anchors/marketplace", label: "Marketplace" },
      { href: "/recurring", label: "Recurring" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/history", label: "History" },
    ];

    if (session?.role === "anchor" || session?.role === "admin") {
      links.push({ href: "/anchor/dashboard", label: "Anchor" });
    }

    if (session?.role === "admin") {
      links.push({ href: "/admin", label: "Admin" });
      links.push({ href: "/admin/metrics", label: "Metrics" });
    }

    return links;
  }, [session?.role]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const formatAddress = (address: string | undefined) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDisconnect = async () => {
    await logout();
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="group" aria-label="RemitFlow Home">
          <RemitFlowLogo textClassName="tracking-tight" />
        </Link>

        {/* Navigation Links - Desktop */}
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                relative rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200
                ${
                  isActive(link.href) ?
                    "text-[var(--foreground)] bg-[var(--surface-elevated)] shadow-[var(--shadow-sm)]"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)]"
                }
              `}>
              {link.label}
              {isActive(link.href) && (
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-[var(--primary)] rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {session ?
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all shadow-[var(--shadow-sm)]"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                aria-label="User menu">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)]">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-[var(--foreground)]">
                    {formatAddress(session.walletAddress)}
                  </div>
                  <div className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-wider font-bold">
                    {session.role}
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-[var(--foreground-muted)] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xl)] animate-fade-in overflow-hidden">
                  <div className="p-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] shadow-sm">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black text-[var(--foreground)] truncate">
                          {formatAddress(session.walletAddress)}
                        </div>
                        <div className="text-[10px] text-[var(--foreground-subtle)] uppercase tracking-widest font-bold">
                          {session.role} Account
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors group">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-[var(--foreground)]">Profile</div>
                        <div className="text-[10px] text-[var(--foreground-subtle)]">Account details</div>
                      </div>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors group">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all">
                        <Settings className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-[var(--foreground)]">Settings</div>
                        <div className="text-[10px] text-[var(--foreground-subtle)]">Preferences</div>
                      </div>
                    </Link>
                  </div>

                  <div className="p-2 border-t border-[var(--border)]">
                    <button
                      onClick={handleDisconnect}
                      className="flex items-center gap-3 w-full px-3 py-3 rounded-xl hover:bg-[var(--error-bg)] transition-colors group">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--error-bg)] text-[var(--error)] group-hover:bg-[var(--error)] group-hover:text-white transition-all">
                        <LogOut className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-bold text-[var(--error)]">Disconnect</div>
                        <div className="text-[10px] text-[var(--error)]/60">Sign out safely</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          : <Link href="/login">
              <Button className="rounded-xl px-6 bg-[var(--primary)] hover:bg-[var(--primary-hover)] font-bold shadow-[var(--shadow-sm)]">
                Connect Wallet
              </Button>
            </Link>
          }

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--foreground)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] p-4 space-y-2 animate-slide-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`
                block w-full px-4 py-3 rounded-xl font-bold
                ${isActive(link.href) ? "bg-[var(--primary)] text-white" : "text-[var(--foreground-muted)] hover:bg-[var(--surface-elevated)]"}
              `}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
