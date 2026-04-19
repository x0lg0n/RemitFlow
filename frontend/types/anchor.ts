export interface AnchorSummary {
  id: string;
  name: string;
  stellarAddress: string;
  baseUrl: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnchorDashboardKpis {
  totalVolume: number;
  totalTransactions: number;
  revenue: number;
  weeklyVolumeChangePct: number;
  weeklyTransactionsChangePct: number;
  weeklyRevenueChangePct: number;
}

export interface AnchorTrendPoint {
  date: string;
  volume: number;
  transactions: number;
}

export interface AnchorDashboardData {
  anchorId: string;
  anchorName: string;
  kpis: AnchorDashboardKpis;
  trends: AnchorTrendPoint[];
  recentTransactions: {
    id: string;
    amount: number;
    fee: number;
    fromCurrency: string;
    toCurrency: string;
    status: string;
    createdAt: string;
  }[];
}
