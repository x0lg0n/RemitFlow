"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Wallet,
  Settings,
  ShieldCheck,
  Zap,
  TrendingUp,
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
import { useSession } from "@/hooks/useSession";
import { useTransactions } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2.5 rounded-xl bg-(--surface-elevated) hover:bg-(--surface) transition-all border border-(--border) group"
      title="Copy to clipboard">
      {copied ?
        <Check className="h-4 w-4 text-emerald-400" />
      : <Copy className="h-4 w-4 text-(--foreground-muted) group-hover:text-(--foreground)" />}
    </button>
  );
}

export default function ProfilePage() {
  const { session } = useSession();
  const { transactions } = useTransactions(1, 100);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "Identity",
    bio: "Stellar Network Member",
    currency: "USD / XLM",
  });
  const [tempData, setTempData] = useState({ ...profileData });

  const stats = {
    count: transactions.length,
    volume: transactions.reduce((acc, tx) => acc + (tx.status === "completed" ? Number(tx.amount) : 0), 0),
    feesSaved: transactions.reduce((acc, tx) => acc + (tx.status === "completed" ? (Number(tx.amount) * 0.03) : 0), 0),
    memberSince: transactions.length > 0 
      ? new Date(Math.min(...transactions.map(t => new Date(t.createdAt).getTime()))).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
      : "New Member",
  };

  const handleSave = () => {
    setProfileData({ ...tempData });
    setIsEditing(false);
  };

  const formatAddress = (address: string | undefined) => {
    if (!address) return "N/A";
    return `${address.slice(0, 8)} • ${address.slice(-8)}`;
  };

  const walletAddress = session?.walletAddress;
  const isAdmin = session?.role === "admin";

  return (
    <RequireSession>
      <div className="max-w-6xl mx-auto space-y-12 py-8 px-4 animate-fade-in sm:px-0">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-(--border) bg-(--surface) p-10 md:p-16 shadow-2xl">
          <div className="pointer-events-none absolute -right-48 -top-48 h-125 w-125 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
          <div className="pointer-events-none absolute -left-48 -bottom-48 h-125 w-125 rounded-full bg-emerald-500/5 blur-3xl" />
          
          <div className="relative grid md:grid-cols-[1fr_auto] gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-(--surface-elevated) border border-(--border) text-[10px] font-black uppercase tracking-[0.2em] text-(--primary) italic shadow-sm">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Identity Node
                </div>
                {isAdmin && (
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 italic shadow-sm">
                    Protocol Admin
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h1 className="text-6xl sm:text-7xl font-black tracking-tighter leading-[0.85] italic uppercase bg-linear-to-b from-(--foreground) to-(--foreground-muted) bg-clip-text text-transparent">
                  {profileData.name}
                </h1>
                <p className="text-xl font-bold text-(--foreground-muted) italic max-w-lg leading-relaxed">
                  {profileData.bio}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-(--surface-elevated)/50 border border-(--border) backdrop-blur-md">
                   <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                     <Wallet className="h-5 w-5 text-blue-400" />
                   </div>
                   <div className="space-y-0.5">
                     <div className="text-[9px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle)">Public Address</div>
                     <div className="flex items-center gap-3">
                       <span className="font-mono text-sm font-bold text-(--foreground)">{formatAddress(walletAddress)}</span>
                       <CopyButton text={walletAddress || ""} />
                     </div>
                   </div>
                </div>
                
                <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-(--surface-elevated)/50 border border-(--border) backdrop-blur-md">
                   <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                     <TrendingUp className="h-5 w-5 text-emerald-400" />
                   </div>
                   <div className="space-y-0.5">
                     <div className="text-[9px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle)">Operational Tier</div>
                     <div className="text-sm font-black text-(--foreground) uppercase italic tracking-tighter">Level 1 Protocol</div>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-60">
              <Link href="/settings" className="flex h-14 items-center justify-between rounded-2xl bg-blue-500 px-6 font-black uppercase italic tracking-widest text-white shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] transition-all hover:bg-blue-400">
                <span>Configuration</span>
                <Settings className="h-4 w-4" />
              </Link>
              {isAdmin && (
                <Link href="/anchor/dashboard" className="flex h-14 items-center justify-between rounded-2xl border-2 border-(--border) bg-(--surface-elevated) px-6 font-black uppercase italic tracking-widest transition-colors hover:bg-(--surface-elevated)">
                  <span>Admin Matrix</span>
                  <TrendingUp className="h-4 w-4" />
                </Link>
              )}
              <Button variant="ghost" className="h-14 rounded-2xl font-black uppercase italic tracking-widest text-rose-400 hover:bg-rose-500/10 hover:text-rose-300">
                <span className="flex w-full items-center justify-between">
                  <span>Terminate session</span>
                  <Zap className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Network Lifetime", value: stats.memberSince, sub: "Identity age", icon: ShieldCheck, color: "blue" },
            { label: "Settlements", value: stats.count, sub: "Total operations", icon: Zap, color: "emerald" },
            { label: "Protocol Volume", value: `$${stats.volume.toLocaleString()}`, sub: "Processed capital", icon: TrendingUp, color: "purple" },
            { label: "Retained Capital", value: `$${stats.feesSaved.toFixed(2)}`, sub: "Network savings", icon: Check, color: "amber" },
          ].map((stat, i) => (
            <Card key={i} className="border-(--border) bg-(--surface) rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:scale-[1.05] group">
              <CardContent className="p-8 space-y-4">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm transition-transform duration-500 group-hover:rotate-6",
                  stat.color === "blue" && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                  stat.color === "emerald" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                  stat.color === "purple" && "bg-purple-500/10 border-purple-500/20 text-purple-400",
                  stat.color === "amber" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                )}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle)">{stat.label}</div>
                  <div className="text-4xl font-black tracking-tighter text-(--foreground) italic">{stat.value}</div>
                  <div className="text-[9px] font-bold text-(--foreground-muted) uppercase italic">{stat.sub}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-10">
          <div className="space-y-10">
             <Card className="border-(--border) bg-(--surface) backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden group">
               <CardHeader className="p-10 border-b border-(--border)/50 bg-(--surface-elevated)/30">
                 <CardTitle className="text-3xl font-black tracking-tighter uppercase italic">Institutional Identity</CardTitle>
                 <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle)">Entity metadata synchronization</CardDescription>
               </CardHeader>
               <CardContent className="p-10">
                 {isEditing ? (
                    <div className="space-y-8 max-w-2xl">
                       <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-(--foreground-subtle) px-1">Network name</label>
                         <input 
                           value={tempData.name}
                           onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                           className="w-full h-16 bg-(--surface-elevated) border-2 border-(--border) rounded-2xl px-6 text-xl font-black tracking-tighter text-(--foreground) focus:border-blue-500 focus:outline-none transition-colors italic"
                         />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-(--foreground-subtle) px-1">Manifest Bio</label>
                         <textarea 
                           value={tempData.bio}
                           onChange={(e) => setTempData({ ...tempData, bio: e.target.value })}
                           className="w-full h-32 bg-(--surface-elevated) border-2 border-(--border) rounded-2xl p-6 text-lg font-bold tracking-tight text-(--foreground) focus:border-blue-500 focus:outline-none transition-colors italic resize-none"
                         />
                       </div>
                       <div className="flex gap-4">
                         <Button onClick={handleSave} className="h-14 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-400 font-black uppercase italic tracking-widest text-white">Save Changes</Button>
                         <Button variant="ghost" onClick={() => setIsEditing(false)} className="h-14 px-10 rounded-2xl border border-(--border) font-black uppercase italic tracking-widest hover:bg-(--surface-elevated)">Cancel</Button>
                       </div>
                    </div>
                 ) : (
                    <div className="space-y-8">
                       <div className="grid sm:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-(--foreground-subtle)">Current Entity Name</div>
                            <div className="text-2xl font-black tracking-tighter uppercase italic text-(--foreground)">{profileData.name}</div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-(--foreground-subtle)">Settlement Liquidity</div>
                            <div className="text-2xl font-black tracking-tighter uppercase italic text-(--foreground)">{profileData.currency}</div>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-(--foreground-subtle)">Node Manifest Description</div>
                          <div className="text-lg font-bold italic leading-relaxed text-(--foreground-muted)">{profileData.bio}</div>
                       </div>
                       <Button onClick={() => setIsEditing(true)} className="h-14 px-10 rounded-2xl bg-(--surface-elevated) border-2 border-blue-500/30 text-blue-400 font-black uppercase italic tracking-widest hover:bg-blue-500/10 transition-all">
                         Revise Identity Data
                       </Button>
                    </div>
                 )}
               </CardContent>
             </Card>
          </div>

          <aside className="space-y-10">
             <Card className="border-(--border) bg-(--surface-elevated)/30 rounded-[2.5rem] overflow-hidden shadow-xl backdrop-blur-md">
               <CardHeader className="p-8 border-b border-(--border)/50">
                 <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Security Protocols</CardTitle>
               </CardHeader>
               <CardContent className="p-8 space-y-6">
                 {[
                   { label: "Network Status", value: "Verified", icon: ShieldCheck, color: "emerald" },
                   { label: "Cipher Tier", value: "Level 1", icon: Zap, color: "blue" },
                 ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-(--surface) border border-(--border)">
                       <div className="flex items-center gap-3">
                         <div className={cn(
                           "h-8 w-8 rounded-lg flex items-center justify-center",
                           item.color === "emerald" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                         )}>
                           <item.icon className="h-4 w-4" />
                         </div>
                         <div className="text-[10px] font-black uppercase tracking-widest italic">{item.label}</div>
                       </div>
                       <div className={cn(
                         "text-[10px] font-black uppercase px-3 py-1 rounded-full",
                         item.color === "emerald" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                       )}>{item.value}</div>
                    </div>
                 ))}
               </CardContent>
             </Card>

             <div className="group relative p-10 rounded-[2.5rem] bg-linear-to-br from-blue-600 to-emerald-600 text-white shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] cursor-pointer" onClick={() => window.location.href = '/history'}>
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                  <TrendingUp className="h-32 w-32" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-black tracking-tighter italic uppercase leading-tight">Sync Ledger</h4>
                  <p className="text-xs font-bold text-white/80 leading-relaxed italic">
                    Access the complete cryptographic record of your cross-border operations.
                  </p>
                  <div className="flex items-center gap-2 pt-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Open Matrix</span>
                    <TrendingUp className="h-3 w-3 animate-pulse" />
                  </div>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </RequireSession>
  );
}
