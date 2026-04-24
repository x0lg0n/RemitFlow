"use client";

import { useState } from "react";
import {
  Bell,
  Shield,
  Globe,
  Key,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  Check,
} from "lucide-react";
import { RequireSession } from "@/components/shared/RequireSession";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [language, setLanguage] = useState("en");

  return (
    <RequireSession>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Manage your account preferences and security
          </p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card className="hover-lift">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <Bell className="h-5 w-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Control your notification preferences
                  </CardDescription>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? "bg-blue-500" : "bg-white/10"
                  }`}>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/5 border border-[var(--border)]">
                <div>
                  <div className="text-sm font-medium text-white">
                    Transaction Alerts
                  </div>
                  <div className="text-xs text-[var(--foreground-subtle)]">
                    Get notified when transactions complete
                  </div>
                </div>
                {notifications ?
                  <Badge variant="success">Enabled</Badge>
                : <Badge>Disabled</Badge>}
              </div>
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/5 border border-[var(--border)]">
                <div>
                  <div className="text-sm font-medium text-white">
                    Rate Updates
                  </div>
                  <div className="text-xs text-[var(--foreground-subtle)]">
                    Notify when rates change significantly
                  </div>
                </div>
                <Badge variant="warning">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="hover-lift">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <Shield className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Protect your account with advanced security
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-amber-300 mb-1">
                      Security Notice
                    </div>
                    <div className="text-xs text-amber-200/80">
                      Never share your wallet private key. RemitFlow will never
                      ask for it.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/5 border border-[var(--border)]">
                <div>
                  <div className="text-sm font-medium text-white">
                    Two-Factor Authentication
                  </div>
                  <div className="text-xs text-[var(--foreground-subtle)]">
                    Add an extra layer of security
                  </div>
                </div>
                <button
                  onClick={() => setTwoFactor(!twoFactor)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    twoFactor ? "bg-emerald-500" : "bg-white/10"
                  }`}>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      twoFactor ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/5 border border-[var(--border)]">
                <div>
                  <div className="text-sm font-medium text-white">
                    Authentication Method
                  </div>
                  <div className="text-xs text-[var(--foreground-subtle)]">
                    Current auth protocol
                  </div>
                </div>
                <Badge variant="info">SEP-10</Badge>
              </div>

              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/5 border border-[var(--border)]">
                <div>
                  <div className="text-sm font-medium text-white">
                    Session Status
                  </div>
                  <div className="text-xs text-[var(--foreground-subtle)]">
                    Current login session
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="hover-lift">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30">
                  <Monitor className="h-5 w-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-white mb-3">Theme</div>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Monitor },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        setTheme(option.value as "dark" | "light" | "system")
                      }
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        theme === option.value ?
                          "border-blue-500 bg-blue-500/10"
                        : "border-[var(--border)] bg-white/5 hover:bg-white/10"
                      }`}>
                      <option.icon className="h-5 w-5 text-[var(--foreground-muted)]" />
                      <span className="text-sm font-medium text-white">
                        {option.label}
                      </span>
                      {theme === option.value && (
                        <Check className="h-4 w-4 ml-auto text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Language & Region */}
          <Card className="hover-lift">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/30">
                  <Globe className="h-5 w-5 text-sky-400" />
                </div>
                <div className="flex-1">
                  <CardTitle>Language & Region</CardTitle>
                  <CardDescription>
                    Set your preferred language and region
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium text-white mb-3">
                  Language
                </div>
                <div className="space-y-2">
                  {[
                    { value: "en", label: "English" },
                    { value: "es", label: "Español" },
                    { value: "fr", label: "Français" },
                  ].map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => setLanguage(lang.value)}
                      className={`flex items-center justify-between w-full p-4 rounded-xl border transition-all ${
                        language === lang.value ?
                          "border-blue-500 bg-blue-500/10"
                        : "border-[var(--border)] bg-white/5 hover:bg-white/10"
                      }`}>
                      <span className="text-sm font-medium text-white">
                        {lang.label}
                      </span>
                      {language === lang.value && (
                        <Check className="h-4 w-4 text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced */}
          <Card className="hover-lift">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/30">
                  <Key className="h-5 w-5 text-orange-400" />
                </div>
                <div className="flex-1">
                  <CardTitle>Advanced</CardTitle>
                  <CardDescription>
                    Advanced settings and data management
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="flex items-center justify-between w-full p-4 rounded-xl border border-[var(--border)] bg-white/5 hover:bg-white/10 transition-all">
                <div className="text-left">
                  <div className="text-sm font-medium text-white">
                    Export Data
                  </div>
                  <div className="text-xs text-[var(--foreground-subtle)]">
                    Download your transaction history
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--foreground-muted)]" />
              </button>
              <button className="flex items-center justify-between w-full p-4 rounded-xl border border-[var(--border)] bg-white/5 hover:bg-white/10 transition-all">
                <div className="text-left">
                  <div className="text-sm font-medium text-white">
                    Clear Cache
                  </div>
                  <div className="text-xs text-[var(--foreground-subtle)]">
                    Clear local storage and cache
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--foreground-muted)]" />
              </button>
              <button className="flex items-center justify-between w-full p-4 rounded-xl border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 transition-all">
                <div className="text-left">
                  <div className="text-sm font-medium text-rose-400">
                    Delete Account
                  </div>
                  <div className="text-xs text-rose-300/60">
                    Permanently delete all your data
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-rose-400" />
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireSession>
  );
}
