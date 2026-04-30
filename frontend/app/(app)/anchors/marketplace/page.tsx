"use client";

import { useMemo, useState } from "react";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Globe, 
  Plus, 
  Star, 
  ExternalLink, 
  Zap, 
  Shield, 
  MapPin, 
  Coins,
  CheckCircle2,
  Lock,
  MessageSquare
} from "lucide-react";
import { RequireSession } from "@/components/shared/RequireSession";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAnchorMarketplace } from "@/hooks/useAnchorMarketplace";

export default function AnchorMarketplacePage() {
  const { catalog, isLoading, error, activate, deactivate, submit } = useAnchorMarketplace();
  const [countryFilter, setCountryFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [anchorName, setAnchorName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [supportedCurrencies, setSupportedCurrencies] = useState("");
  const [notes, setNotes] = useState("");

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      const matchesCountry =
        countryFilter.length === 0 ||
        item.countryCode.toLowerCase().includes(countryFilter.toLowerCase());
      const matchesName =
        nameFilter.length === 0 ||
        item.displayName.toLowerCase().includes(nameFilter.toLowerCase());
      return matchesCountry && matchesName;
    });
  }, [catalog, countryFilter, nameFilter]);

  async function handleSubmitAnchorRequest() {
    if (!anchorName.trim()) {
      setSubmissionError("Anchor name is required");
      return;
    }

    try {
      setSubmissionError(null);
      setIsSubmitting(true);
      await submit({
        anchorName: anchorName.trim(),
        baseUrl: baseUrl.trim() || undefined,
        countryCode: countryCode.trim().toUpperCase() || undefined,
        supportedCurrencies:
          supportedCurrencies.trim().length > 0
            ? supportedCurrencies.split(",").map((value) => value.trim().toUpperCase()).filter(Boolean)
            : undefined,
        notes: notes.trim() || undefined,
      });

      setAnchorName("");
      setBaseUrl("");
      setCountryCode("");
      setSupportedCurrencies("");
      setNotes("");
    } catch (err) {
      setSubmissionError(
        err instanceof Error ? err.message : "Failed to submit anchor request",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <RequireSession>
      <div className="max-w-6xl mx-auto space-y-12 py-8 px-4 animate-fade-in">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-[2.5rem] border border-(--border) bg-gray-950 p-8 md:p-12 shadow-2xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl opacity-50" />
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl opacity-50" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <Badge className="rounded-full px-4 py-1.5 font-bold uppercase tracking-wider text-[10px] bg-blue-500 text-white border-none shadow-glow-blue">
                Active Marketplace
              </Badge>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-[0.9]">
                Anchor <span className="text-blue-500 italic">Network</span>
              </h1>
              <p className="max-w-md text-base font-medium text-gray-400 leading-relaxed">
                Connect your wallet to local on/off-ramp anchors. We route your capital through these nodes for maximum efficiency.
              </p>
            </div>
            
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="p-6 rounded-4xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="block text-2xl font-black text-white">40+</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Corridors</span>
              </div>
              <div className="p-6 rounded-4xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="block text-2xl font-black text-emerald-400">99.9%</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Uptime</span>
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <Alert variant="error" className="rounded-2xl border-red-500/20 bg-red-500/5 text-red-500 py-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3 font-bold">
              <Zap className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </Alert>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          <div className="space-y-12">
            {/* Filters */}
            <Card className="border-(--border) bg-white/80 backdrop-blur-xl shadow-(--shadow-md) rounded-[2.5rem] overflow-hidden">
              <CardHeader className="px-8 pt-8 pb-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Filter className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-black tracking-tight">Discovery Engine</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Search Nodes</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      value={nameFilter}
                      className="pl-12 h-14 font-bold rounded-2xl border-2 bg-(--surface-elevated) focus:border-blue-500 transition-all shadow-sm"
                      onChange={(event) => setNameFilter(event.target.value)}
                      placeholder="e.g. Anclap, Bitso..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Region Map</label>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      value={countryFilter}
                      className="pl-12 h-14 font-bold rounded-2xl border-2 bg-(--surface-elevated) focus:border-blue-500 transition-all shadow-sm"
                      onChange={(event) => setCountryFilter(event.target.value)}
                      placeholder="ISO code (CO, AR, BR...)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Catalog Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {isLoading ? (
                <div className="col-span-full py-32 flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-(--border)">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500 mb-6" />
                  <p className="font-black text-blue-500 uppercase tracking-widest text-xs">Syncing Node Registry...</p>
                </div>
              ) : null}

              {!isLoading && filteredCatalog.length === 0 ? (
                <div className="col-span-full py-24 text-center rounded-[3rem] bg-gray-50 border-2 border-dashed border-gray-200">
                  <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-6" />
                  <p className="text-xl font-black text-gray-400">No active anchors found.</p>
                  <p className="text-sm font-bold text-gray-400/60 uppercase tracking-widest mt-1">Try broadening your search parameters.</p>
                </div>
              ) : null}

              {!isLoading && filteredCatalog.map((anchor) => (
                <Card key={anchor.id} className="group overflow-hidden rounded-[2.5rem] border border-(--border) bg-white shadow-sm transition-all hover:border-blue-500/30 hover:shadow-(--shadow-lg)">
                  <CardHeader className="p-8 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                         <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 ${
                           anchor.isActiveForUser ? 'bg-blue-600 text-white shadow-glow-blue' : 'bg-gray-100 text-gray-400'
                         }`}>
                           <Zap className="h-7 w-7" />
                         </div>
                         <div>
                           <CardTitle className="text-2xl font-black text-(--foreground) tracking-tight line-clamp-1">{anchor.displayName}</CardTitle>
                           <div className="flex items-center gap-2 mt-1">
                             <div className={`h-2 w-2 rounded-full ${anchor.availabilityStatus === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                             <span className="text-[10px] font-black uppercase tracking-widest text-(--foreground-subtle) opacity-60">SEP-24 COMPLIANT</span>
                           </div>
                         </div>
                      </div>
                      <Badge
                        variant={
                          anchor.availabilityStatus === "available" ? "success" : 
                          anchor.availabilityStatus === "pending" ? "warning" : "secondary"
                        }
                        className="font-black text-[9px] uppercase px-3 py-1 border-none shadow-sm"
                      >
                        {anchor.availabilityStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 space-y-6">
                    <p className="text-sm font-medium text-(--foreground-muted) line-clamp-2 leading-relaxed min-h-10">
                      {anchor.description || "Decentralized liquidity provider bridging local assets to Stellar network."}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-(--surface-elevated) border border-(--border) space-y-1 transition-colors group-hover:bg-white group-hover:border-blue-100">
                        <p className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-wider">Regions</p>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                          <p className="text-xs font-black truncate">{anchor.supportedCountries.join(", ") || "N/A"}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-(--surface-elevated) border border-(--border) space-y-1 transition-colors group-hover:bg-white group-hover:border-blue-100">
                        <p className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-wider">Asset Pairs</p>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Coins className="h-3 w-3 text-blue-500 shrink-0" />
                          <p className="text-xs font-black truncate">{anchor.supportedCurrencies.join(", ") || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2">
                       <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} className={`h-3 w-3 ${i <= (anchor.rating || 4) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                          ))}
                          <span className="ml-2 text-xs font-black text-(--foreground-subtle)">{anchor.rating || "4.5"}/5</span>
                       </div>
                       <div className="flex items-center gap-3">
                         {anchor.websiteUrl && (
                           <a href={anchor.websiteUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">
                             <ExternalLink className="h-4 w-4" />
                           </a>
                         )}
                         {anchor.signupUrl && (
                           <a href={anchor.signupUrl} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 hover:bg-gray-100 transition-all shadow-sm">
                             <Plus className="h-4 w-4" />
                           </a>
                         )}
                       </div>
                    </div>

                    <div className="pt-2">
                      {anchor.isActiveForUser ? (
                        <Button
                          variant="secondary"
                          className="w-full h-12 rounded-2xl bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 font-bold transform active:scale-98 transition-all"
                          onClick={() => void deactivate(anchor.id)}
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Deactivate Connection
                        </Button>
                      ) : (
                        <Button
                          className="w-full h-14 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 font-black shadow-(--shadow-glow) shadow-blue-500/20 transform active:scale-98 transition-all disabled:opacity-50"
                          onClick={() => void activate(anchor.id)}
                          disabled={anchor.availabilityStatus !== "available"}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Activate {anchor.displayName}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <aside className="space-y-8">
            {/* Request Section */}
            <div className="sticky top-8 space-y-8">
              <Card className="border-(--border) bg-white/80 backdrop-blur-xl shadow-(--shadow-md) rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4 border-b border-(--border)/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 rotate-3">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight leading-none text-purple-600">New Anchor</CardTitle>
                      <CardDescription className="font-bold text-(--foreground-subtle) uppercase text-[9px] tracking-[0.2em] mt-2">Request Listing</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  {submissionError ? (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-shake">
                       <Zap className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                       <p className="text-xs font-bold text-red-600">{submissionError}</p>
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Provider Name</label>
                       <Input
                         value={anchorName}
                         className="h-12 font-bold rounded-xl border-2 bg-(--surface-elevated)"
                         onChange={(event) => setAnchorName(event.target.value)}
                         placeholder="e.g. Stellar Pay Asia"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Base Endpoint</label>
                       <Input
                         value={baseUrl}
                         className="h-12 font-bold rounded-xl border-2 bg-(--surface-elevated)"
                         onChange={(event) => setBaseUrl(event.target.value)}
                         placeholder="https://api.anchor.com"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Region</label>
                         <Input
                           value={countryCode}
                           className="h-12 font-black text-center uppercase rounded-xl border-2 bg-(--surface-elevated)"
                           onChange={(event) => setCountryCode(event.target.value)}
                           placeholder="CO"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Assets</label>
                         <Input
                           value={supportedCurrencies}
                           className="h-12 font-black text-center uppercase rounded-xl border-2 bg-(--surface-elevated)"
                           onChange={(event) => setSupportedCurrencies(event.target.value)}
                           placeholder="USDC, COP"
                         />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-(--foreground-muted) uppercase tracking-widest ml-1">Additional Notes</label>
                       <Input
                         value={notes}
                         className="h-12 font-bold rounded-xl border-2 bg-(--surface-elevated)"
                         onChange={(event) => setNotes(event.target.value)}
                         placeholder="Why add this provider?"
                       />
                    </div>
                  </div>

                  <Button
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 font-black shadow-lg shadow-purple-500/25 active:scale-95 transition-all"
                    onClick={() => void handleSubmitAnchorRequest()}
                  >
                    {isSubmitting ? "Syncing..." : "Submit Registry Request"}
                  </Button>
                </CardContent>
              </Card>

              <div className="p-8 rounded-[2.5rem] bg-linear-to-br from-gray-900 to-gray-800 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
                   <Shield className="h-20 w-20 text-blue-400" />
                </div>
                <h4 className="text-xl font-black tracking-tight mb-4">Neural Routing</h4>
                <p className="text-xs font-medium text-gray-400 leading-relaxed uppercase tracking-wider">
                  Every anchor connection adds a routing node. More nodes = lower fees and higher redundancy for the entire network.
                </p>
                <div className="mt-8 flex items-center gap-2">
                   <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Protocol Verified</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </RequireSession>
  );
}
