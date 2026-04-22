"use client";

import { useMemo, useState } from "react";
import { Globe, ArrowRight, Search, Filter } from "lucide-react";
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
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 border border-blue-500/30">
            <Globe className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Currency Corridors
            </h1>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Available routes for cross-border payments
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 hover-lift">
          <div className="text-3xl font-bold text-white mb-1">
            {corridors.length}
          </div>
          <div className="text-sm text-[var(--foreground-subtle)]">
            Total Corridors
          </div>
        </Card>
        <Card className="p-6 hover-lift">
          <div className="text-3xl font-bold text-blue-400 mb-1">
            {new Set(corridors.map((c) => c.fromCurrency)).size}
          </div>
          <div className="text-sm text-[var(--foreground-subtle)]">
            Source Currencies
          </div>
        </Card>
        <Card className="p-6 hover-lift">
          <div className="text-3xl font-bold text-emerald-400 mb-1">
            {new Set(corridors.map((c) => c.destinationCountry)).size}
          </div>
          <div className="text-sm text-[var(--foreground-subtle)]">
            Destination Countries
          </div>
        </Card>
        <Card className="p-6 hover-lift">
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {corridors.length > 0 ?
              Math.min(...corridors.map((c) => c.minFee)).toFixed(1)
            : "0"}
            %
          </div>
          <div className="text-sm text-[var(--foreground-subtle)]">
            Lowest Fee
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="hover-lift">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[var(--foreground-muted)]" />
            <CardTitle>Filter Corridors</CardTitle>
          </div>
          <CardDescription>
            Search and filter available currency routes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]" />
                <Input
                  type="text"
                  placeholder="Search currencies, countries, anchors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                Destination Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-white/5 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                {countries.map((country) => (
                  <option
                    key={country}
                    value={country}
                    className="bg-slate-900">
                    {country === "all" ? "All Countries" : country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Corridors Grid */}
      {isLoading ?
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ))}
        </div>
      : filteredCorridors.length === 0 ?
        <Alert variant="info">
          No corridors match your search criteria. Try adjusting your filters.
        </Alert>
      : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCorridors.map((corridor) => (
            <Card key={corridor.key} className="hover-lift group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-blue-400">
                        {corridor.fromCurrency}
                      </span>
                      <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)]" />
                      <span className="text-emerald-400">
                        {corridor.toCurrency}
                      </span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {corridor.destinationCountry}
                    </CardDescription>
                  </div>
                  <Badge variant="success" className="text-xs">
                    {corridor.anchors.length} Anchor
                    {corridor.anchors.length > 1 ? "s" : ""}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fee Range */}
                <div className="rounded-xl bg-white/5 border border-[var(--border)] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)]">
                      Fee Range
                    </span>
                    <Badge variant="primary" className="text-xs">
                      Best: {corridor.minFee.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--foreground-muted)]">
                      {corridor.minFee.toFixed(1)}% -{" "}
                      {corridor.maxFee.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Best Anchor */}
                <div className="rounded-xl bg-white/5 border border-[var(--border)] p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)] mb-2">
                    Best Rate
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {corridor.bestAnchor}
                  </div>
                </div>

                {/* All Anchors */}
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--foreground-subtle)] mb-2">
                    Available Anchors
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {corridor.anchors.map((anchor, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {anchor}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full group/btn" size="sm">
                  Send via {corridor.bestAnchor}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}
