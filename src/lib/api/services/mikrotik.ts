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
};