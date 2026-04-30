"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar as CalendarIcon,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { RequireSession } from "@/components/shared/RequireSession";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableCell, 
  TableHead, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const { transactions, isLoading } = useTransactions(page, 50);

  const filteredTransactions = (transactions || []).filter(tx => {
    const txDate = new Date(tx.createdAt);
    
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.fromCurrency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.toCurrency.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    
    let matchesDate = true;
    if (date?.from) {
      const start = startOfDay(date.from);
      const end = date.to ? endOfDay(date.to) : endOfDay(date.from);
      matchesDate = isWithinInterval(txDate, { start, end });
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleExportCSV = () => {
    const headers = ["ID", "From", "To", "Amount", "Fee", "Status", "Date"];
    const csvData = filteredTransactions.map(tx => [
      tx.id,
      tx.fromCurrency,
      tx.toCurrency,
      tx.amount,
      tx.fee,
      tx.status,
      new Date(tx.createdAt).toISOString()
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `remitflow_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-amber-500 animate-pulse" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "failed": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    }
  };

  return (
    <RequireSession>
      <div className="max-w-7xl mx-auto space-y-10 py-8 px-4 animate-fade-in">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-indigo-500/10 text-indigo-600 border-none font-black text-[10px] uppercase px-4 py-1.5 tracking-widest">
                Ledger Data
              </Badge>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-(--foreground-subtle) tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Real-time Sync
              </div>
            </div>
            <h1 className="text-5xl font-black text-(--foreground) tracking-tight leading-[0.9] uppercase italic">
              History
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <Button 
               variant="outline" 
               onClick={handleExportCSV}
               className="group rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-6 border-(--border) hover:bg-black hover:text-white hover:border-black transition-all duration-300"
             >
                <Download className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                Export CSV
             </Button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-(--foreground-subtle)" />
            <Input 
              placeholder="SEARCH BY TRANSACTION ID OR CURRENCY..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-(--border) bg-white shadow-sm font-bold uppercase text-[10px] tracking-widest focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-black w-full"
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "h-14 rounded-2xl border-(--border) bg-white font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white hover:border-black transition-all duration-300 group w-full",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-blue-500 group-hover:text-blue-400" />
                <span className="truncate">
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    "Pick a date range"
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-4xl overflow-hidden border-(--border) bg-white shadow-2xl" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                  className="font-bold uppercase text-[10px] tracking-widest bg-white text-black"
                />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-14 rounded-2xl border-(--border) bg-white font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white hover:border-black transition-all duration-300 group relative w-full">
                <Filter className="mr-2 h-4 w-4 text-emerald-500 group-hover:text-emerald-400" />
                {statusFilter === "all" ? "All Filters" : `Status: ${statusFilter}`}
                <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-(--border) p-2 min-w-40">
              <DropdownMenuItem onClick={() => setStatusFilter("all")} className="font-bold uppercase text-[10px] tracking-widest p-3 rounded-lg cursor-pointer">All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")} className="font-bold uppercase text-[10px] tracking-widest p-3 rounded-lg cursor-pointer text-emerald-600">Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")} className="font-bold uppercase text-[10px] tracking-widest p-3 rounded-lg cursor-pointer text-amber-600">Pending</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("failed")} className="font-bold uppercase text-[10px] tracking-widest p-3 rounded-lg cursor-pointer text-red-600">Failed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card className="border-(--border) bg-white shadow-(--shadow-md) rounded-4xl overflow-hidden border-none text-black">
          <CardHeader className="p-8 border-b border-(--border)/50 bg-gray-50/50">
             <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-(--foreground) tracking-tighter uppercase">Recent Records</CardTitle>
                  <CardDescription className="font-bold text-(--foreground-subtle) uppercase text-[10px] tracking-widest mt-1">
                    Showing {filteredTransactions.length} settled artifacts
                  </CardDescription>
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-20 flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black text-(--foreground-subtle) uppercase tracking-widest" >Accessing Ledger...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-32">
                 <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-(--surface-elevated) mb-6">
                    <Search className="h-10 w-10 text-(--foreground-subtle)" />
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-tight">No records found</h3>
                 <p className="text-[10px] font-bold text-(--foreground-subtle) uppercase mt-2 tracking-widest">Adjust your search or filters to see more</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <thead className="bg-gray-50/80">
                    <TableRow className="border-b border-(--border) hover:bg-transparent">
                      <TableHead className="h-14 px-8 font-black text-[10px] uppercase tracking-widest text-(--foreground-subtle)">Asset / Direction</TableHead>
                      <TableHead className="h-14 px-8 font-black text-[10px] uppercase tracking-widest text-(--foreground-subtle)">Transaction ID</TableHead>
                      <TableHead className="h-14 px-8 font-black text-[10px] uppercase tracking-widest text-(--foreground-subtle)">Timestamp</TableHead>
                      <TableHead className="h-14 px-8 font-black text-[10px] uppercase tracking-widest text-(--foreground-subtle)">Amount & Fee</TableHead>
                      <TableHead className="h-14 px-8 font-black text-[10px] uppercase tracking-widest text-(--foreground-subtle)">Status</TableHead>
                      <TableHead className="h-14 px-8 text-right"></TableHead>
                    </TableRow>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id} className="group border-b border-(--border)/30 hover:bg-gray-50/50 transition-all duration-300">
                        <TableCell className="py-5 px-8">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                               <span className="font-black text-sm uppercase text-black">{tx.fromCurrency}</span>
                               <ArrowRight className="h-3 w-3 text-(--foreground-subtle)" />
                               <span className="font-black text-sm uppercase text-black">{tx.toCurrency}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-8 font-mono text-[10px] font-bold text-(--foreground-subtle) uppercase">
                          {tx.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="px-8">
                           <div className="text-[10px] font-black uppercase text-black">
                              {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                           </div>
                        </TableCell>
                        <TableCell className="px-8 text-black">
                           <span className="font-black text-base tracking-tight">
                              {formatCurrency(Number(tx.amount), tx.fromCurrency)}
                           </span>
                        </TableCell>
                        <TableCell className="px-8">
                           <Badge variant="outline" className={`rounded-xl border h-7 px-3 flex items-center gap-1.5 font-black text-[8px] uppercase tracking-tighter ${getStatusStyle(tx.status)}`}>
                              {getStatusIcon(tx.status)}
                              {tx.status}
                           </Badge>
                        </TableCell>
                        <TableCell className="px-8 text-right">
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </CardContent>
          <div className="p-8 bg-gray-50/50 border-t border-(--border)/50 flex items-center justify-between">
             <div className="text-[10px] font-black text-(--foreground-subtle) uppercase tracking-[0.2em]">
                Page {page} of {Math.ceil(filteredTransactions.length / 50) || 1}
             </div>
             <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="rounded-xl border-(--border) h-10 px-4 font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-50"
                >
                   <ChevronLeft className="mr-1 h-3 w-3" /> Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={filteredTransactions.length < 50}
                  onClick={() => setPage(p => p + 1)}
                  className="rounded-xl border-(--border) h-10 px-4 font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white disabled:opacity-50"
                >
                   Next <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
             </div>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-3 pt-6">
            <div className="p-8 rounded-4xl bg-(--surface-elevated) border border-(--border) flex flex-col justify-between group hover:border-black transition-all">
                <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                   <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <h4 className="font-black text-sm uppercase tracking-tight mb-1">Average Latency</h4>
                <p className="text-[10px] font-bold text-(--foreground-subtle) uppercase italic">3-5 seconds finality</p>
            </div>
            <div className="p-8 rounded-4xl bg-(--surface-elevated) border border-(--border) flex flex-col justify-between group hover:border-black transition-all">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                   <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <h4 className="font-black text-sm uppercase tracking-tight mb-1">Success Rate</h4>
                <p className="text-[10px] font-bold text-(--foreground-subtle) uppercase italic">99.9% uptime on Stellar</p>
            </div>
            <div className="p-8 rounded-4xl bg-(--surface-elevated) border border-(--border) flex flex-col justify-between group hover:border-black transition-all">
                <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                   <Download className="h-5 w-5 text-indigo-500" />
                </div>
                <h4 className="font-black text-sm uppercase tracking-tight mb-1">Auditable Trail</h4>
                <p className="text-[10px] font-bold text-(--foreground-subtle) uppercase italic">Full SEP-31 Compliance</p>
            </div>
        </div>
      </div>
    </RequireSession>
  );
}
