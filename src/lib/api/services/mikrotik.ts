import { api } from '../client';
import type { ApiResponse, Router, RouterConnection } from '../types';

export const routersService = {
  getByClient: (clientId: string) =>
    api.get<ApiResponse<Router[]>>(`/mikrotik/routers/client/${clientId}`).then((response) => response.data ?? []),

  getById: (id: string) =>
    api.get<ApiResponse<Router>>(`/mikrotik/routers/${id}`).then((response) => response.data),

  getConnection: (routerId: string) =>
    api.get<ApiResponse<RouterConnection>>(`/mikrotik/routers/${routerId}/connection`).then((response) => response.data),

  connect: (routerId: string) =>
    api.post<ApiResponse>(`/mikrotik/routers/${routerId}/connect`),

  disconnect: (routerId: string) =>
    api.post<ApiResponse>(`/mikrotik/routers/${routerId}/disconnect`),

  runScript: (routerId: string, source: string, scriptName?: string) =>
    api.post<ApiResponse<{ output?: string; success: boolean }>>(`/mikrotik/routers/${routerId}/scripts/run`, { source, scriptName }),

  getAll: () =>
    api.get<ApiResponse<import('../types').Router[]>>('/mikrotik/routers').then((r) => (r.data ?? r) as import('../types').Router[]),
};