# API Integration Guide

## Overview

This guide provides detailed instructions for integrating the Zota Admin Dashboard with backend services. The admin dashboard requires connections to multiple microservices.

## Backend Service Architecture

```
Admin Dashboard
    ↓
API Gateway (Port 3001)
    ├── Auth Service (3003)
    ├── User Service (3010)
    ├── Agent Service (3011)
    ├── Device Service (3012)
    ├── Package Service (3013)
    ├── Voucher Service (3014)
    ├── Payment Service (3015)
    ├── Advert Service (3016)
    └── Log Service (3017)
```

## Environment Configuration

Update `.env.local`:

```env
# API Base URLs
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_ADMIN_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3003

# Other configuration
NEXT_PUBLIC_APP_NAME=Zota Admin
NEXT_PUBLIC_MAX_UPLOAD_SIZE=10MB
```

## Authentication Flow

### 1. Login Process

```typescript
// Page: src/app/(auth)/login/page.tsx (to be created)
const login = async (email: string, password: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_AUTH_SERVICE_URL}/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }
  );
  
  const data = await response.json();
  // Store JWT token
  localStorage.setItem('admin_token', data.token);
  localStorage.setItem('refresh_token', data.refreshToken);
  
  return data;
};
```

### 2. Token Management

```typescript
// src/lib/auth.ts
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
};

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_token', token);
  }
};

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('refresh_token');
  }
};
```

### 3. Protected API Calls

```typescript
// src/lib/api.ts
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = getAuthToken();
  
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    }
  );

  if (response.status === 401) {
    // Token expired, refresh or logout
    clearAuthToken();
    window.location.href = '/login';
  }

  return response.json();
};
```

## Service-Specific Integration

### Users Management

**Endpoint**: `/api/admin/users`

#### List Users
```typescript
const fetchUsers = async (page = 1, limit = 50) => {
  return apiCall(`/api/admin/users?page=${page}&limit=${limit}`);
};

// Add to UserPage
useEffect(() => {
  fetchUsers().then(setUsers);
}, []);
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Client",
      "status": "Active",
      "createdAt": "2024-01-15",
      "devices": 3
    }
  ],
  "total": 1234,
  "page": 1,
  "limit": 50
}
```

#### Create User
```typescript
const createUser = async (userData: {
  name: string;
  email: string;
  role: 'Client' | 'Agent' | 'Admin';
  password: string;
}) => {
  return apiCall('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};
```

#### Update User
```typescript
const updateUser = async (userId: string, updates: any) => {
  return apiCall(`/api/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};
