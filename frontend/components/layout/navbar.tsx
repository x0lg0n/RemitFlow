"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { WalletConnect } from "@/components/wallet/WalletConnect";
import { useSession } from "@/hooks/useSession";

// SVG Logo Component
function LogoIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="14" fill="url(#logo-gradient)" />
      <path
        d="M8 14L12 18L20 10"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="28" y2="28">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#10B981" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { session, logout } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = useMemo(() => {
    const links = [
      { href: "/", label: "Home" },
      { href: "/send", label: "Send" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/history", label: "History" },
    ];

    if (session?.role === "anchor" || session?.role === "admin") {
      links.push({ href: "/anchor/dashboard", label: "Anchor" });
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
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <LogoIcon />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            RemitFlow
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${
                  isActive(link.href) ?
                    "text-white bg-white/10"
                  : "text-[var(--foreground-muted)] hover:text-white hover:bg-white/5"
                }
              `}>
              {link.label}
              {isActive(link.href) && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* User Menu */}
        <div className="flex items-center gap-4" ref={dropdownRef}>
          {session ?
            <div className="relative">
              {/* User Button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-[var(--border)] hover:bg-white/10 hover:border-[var(--border-hover)] transition-all">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-white">
                    {formatAddress(session.walletAddress)}
                  </div>
                  <div className="text-[10px] text-[var(--foreground-subtle)] capitalize">
                    {session.role}
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-[var(--foreground-muted)] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xl animate-fade-in">
                  {/* User Info Header */}
                  <div className="p-4 border-b border-[var(--border)] bg-gradient-to-r from-blue-950/40 to-emerald-950/40">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">
                          {formatAddress(session.walletAddress)}
                        </div>
                        <div className="text-xs text-[var(--foreground-subtle)] capitalize">
                          {session.role} Account
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2 space-y-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                      <User className="h-4 w-4 text-[var(--foreground-muted)] group-hover:text-white" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          Profile
                        </div>
                        <div className="text-xs text-[var(--foreground-subtle)]">
                          View your account details
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                      <Settings className="h-4 w-4 text-[var(--foreground-muted)] group-hover:text-white" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">
                          Settings
                        </div>
                        <div className="text-xs text-[var(--foreground-subtle)]">
                          Manage preferences
                        </div>
                      </div>
                    </Link>
                  </div>

                  {/* Disconnect Button */}
                  <div className="p-2 border-t border-[var(--border)]">
                    <button
                      onClick={handleDisconnect}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-rose-500/10 transition-colors group">
                      <LogOut className="h-4 w-4 text-rose-400" />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-rose-400">
                          Disconnect Wallet
                        </div>
                        <div className="text-xs text-rose-300/60">
                          Sign out of your session
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          : <WalletConnect />}
        </div>
      </div>
    </header>
  );
}
