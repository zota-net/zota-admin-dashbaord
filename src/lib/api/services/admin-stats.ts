import { api } from '../client';
import type {
  ApiResponse,
  Client,
  ClientReport,
  Wallet,
  VoucherSale,
  Transaction,
} from '../types';
import { clientsService } from './base-operations';

export interface ClientOverview {
  client: Client;
  report: ClientReport | null;
  wallet: Wallet | null;
  sales: VoucherSale[];
}

async function mapWithConcurrency<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  limit = 6
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      try {
        const item = items[i]!;
        results[i] = await fn(item);
      } catch {
        results[i] = undefined as unknown as R;
      }
    }
  });
  await Promise.all(workers);
  return results;
}

export const adminStatsService = {
  async getPlatformOverview(): Promise<ClientOverview[]> {
    const clients = await clientsService.getAll();
    return mapWithConcurrency(clients, async (client) => {
      const [report, wallet, sales] = await Promise.all([
        api
          .get<ApiResponse<ClientReport>>(`/bop/clients/${client.id}/report`)
          .then((r) => r.data ?? null)
          .catch(() => null),
        api
          .get<ApiResponse<unknown>>(`/wallet/wallets/client/${client.id}`)
          .then((r) => {
            const raw = (r.data ?? r) as Record<string, unknown>;
            return {
              id: String(raw.id ?? ''),
              userId: (raw.userId ?? null) as string | null,
              ownerType: 'Client' as const,
              clientId: String(raw.client_id ?? raw.clientId ?? client.id),
              phone: String(raw.phone ?? ''),
              balance: Number(raw.currentBalance ?? raw.balance ?? 0),
              createdAt: String(raw.createdAt ?? ''),
            } satisfies Wallet;
          })
          .catch(() => null),
        api
          .get<ApiResponse<{ sales: unknown[] }>>(`/wallet/reports/sales/${client.id}`)
          .then((r) => {
            const data = (r.data ?? r) as { sales?: unknown[] };
            return Array.isArray(data.sales) ? (data.sales as VoucherSale[]) : [];
          })
          .catch(() => [] as VoucherSale[]),
      ]);
      return { client, report, wallet, sales };
    });
  },

  async getAdminWallet(): Promise<Wallet | null> {
    return api
      .get<ApiResponse<unknown>>('/wallet/wallets/getAdminWallet')
      .then((r) => {
        const raw = (r.data ?? r) as Record<string, unknown>;
        return {
          id: String(raw.id ?? ''),
          userId: (raw.userId ?? null) as string | null,
          ownerType: 'Admin' as const,
          clientId: String(raw.client_id ?? raw.clientId ?? ''),
          phone: String(raw.phone ?? ''),
          balance: Number(raw.currentBalance ?? raw.balance ?? 0),
          createdAt: String(raw.createdAt ?? ''),
        } satisfies Wallet;
      })
      .catch(() => null);
  },

  getWalletTransactions: (walletId: string, limit = 20) =>
    api
      .get<ApiResponse<Transaction[]>>(`/wallet/wallets/${walletId}/transactions?limit=${limit}`)
      .then((r) => (Array.isArray(r.data) ? r.data : (r as unknown as Transaction[])))
      .catch(() => [] as Transaction[]),
};