```

#### Delete User
```typescript
const deleteUser = async (userId: string) => {
  return apiCall(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
};
```

### Agents Management

**Endpoints**: `/api/admin/agents`

#### List Agents
```typescript
const fetchAgents = async (status?: 'Pending' | 'Approved' | 'Suspended') => {
  const url = status
    ? `/api/admin/agents?status=${status}`
    : '/api/admin/agents';
  return apiCall(url);
};
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "agent_123",
      "name": "Agent Alpha",
      "email": "agent@example.com",
      "status": "Approved",
      "revenue": 4500.00,
      "clients": 23,
      "rating": 4.8,
      "joinDate": "2024-01-10"
    }
  ],
  "total": 156
}
```

#### Approve Agent
```typescript
const approveAgent = async (agentId: string) => {
  return apiCall(`/api/admin/agents/${agentId}/approve`, {
    method: 'POST',
  });
};
```

#### Suspend Agent
```typescript
const suspendAgent = async (agentId: string, reason: string) => {
  return apiCall(`/api/admin/agents/${agentId}/suspend`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};
```

### Devices Management

**Endpoints**: `/api/admin/devices`

#### List Devices
```typescript
const fetchDevices = async (status?: 'Online' | 'Offline') => {
  const url = status
    ? `/api/admin/devices?status=${status}`
    : '/api/admin/devices';
  return apiCall(url);
};
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "DEV001",
      "name": "Router-01",
      "type": "Network Device",
      "owner": "john@example.com",
      "status": "Online",
      "bandwidth": 250,
      "lastSeen": "2024-04-20T10:30:00Z",
      "ip": "192.168.1.1"
    }
  ],
  "total": 456
}
```

#### Block Device
```typescript
const blockDevice = async (deviceId: string) => {
  return apiCall(`/api/admin/devices/${deviceId}/block`, {
    method: 'POST',
  });
};
```

### Packages Management

**Endpoints**: `/api/admin/packages`

#### List Packages
```typescript
const fetchPackages = async () => {
  return apiCall('/api/admin/packages');
};
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "PKG001",
      "name": "Basic Plan",
      "price": 9.99,
      "bandwidth": 50,
      "maxDevices": 3,
      "features": ["24/7 Support"],
      "subscribers": 234,
      "status": "Active"
    }
  ]
}
```

#### Create Package
```typescript
const createPackage = async (packageData: {
  name: string;
  price: number;
  bandwidth: number;
  maxDevices: number;
  features: string[];
}) => {
  return apiCall('/api/admin/packages', {
    method: 'POST',
    body: JSON.stringify(packageData),
  });
};
```

### Vouchers Management

**Endpoints**: `/api/admin/vouchers`

#### List Vouchers
```typescript
const fetchVouchers = async () => {
  return apiCall('/api/admin/vouchers');
};
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "VOUCH001",
      "code": "SUMMER2024",
      "discountType": "Percentage",
      "discount": 20,
      "validFrom": "2024-01-01",
      "validUntil": "2024-12-31",
      "usages": 234,
      "limit": 500,
      "status": "Active"
    }
  ]
}
```

#### Create Voucher
```typescript
const createVoucher = async (voucherData: {
  code: string;
  discountType: 'Percentage' | 'Fixed';
  discount: number;
  validUntil: string;
  limit: number;
}) => {
  return apiCall('/api/admin/vouchers', {
    method: 'POST',
    body: JSON.stringify(voucherData),
  });
};
```

### Payments Monitoring

**Endpoints**: `/api/admin/payments`

#### List Payments
```typescript
const fetchPayments = async (page = 1, limit = 50) => {
  return apiCall(
    `/api/admin/payments?page=${page}&limit=${limit}`
  );
};
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "PAY001",
      "date": "2024-04-20",
      "user": "john@example.com",
      "amount": 99.99,
      "currency": "USD",
      "package": "Professional Plan",
      "status": "Completed",
      "method": "Credit Card",
      "reference": "txn_123456"
    }
  ],
  "total": 5678
}
```

#### Process Refund
```typescript
const processRefund = async (paymentId: string, reason: string) => {
  return apiCall(`/api/admin/payments/${paymentId}/refund`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};
```

### Adverts Moderation

**Endpoints**: `/api/admin/adverts`

#### List Adverts
```typescript
const fetchAdverts = async (status?: 'Pending' | 'Approved' | 'Rejected') => {
  const url = status
    ? `/api/admin/adverts?status=${status}`
    : '/api/admin/adverts';
  return apiCall(url);
};
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "AD001",
      "title": "Summer Promotion",
      "advertiser": "agent@example.com",
      "status": "Pending Review",
      "content": "Ad content here",
      "views": 1234,
      "clicks": 89,
      "submittedAt": "2024-04-18"
    }
  ]
}
```

#### Approve Advert
```typescript
const approveAdvert = async (advertId: string) => {
  return apiCall(`/api/admin/adverts/${advertId}/approve`, {
    method: 'POST',
  });
};
```

#### Reject Advert
```typescript
const rejectAdvert = async (advertId: string, reason: string) => {
  return apiCall(`/api/admin/adverts/${advertId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
};
```

### System Alerts

**Endpoints**: `/api/admin/alerts`

#### List Alerts
```typescript
const fetchAlerts = async (severity?: 'High' | 'Medium' | 'Low') => {
  const url = severity
    ? `/api/admin/alerts?severity=${severity}`
    : '/api/admin/alerts';
  return apiCall(url);
};
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "ALERT001",
      "type": "Security",
      "severity": "High",
      "message": "Suspicious login activity detected",
      "timestamp": "2024-04-20T14:30:00Z",
      "status": "Unresolved",
      "affectedEntity": "user_123"
    }
  ]
}
```

#### Resolve Alert
```typescript
const resolveAlert = async (alertId: string, resolution: string) => {
  return apiCall(`/api/admin/alerts/${alertId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolution }),
  });
};
```

### Activity Logs

**Endpoints**: `/api/admin/logs`

#### List Logs
```typescript
const fetchLogs = async (page = 1, limit = 100, filters?: any) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...filters,
  });
  return apiCall(`/api/admin/logs?${params}`);
};
```

**Expected Response**:
```json
{
  "data": [
    {
      "id": "LOG001",
      "timestamp": "2024-04-20T15:42:30Z",
      "action": "User Login",
      "actor": "john@example.com",
      "resource": "User Dashboard",
      "status": "Success",
      "ipAddress": "192.168.1.1"
    }
  ],
  "total": 12345
}
```

## Error Handling

```typescript
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    clearAuthToken();
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Forbidden - user lacks permission
    showError('You do not have permission for this action');
  } else if (error.response?.status === 400) {
    // Bad request - validation error
    showError(error.response.data.message);
  } else if (error.response?.status >= 500) {
    // Server error
    showError('Server error. Please try again later.');
  } else {
    showError('An unexpected error occurred');
  }
};
```

## Rate Limiting

The API implements rate limiting. Handle with:

```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  console.log(`Rate limited. Retry after ${retryAfter} seconds`);
}
```

## Pagination Implementation

```typescript
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(50);
const [total, setTotal] = useState(0);

const loadData = async () => {
  const response = await apiCall(
    `/api/resource?page=${page}&limit=${limit}`
  );
  setTotal(response.total);
};

const pageCount = Math.ceil(total / limit);
```

## Testing Integration

```typescript
// Create mock API for testing
jest.mock('@/lib/api', () => ({
  apiCall: jest.fn(() => Promise.resolve({
    data: mockData,
    total: 100
  }))
}));
```

## Performance Tips

1. **Implement Caching**
```typescript
const cache = new Map();

const fetchWithCache = async (key: string, fetcher: () => Promise<any>) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  const data = await fetcher();
  cache.set(key, data);
  return data;
};
```

2. **Lazy Load Data**
```typescript
const [data, setData] = useState([]);

const loadMore = () => {
  const nextPage = Math.floor(data.length / LIMIT) + 1;
  fetchData(nextPage).then(newData => {
    setData([...data, ...newData]);
  });
};
```

3. **Debounce Search**
```typescript
const debouncedSearch = useMemo(
  () => debounce((query) => searchUsers(query), 300),
  []
);
```

## Deployment Considerations

- Update `.env.local` for production URLs
- Use HTTPS for all API calls
- Implement CORS properly on backend
- Monitor API quota usage
- Set up error tracking (Sentry)
- Implement request logging
