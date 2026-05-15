import { api } from '../client';
import type {
  Wallet,
  CreateWalletRequest,
  WalletBalance,
  Transaction,
  Withdrawal,
  InitiateWithdrawalRequest,
  VoucherSale,
  AgentAccount,
  CreateAgentAccountRequest,
  ReportParams,
  SalesReport,
  WalletStatement,
  ApiResponse,
} from '../types';

// Nginx proxies /wallet/ → wallet-service:3002

type RawWallet = {
  id: string | number;
  userId?: string | null;
  owner_type: 'Client' | 'Agent' | 'Admin';
  client_id?: string | number;
  phone: string;
  balance: string | number;
  isActive?: boolean;
  createdAt: string;
};

type RawVoucherSale = {
  id: string | number;
  voucherId?: string | number;
  voucher_id?: string | number;
  voucher_code?: string;
  voucherCode?: string;
  client_id?: string | number;
  clientId?: string | number;
  amount: string | number;
  serviceFee?: string | number;
  fee?: string | number;
  netAmount?: string | number;
  phone: string;
  provider: string;
  createdAt: string;
};

function normalizeAmount(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeWallet(raw: RawWallet): Wallet {
  return {
    id: String(raw.id),
    userId: raw.userId ?? null,
    ownerType: raw.owner_type,
    clientId: String(raw.client_id ?? ''),
    phone: raw.phone,
    balance: normalizeAmount(raw.balance),
    createdAt: raw.createdAt,
  };
}

function normalizeVoucherSale(raw: RawVoucherSale): VoucherSale {
  const amount = normalizeAmount(raw.amount);
  const fee = normalizeAmount(raw.serviceFee ?? raw.fee ?? 0);
  const netAmount = normalizeAmount(raw.netAmount ?? raw.amount ?? amount - fee);

  return {
    id: String(raw.id),
    clientId: String(raw.client_id ?? raw.clientId ?? ''),
    voucherId: String(raw.voucherId ?? raw.voucher_id ?? ''),
    voucherCode: raw.voucherCode ?? raw.voucher_code ?? '',
    amount,
    fee,
    netAmount,
    phone: raw.phone,
    provider: raw.provider,
    createdAt: raw.createdAt,
  };
}

// ─── Wallets ─────────────────────────────────────────────────────────────────

export const walletsService = {
  create: (data: CreateWalletRequest) =>
    api.post<ApiResponse<RawWallet>>('/wallet/wallets', data).then((response) => normalizeWallet(response.data ?? response as unknown as RawWallet)),

  getBalance: (walletId: string) =>
    api.get<ApiResponse<WalletBalance>>(`/wallet/wallets/${walletId}/balance`).then((response) => response.data ?? {} as WalletBalance),

  getByUser: (userId: string, type?: string) =>
    api.get<ApiResponse<RawWallet>>(`/wallet/wallets/user/${userId}${type ? `?type=${type}` : ''}`).then((response) => normalizeWallet(response.data ?? response as unknown as RawWallet)),

  getTransactions: (walletId: string, limit?: number) =>
    api.get<ApiResponse<Transaction[]>>(`/wallet/wallets/${walletId}/transactions${limit ? `?limit=${limit}` : ''}`).then((response) => Array.isArray(response.data) ? response.data : (response as unknown as Transaction[])),

  getByClient: (clientId: string) =>
    api.get<ApiResponse<RawWallet>>(`/wallet/wallets/client/${clientId}`).then((response) => normalizeWallet(response.data ?? response as unknown as RawWallet)),

  getAdminWallet: () =>
    api.get<ApiResponse<RawWallet>>('/wallet/wallets/getAdminWallet').then((response) => normalizeWallet(response.data ?? response as unknown as RawWallet)),
};

// ─── Withdrawals ─────────────────────────────────────────────────────────────

export const withdrawalsService = {
  initiate: (data: InitiateWithdrawalRequest) =>
    api.post<ApiResponse<Withdrawal>>('/wallet/withdrawals', data).then((response) => response.data ?? response as unknown as Withdrawal),

  getById: (id: string) =>
    api.get<ApiResponse<Withdrawal>>(`/wallet/withdrawals/${id}`).then((response) => response.data ?? response as unknown as Withdrawal),

  getByWallet: (walletId: string) =>
    api.get<ApiResponse<Withdrawal[]>>(`/wallet/withdrawals/wallet/${walletId}`).then((response) => response.data ?? (response as unknown as Withdrawal[])),

  updateStatus: (id: string, status: 'approved' | 'rejected') =>
    api.put<ApiResponse>(`/wallet/withdrawals/${id}/status`, { status }),
};

// ─── Purchases ───────────────────────────────────────────────────────────────

export const purchasesService = {
  getVoucherSales: (clientId: string) =>
    api.get<ApiResponse<RawVoucherSale[]>>(`/wallet/vouchers/sales/${clientId}`).then((response) => {
      const payload = Array.isArray(response.data) ? response.data : (response as unknown as RawVoucherSale[]);
      return Array.isArray(payload) ? payload.map(normalizeVoucherSale) : [];
    }),
};

// ─── Agent Accounts ──────────────────────────────────────────────────────────

export const accountsService = {
  create: (data: CreateAgentAccountRequest) =>
    api.post<ApiResponse<AgentAccount>>('/wallet/accounts', data).then((response) => response.data),

  getById: (id: string) =>
    api.get<ApiResponse<AgentAccount>>(`/wallet/accounts/${id}`).then((response) => response.data),

  getByAgent: (agentId: string) =>
    api.get<ApiResponse<AgentAccount>>(`/wallet/accounts/agent/${agentId}`).then((response) => response.data),

  updateBalance: (id: string, amount: number, operation: 'add' | 'subtract') =>
    api.put<ApiResponse>(`/wallet/accounts/${id}/balance`, { amount, operation }),

  getAgentsByClient: (clientId: string) =>
    api.get<ApiResponse<AgentAccount[]>>(`/wallet/accounts/client/${clientId}/agents`).then((response) => response.data ?? []),
};

// ─── Reports ─────────────────────────────────────────────────────────────────

function buildQuery(params?: ReportParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  if (params.startDate) qs.set('startDate', params.startDate);
  if (params.endDate) qs.set('endDate', params.endDate);
  if (params.type) qs.set('type', params.type);
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export const reportsService = {
  getSalesReport: (clientId: string, params?: ReportParams) =>
    api.get<ApiResponse<{ sales: RawVoucherSale[]; summary: Record<string, unknown> }>>(`/wallet/reports/sales/${clientId}${buildQuery(params)}`).then((response) => {
      const raw = response.data ?? response;
      const data = ('data' in raw && raw.data) ? raw.data : raw as { sales: RawVoucherSale[]; summary: Record<string, unknown> };
      const salesArray = 'sales' in data && Array.isArray(data.sales) ? data.sales : [];
      const sales = salesArray.map(normalizeVoucherSale);
      const summary = 'summary' in data ? (data.summary as Record<string, unknown>) ?? {} : {};
      const computedRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);

      return {
        sales,
        summary: {
          totalSales: sales.length,
          totalFees: normalizeAmount(summary.totalFees ?? summary.totalServiceFees ?? 0),
          netRevenue: normalizeAmount(summary.netRevenue ?? computedRevenue),
          totalRevenue: normalizeAmount(summary.totalRevenue ?? computedRevenue),
          totalServiceFees: normalizeAmount(summary.totalServiceFees ?? 0),
          byPaymentMethod: summary.byPaymentMethod as Record<string, number> | undefined,
        },
      };
    }),

  getWalletStatement: (walletId: string, params?: ReportParams) =>
    api.get<ApiResponse<WalletStatement>>(`/wallet/reports/statement/${walletId}${buildQuery(params)}`).then((response) => response.data ?? response as unknown as WalletStatement),
};