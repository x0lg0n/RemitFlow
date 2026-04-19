import { Badge } from "@/components/ui/badge";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/lib/currency";
import type { ComparedRate } from "@/lib/rates";

interface RateComparisonTableProps {
  rates: ComparedRate[];
  fromCurrency: string;
  toCurrency: string;
}

export function RateComparisonTable({ rates, fromCurrency, toCurrency }: RateComparisonTableProps) {
  const cheapestId = rates[0]?.anchorId;

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <Table>
        <thead>
          <TableRow className="bg-zinc-900/60 hover:bg-zinc-900/60">
            <TableHead>Anchor</TableHead>
            <TableHead>Fee</TableHead>
            <TableHead>FX Rate</TableHead>
            <TableHead>You Send</TableHead>
            <TableHead>Recipient Gets</TableHead>
          </TableRow>
        </thead>
        <tbody>
          {rates.map((rate) => {
            const isCheapest = rate.anchorId === cheapestId;

            return (
              <TableRow
                key={rate.anchorId}
                className={isCheapest ? "bg-emerald-950/20" : undefined}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{rate.anchorName}</span>
                    {isCheapest ? <Badge className="border-emerald-500/40 bg-emerald-950/30 text-emerald-200">Cheapest</Badge> : null}
                  </div>
                </TableCell>
                <TableCell>{rate.feePercent.toFixed(2)}%</TableCell>
                <TableCell>1 {fromCurrency} = {formatNumber(rate.fxRate)} {toCurrency}</TableCell>
                <TableCell>{formatCurrency(rate.totalCostMinor, fromCurrency)}</TableCell>
                <TableCell>{formatCurrency(rate.destinationAmountMinor, toCurrency)}</TableCell>
              </TableRow>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
