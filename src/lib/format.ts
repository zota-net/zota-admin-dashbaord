export const formatMoney = (value: number | null | undefined, decimals = 0): string => {
  const n = Number(value ?? 0);
  return `UGX ${n.toLocaleString('en-UG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

export const formatNumber = (value: number | null | undefined): string =>
  Number(value ?? 0).toLocaleString('en-US');

export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const timeAgo = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
};

export const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'resolved':
    case 'success':
    case 'connected':
      return 'default';
    case 'suspended':
    case 'banned':
    case 'inactive':
    case 'failed':
    case 'critical':
    case 'urgent':
      return 'destructive';
    case 'pending':
    case 'waiting':
    case 'in-progress':
    case 'disconnected':
      return 'outline';
    default:
      return 'secondary';
  }
};
