/** Anchor registered in the database. */
export interface Anchor {
  id: string;
  name: string;
  stellarAddress: string;
  baseUrl: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Anchor record as returned by the database query (snake_case columns). */
export interface AnchorRow {
  id: string;
  name: string;
  stellar_address: string;
  base_url: string;
  auth_token: string;
  supported_currencies: string[];
  supported_countries: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
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
    createdAt: Date;
  }[];
}

/** Convert a database row to a clean Anchor (without auth_token). */
export function rowToAnchor(row: AnchorRow): Anchor {
  return {
    id: row.id,
    name: row.name,
    stellarAddress: row.stellar_address,
    baseUrl: row.base_url,
    supportedCurrencies: row.supported_currencies,
    supportedCountries: row.supported_countries,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
