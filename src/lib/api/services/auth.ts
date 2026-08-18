import { api } from '../client';
import type {
  AdminUser,
  AddAdminRequest,
  UpdateRoleRequest,
  AdminNotification,
  ApiResponse,
} from '../types';

export const adminsService = {
  create: (data: AddAdminRequest) =>
    api.post<ApiResponse<AdminUser>>('/auth/add-admin', data).then((r) => r.data ?? r as unknown as AdminUser),

  getAll: () =>
    api.get<ApiResponse<AdminUser[]>>('/auth/admins').then((r) => {
      const data = r.data ?? r;
      return Array.isArray(data) ? data as AdminUser[] : [];
    }),

  remove: (id: number) =>
    api.delete<ApiResponse>(`/auth/admins/${id}`),

  updateRole: (id: number, role: 'Admin' | 'SuperAdmin') =>
    api.put<ApiResponse<AdminUser>>(`/auth/admins/${id}/role`, { role } as UpdateRoleRequest).then((r) => r.data ?? r as unknown as AdminUser),
};

export const notificationsService = {
  getAll: (userId: number, unreadOnly?: boolean) =>
    api.get<ApiResponse<AdminNotification[]>>(`/auth/notifications/${userId}${unreadOnly ? '?unread=true' : ''}`).then((r) => {
      const data = r.data ?? r;
      return Array.isArray(data) ? data as AdminNotification[] : [];
    }),

  getUnreadCount: (userId: number) =>
    api.get<ApiResponse<{ count: number }>>(`/auth/notifications/${userId}/unread-count`).then((r) => {
      const data = r.data ?? r;
      return typeof data === 'object' && data !== null && 'count' in data ? (data as { count: number }).count : 0;
    }),

  markAsRead: (id: number) =>
    api.put<ApiResponse>(`/auth/notifications/${id}/read`),

  markAllAsRead: (userId: number) =>
    api.put<ApiResponse>(`/auth/notifications/read-all/${userId}`),
};
