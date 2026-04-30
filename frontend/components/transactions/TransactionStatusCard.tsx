import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/transaction";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface TransactionStatusCardProps {
  transaction: Transaction;
}

export function TransactionStatusCard({ transaction }: TransactionStatusCardProps) {
  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      color: "emerald",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      label: "Completed",
      badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
    },
    failed: {
      icon: AlertCircle,
      color: "red",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-400",
      label: "Failed",
      badge: "border-red-500/30 bg-red-500/10 text-red-400"
    },
    pending: {
      icon: Clock,
      color: "amber",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      label: "Pending",
      badge: "border-amber-500/30 bg-amber-500/10 text-amber-400"
    }
  };

  const config = statusConfig[transaction.status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <Card className="border-(--border) bg-(--surface) rounded-[2.5rem] overflow-hidden transition-all duration-500">
      <CardHeader className="p-10 border-b border-(--border)/50 bg-(--surface-elevated)/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-[1.25rem] shadow-lg transition-transform duration-500",
              config.bg,
              config.border,
              "border"
            )}>
              <Icon className={cn("h-8 w-8", config.text)} />
            </div>
            <div>
              <CardTitle className="text-3xl font-black text-(--foreground) tracking-tighter uppercase italic">
                Transaction Status
              </CardTitle>
              <CardDescription className="font-black text-(--foreground-subtle) uppercase text-[10px] tracking-[0.2em] mt-1">
                Settlement Details & History
              </CardDescription>
            </div>
          </div>
          <Badge className={cn("font-black text-xs uppercase tracking-widest", config.badge)}>
            {config.label.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-10 space-y-6">
        {/* Amount Summary */}
        <div className={cn(
          "p-8 rounded-4xl border-2 transition-all",
          config.bg,
          config.border
        )}>
          <div className="mb-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-2">Total Amount Sent</div>
            <div className="text-4xl font-black text-(--foreground) tracking-tighter uppercase italic">
              {formatCurrency(transaction.amount + transaction.fee, transaction.fromCurrency)}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm font-bold text-(--foreground-muted)">
            <span>Principal: {formatCurrency(transaction.amount, transaction.fromCurrency)}</span>
            <span>Fee: {formatCurrency(transaction.fee, transaction.fromCurrency)}</span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 rounded-3xl border-2 border-(--border) bg-(--surface-elevated)/30 transition-all duration-300 hover:border-(--primary)/30 group">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-(--foreground-subtle) mb-3">Route</div>
            <div className="text-2xl font-black text-(--foreground) tracking-tighter uppercase italic">
              {transaction.fromCurrency} <span className="text-(--foreground-muted)">→</span> {transaction.toCurrency}
            </div>
          </div>

          <div className="p-6 rounded-3xl border-2 border-(--border) bg-(--surface-elevated)/30 transition-all duration-300 hover:border-emerald-500/30 group">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-3">Fee</div>
            <div className="text-2xl font-black text-emerald-400 tracking-tighter uppercase italic">
              {formatCurrency(transaction.fee, transaction.fromCurrency)}
            </div>
          </div>

          <div className="p-6 rounded-3xl border-2 border-(--border) bg-(--surface-elevated)/30 transition-all duration-300 hover:border-blue-500/30 group">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-3">Created</div>
            <div className="text-sm font-bold text-blue-400 tracking-tight">
              {formatDateTime(transaction.createdAt)}
            </div>
          </div>

          {transaction.stellarTxHash ? (
            <div className="p-6 rounded-3xl border-2 border-(--border) bg-(--surface-elevated)/30 transition-all duration-300 hover:border-purple-500/30 group">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 mb-3">TX Hash</div>
              <code className="font-mono text-xs text-purple-400 font-bold break-all">
                {transaction.stellarTxHash.slice(0, 12)}...
              </code>
            </div>
          ) : null}
        </div>

        {/* Info Box */}
        <div className="p-6 rounded-3xl border-2 border-(--border) bg-(--surface-elevated)/30">
          <div className="text-sm font-bold text-(--foreground-muted) leading-relaxed">
            <span className="font-black text-(--foreground)">💡 Note:</span> Live anchor rates may change until settlement. Recipient estimates are provisional and subject to final corridor rates at settlement time.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
