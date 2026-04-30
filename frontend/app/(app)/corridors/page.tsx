"use client";

import { useMemo, useState } from "react";
import { Globe, ArrowRight, Search, Filter, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRates } from "@/hooks/useRates";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert } from "@/components/ui/alert";

interface CorridorData {
  key: string;
  fromCurrency: string;
  toCurrency: string;
  destinationCountry: string;
  anchors: string[];
  minFee: number;
  maxFee: number;
  avgFee: number;
  bestAnchor: string;
}

export default function CorridorsPage() {
  const { rates, isLoading, error } = useRates();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");

  const corridors = useMemo(() => {
    const corridorMap = new Map<string, CorridorData>();

    for (const rate of rates) {
      const key = `${rate.fromCurrency}|${rate.toCurrency}|${rate.destinationCountry}`;

      if (!corridorMap.has(key)) {
        corridorMap.set(key, {
          key,
          fromCurrency: rate.fromCurrency,
          toCurrency: rate.toCurrency,
          destinationCountry: rate.destinationCountry,
          anchors: [],
          minFee: Infinity,
          maxFee: 0,
          avgFee: 0,
          bestAnchor: "",
        });
      }

      const corridor = corridorMap.get(key)!;
      corridor.anchors.push(rate.anchorName);

      if (rate.feePercent < corridor.minFee) {
        corridor.minFee = rate.feePercent;
        corridor.bestAnchor = rate.anchorName;
      }
      if (rate.feePercent > corridor.maxFee) {
        corridor.maxFee = rate.feePercent;
      }
    }

    // Calculate average fees
    for (const corridor of corridorMap.values()) {
      corridor.avgFee =
        corridor.anchors.length > 0 ?
          (corridor.minFee + corridor.maxFee) / 2
        : 0;
    }

    return Array.from(corridorMap.values());
  }, [rates]);

  // Get unique countries for filter
  const countries = useMemo(() => {
    const countrySet = new Set(corridors.map((c) => c.destinationCountry));
    return ["all", ...Array.from(countrySet).sort()];
  }, [corridors]);

  // Filter corridors
  const filteredCorridors = useMemo(() => {
    return corridors.filter((corridor) => {
      const matchesSearch =
        searchQuery === "" ||
        corridor.fromCurrency
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        corridor.toCurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        corridor.destinationCountry
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        corridor.anchors.some((a) =>
          a.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesCountry =
        selectedCountry === "all" ||
        corridor.destinationCountry === selectedCountry;

      return matchesSearch && matchesCountry;
    });
  }, [corridors, searchQuery, selectedCountry]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-4xl border-2 border-(--border) bg-(--surface) p-10 md:p-16 shadow-2xl">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-transparent to-emerald-500/10 pointer-events-none" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-500/20 border-2 border-blue-500/30">
              <Globe className="h-7 w-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter bg-linear-to-b from-(--foreground) to-(--foreground-muted) bg-clip-text text-transparent">
                Currency Corridors
              </h1>
              <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-(--foreground-muted) mt-2">
                Discover available routes for global remittances
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6 border-2 border-blue-500/30 bg-blue-500/10 rounded-3xl">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="h-5 w-5 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Routes</span>
          </div>
          <div className="text-4xl font-black text-blue-400 italic mb-1">
            {corridors.length}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-(--foreground-muted)">
            Total Active
          </div>
        </Card>
        <Card className="p-6 border-2 border-blue-500/30 bg-blue-500/10 rounded-3xl">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Assets</span>
          </div>
          <div className="text-4xl font-black text-blue-400 italic mb-1">
            {new Set(corridors.map((c) => c.fromCurrency)).size}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-(--foreground-muted)">
            Source Currencies
          </div>
        </Card>
        <Card className="p-6 border-2 border-emerald-500/30 bg-emerald-500/10 rounded-3xl">
          <div className="flex items-center gap-3 mb-3">
            <ArrowRight className="h-5 w-5 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Routes</span>
          </div>
          <div className="text-4xl font-black text-emerald-400 italic mb-1">
            {new Set(corridors.map((c) => c.destinationCountry)).size}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-(--foreground-muted)">
            Destinations
          </div>
        </Card>
        <Card className="p-6 border-2 border-purple-500/30 bg-purple-500/10 rounded-3xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-5 w-5 rounded bg-purple-500/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Fee</span>
          </div>
          <div className="text-4xl font-black text-purple-400 italic mb-1">
            {corridors.length > 0 ?
              Math.min(...corridors.map((c) => c.minFee)).toFixed(1)
            : "0"}%
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-(--foreground-muted)">
            Best Rate
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 border-(--border) bg-(--surface) rounded-4xl shadow-lg overflow-hidden">
        <CardHeader className="p-8 border-b border-(--border)/50 bg-(--surface-elevated)/30">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20">
              <Filter className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-(--foreground) tracking-tighter italic">Search & Filter</CardTitle>
              <CardDescription className="font-bold text-(--foreground-subtle) uppercase text-[10px] tracking-[0.2em] mt-1">Find your perfect corridor</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle)">Search</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-(--foreground-subtle) group-focus-within:text-blue-400 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search currencies, countries, anchors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-2xl border-2 focus:border-blue-500 transition-all bg-(--surface-elevated) font-bold"
                />
              </div>
            </div>
            <div>
              <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle)">Destination Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full h-12 rounded-2xl border-2 border-(--border) bg-(--surface-elevated) px-4 text-sm font-bold text-(--foreground) focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all">
                {countries.map((country) => (
                  <option
                    key={country}
                    value={country}
                    className="bg-(--surface) text-(--foreground)">
                    {country === "all" ? "All Countries" : country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="rounded-3xl border-2 border-red-500/30 bg-red-500/10">
          <div className="text-red-400 font-bold">{error}</div>
        </Alert>
      )}

      {/* Corridors Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 rounded-3xl border-2 border-(--border)">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      ) : filteredCorridors.length === 0 ? (
        <Alert className="rounded-3xl border-2 border-amber-500/30 bg-amber-500/10">
          <div className="text-amber-400 font-bold">
            No corridors match your search criteria. Try adjusting your filters.
          </div>
        </Alert>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCorridors.map((corridor) => (
            <Card
              key={corridor.key}
              className="border-2 border-(--border) bg-(--surface-elevated)/50 rounded-4xl group overflow-hidden hover:shadow-lg transition-all"
            >
              <CardHeader className="pb-6 pt-8 px-8 border-b border-(--border)/50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-400" />
                      <div className="text-xl font-black text-blue-400 italic uppercase">
                        {corridor.fromCurrency}
                      </div>
                      <ArrowRight className="h-5 w-5 text-(--foreground-muted)" />
                      <div className="text-xl font-black text-emerald-400 italic uppercase">
                        {corridor.toCurrency}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-(--foreground-muted) uppercase tracking-wider">
                      {corridor.destinationCountry} Protocol
                    </div>
                  </div>
                  <Badge className="font-black text-[9px] uppercase px-3 py-1 border-none bg-blue-500/20 text-blue-400">
                    {corridor.anchors.length} Anchor{corridor.anchors.length > 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                {/* Fee Range */}
                <div className="rounded-3xl bg-(--surface)/50 border-2 border-(--border) p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle)">
                      Fee Range
                    </span>
                    <Badge className="font-black text-[9px] uppercase px-3 py-1 border-none bg-emerald-500/20 text-emerald-400">
                      Best: {corridor.minFee.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 tracking-tight">
                    {corridor.minFee.toFixed(1)}{" "}
                    <span className="text-(--foreground-muted) text-base">–</span> {corridor.maxFee.toFixed(1)}%
                  </div>
                </div>

                {/* Best Anchor */}
                <div className="rounded-3xl bg-blue-500/10 border-2 border-blue-500/30 p-5">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">
                    Best Rate Provider
                  </div>
                  <div className="text-lg font-black text-blue-400 italic">
                    {corridor.bestAnchor}
                  </div>
                </div>

                {/* All Anchors */}
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-3">
                    Available Anchors
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {corridor.anchors.map((anchor, idx) => (
                      <Badge
                        key={idx}
                        className="font-black text-[9px] uppercase px-3 py-1.5 border-2 border-(--border) bg-(--surface-elevated) text-(--foreground)"
                      >
                        {anchor}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full px-8 h-12 bg-blue-500 text-white font-black uppercase italic tracking-widest rounded-2xl shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] hover:bg-blue-400 transition-all transform active:scale-95 flex items-center justify-center gap-3"
                  aria-label="Start a new transfer using this corridor"
                >
                  Send via {corridor.bestAnchor}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
