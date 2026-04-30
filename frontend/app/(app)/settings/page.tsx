"use client";

import { useState } from "react";
import {
  Bell,
  Shield,
  Globe,
  Zap,
} from "lucide-react";
import { RequireSession } from "@/components/shared/RequireSession";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [language, setLanguage] = useState("en");

  return (
    <RequireSession>
      <div className="max-w-6xl mx-auto space-y-12 py-8 px-4 animate-fade-in sm:px-0">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-(--border) bg-(--surface) p-10 md:p-16 shadow-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-(--surface-elevated) border border-(--border) text-[10px] font-black uppercase tracking-[0.2em] text-(--primary) italic shadow-sm">
              <Zap className="h-3 w-3" />
              Configuration Matrix
            </div>
            <h1 className="text-6xl sm:text-7xl font-black tracking-tighter leading-[0.85] italic uppercase bg-linear-to-b from-(--foreground) to-(--foreground-muted) bg-clip-text text-transparent">
              System<br/>Settings
            </h1>
            <p className="max-w-xl text-lg font-medium text-(--foreground-muted) mt-6 leading-relaxed">
              Fine-tune your cross-border engine, security parameters, and institutional communication nodes.
            </p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_350px]">
          <div className="space-y-10">
            {/* Notifications */}
            <Card className="border-(--border) bg-(--surface) backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-(--primary)/30 group">
              <CardHeader className="p-10 border-b border-(--border)/50 bg-(--surface-elevated)/30">
                <div className="flex items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-blue-500 shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] transform -rotate-3 transition-transform duration-500 group-hover:rotate-0">
                    <Bell className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-black text-(--foreground) tracking-tighter uppercase italic">Communications</CardTitle>
                    <CardDescription className="font-black text-(--foreground-subtle) uppercase text-[10px] tracking-[0.2em] mt-1 shrink-0">
                      Network interaction events
                    </CardDescription>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-9 w-16 items-center rounded-full transition-all duration-500 ${
                      notifications ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-(--border)"
                    }`}>
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition-transform duration-500 ${
                        notifications ? "translate-x-8" : "translate-x-1.5"
                      }`}
                    />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-6">
                <div className="group/item flex items-center justify-between p-6 rounded-3xl bg-(--surface-elevated)/50 border border-(--border) transition-all duration-300 hover:border-blue-500/30 hover:bg-(--surface-elevated) cursor-pointer" 
                     onClick={() => setAlerts(!alerts)}>
                  <div>
                    <div className="text-lg font-black text-(--foreground) tracking-tighter uppercase italic">
                      Push Notifications
                    </div>
                    <div className="text-sm font-bold text-(--foreground-muted) tracking-tight">
                      Instant updates on settlement status
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {alerts ?
                      <span className="bg-emerald-500/10 text-emerald-400 font-black text-[10px] uppercase px-4 py-1.5 rounded-full tracking-widest border border-emerald-500/20 shadow-sm">Active</span>
                    : <span className="bg-rose-500/10 text-rose-400 font-black text-[10px] uppercase px-4 py-1.5 rounded-full tracking-widest border border-rose-500/20 shadow-sm">Paused</span>}
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      alerts ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-pulse" : "bg-rose-400"
                    )} />
                  </div>
                </div>
                
                <div className="group/item flex items-center justify-between p-6 rounded-3xl bg-(--surface-elevated)/50 border border-(--border) transition-all duration-300 hover:border-blue-500/30 hover:bg-(--surface-elevated) cursor-pointer"
                     onClick={() => setLanguage(language === "en" ? "es" : "en")}>
                  <div>
                    <div className="text-lg font-black text-(--foreground) tracking-tighter uppercase italic">
                      Runtime Language
                    </div>
                    <div className="text-sm font-bold text-(--foreground-muted) tracking-tight">
                      Toggle system-wide localization
                    </div>
                  </div>
                  <div className="px-5 py-2 rounded-xl border-2 border-(--border) bg-(--surface) text-[10px] font-black text-(--foreground) uppercase tracking-widest group-hover/item:border-blue-500/30 transition-colors italic">
                    {language === "en" ? "English (US)" : "Español (MX)"}
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 rounded-3xl bg-(--surface-elevated)/30 border border-(--border) opacity-40">
                  <div>
                    <div className="text-lg font-black text-(--foreground) tracking-tighter uppercase italic">
                      Market Volatility
                    </div>
                    <div className="text-sm font-bold text-(--foreground-muted) tracking-tight">
                      Corridor rate shift alerts
                    </div>
                  </div>
                  <div className="bg-(--foreground)/5 text-(--foreground-muted) font-black text-[9px] uppercase px-3 py-1 rounded-full border border-(--border)">Integrated Soon</div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="border-(--border) bg-(--surface) shadow-2xl rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-emerald-500/30 group">
              <CardHeader className="p-10 border-b border-(--border)/50 bg-(--surface-elevated)/30">
                <div className="flex items-center gap-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-emerald-500 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] transform rotate-2 transition-transform duration-500 group-hover:rotate-0">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-black text-(--foreground) tracking-tighter uppercase italic">Security Vault</CardTitle>
                    <CardDescription className="font-black text-(--foreground-subtle) uppercase text-[10px] tracking-[0.2em] mt-1 shrink-0">
                      Cryptographic access control
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="rounded-4xl border-2 border-amber-500/20 bg-amber-500/5 p-8 relative overflow-hidden">
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Shield className="h-5 w-5 text-amber-500" />
                      </div>
                      <span className="text-sm font-black text-amber-500 uppercase tracking-widest italic">Non-Custodial Architecture</span>
                    </div>
                    <p className="text-sm font-bold text-(--foreground-muted) leading-relaxed italic">
                      Volara operates on a trustless model. Your private keys never transit our servers. All transactions are locally signed and validated via SEP-10 challenge protocols.
                    </p>
                  </div>
                  <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-amber-500/10 blur-3xl rounded-full" />
                </div>

                <div className="grid gap-6">
                  <div className="group flex items-center justify-between p-6 rounded-3xl bg-(--surface-elevated)/50 border border-(--border) transition-all duration-300 hover:border-emerald-500/30">
                    <div>
                      <div className="text-lg font-black text-(--foreground) tracking-tighter uppercase italic">Session Integrity</div>
                      <div className="text-sm font-bold text-(--foreground-muted) tracking-tight">Active authentication state</div>
                    </div>
                    <div className="px-5 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest italic shadow-sm">SEP-10 Verified</div>
                  </div>
                  <div className="group flex items-center justify-between p-6 rounded-3xl bg-(--surface-elevated)/50 border border-(--border) transition-all duration-300 hover:border-emerald-500/30">
                    <div>
                      <div className="text-lg font-black text-(--foreground) tracking-tighter uppercase italic">Institutional Access</div>
                      <div className="text-sm font-bold text-(--foreground-muted) tracking-tight">Runtime permission level</div>
                    </div>
                    <div className="px-5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest italic shadow-sm">Tier 1 Secured</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-10">
            <Card className="border-(--border) bg-(--surface-elevated)/30 rounded-[2.5rem] overflow-hidden shadow-xl backdrop-blur-md">
              <CardHeader className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm">
                    <Globe className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-black tracking-tighter uppercase italic">Localization</CardTitle>
                </div>
                <div className="space-y-3">
                  {[
                    { value: "en", label: "English (US)" },
                    { value: "es", label: "Español (MX)" },
                  ].map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => setLanguage(lang.value)}
                      className={cn(
                        "flex items-center justify-between w-full p-5 rounded-2xl border-2 transition-all duration-300 font-bold",
                        language === lang.value ?
                          "border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_20px_-10px_rgba(59,130,246,0.5)]"
                        : "border-(--border) bg-(--surface) text-(--foreground-muted) hover:border-(--foreground-subtle) hover:text-(--foreground)"
                      )}>
                      <span className="text-sm font-black uppercase tracking-tight italic">
                        {lang.label}
                      </span>
                      {language === lang.value && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]" />
                      )}
                    </button>
                  ))}
                </div>
              </CardHeader>
            </Card>

            <div className="group relative p-10 rounded-[2.5rem] bg-linear-to-br from-blue-600 to-emerald-600 text-white shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <Zap className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl mb-6 shadow-xl border border-white/20">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <h4 className="text-2xl font-black tracking-tighter italic uppercase leading-none mb-3">Engine Active</h4>
                <p className="text-sm font-bold text-white/80 leading-relaxed italic">
                  Runtime parameters are synchronized across the global settlement matrix for latency-free routing.
                </p>
                <div className="mt-8 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Live Node Status</span>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="w-full h-16 rounded-4xl border-2 border-(--destructive)/20 text-(--destructive) hover:bg-(--destructive)/10 hover:border-(--destructive)/50 font-black tracking-tighter uppercase italic transition-all duration-300">
              Destroy Session Data
            </Button>
          </aside>
        </div>
      </div>
    </RequireSession>
  );
}
