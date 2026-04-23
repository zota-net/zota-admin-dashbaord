# Admin Application Architecture

## Design Philosophy

The Admin Dashboard is built on the principle of **Control & Monitoring**, distinctly separate from the Client Application which is **User-Facing & Transactional**.

### Core Transformation Model

#### Client Application Flow
```
User → Login → Dashboard → Take Action → System Updates
```

#### Admin Application Flow
```
Admin → Login → Dashboard → Monitor/Control → System Enforces Policy
```

## System Architecture

### 1. Presentation Layer (Components)

**Admin Layout**
- Sidebar: Navigation to all management sections
- Header: User profile, search, notifications
- Main Content: Feature-specific pages

**Data Presentation**
- Tables: Data-heavy displays with sorting/filtering
- Cards: Key metrics and quick stats
- Modals: Data entry and confirmations
- Dialogs: Complex operations with validation

**Reusable Components**
- UI primitives from Radix UI
- Form components for data collection
- Data table with flexible columns
- Status badges and indicators

### 2. Application Layer (Pages)

Each admin section follows a consistent pattern:

```tsx
// Pattern: /admin/{section}/page.tsx
1. Header with title and description
2. Search/filter controls
3. Data table with actions
4. Pagination support
5. Management dialog/modal
```

**Modules:**
- Dashboard: System overview
- Users: User account management
- Agents: Agent operations
- Devices: Network device management
- Packages: Service plan management
- Vouchers: Promotional code management
- Payments: Financial monitoring
- Adverts: Content moderation
- Alerts: System alert management
- Logs: Audit trail
- Settings: Configuration

### 3. Business Logic Layer

**Data Management**
- Form handling with React Hook Form
- Validation with Zod schemas
- State management with Zustand (planned)
- API integration layer

**Operations**
- Create: Add new resources
- Read: Retrieve and display data
- Update: Modify existing resources
- Delete: Remove resources
- Moderate: Review and approve content

**Workflows**
- Agent approval process
- Content moderation flow
- Payment reconciliation
- System configuration

### 4. Data Layer (API)

**Integration Points**
```
Admin Panel → API Gateway → Backend Services
                         → Auth Service
                         → User Service
                         → Agent Service
                         → Device Service
                         → Payment Service
                         → Notification Service
```

**Request Pattern**
```typescript
const response = await fetch(`/api/admin/{resource}`, {
  method: 'GET|POST|PUT|DELETE',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(payload)
});
```

## Feature-to-Component Mapping

### User Management
- **Page**: `/admin/users`
- **Components**: UserManagementDialog
- **Table**: userColumns
- **Operations**: Create, Ban, Verify, Change Role
- **Data**: Users, Activity Logs

### Agent Management
- **Page**: `/admin/agents`
- **Components**: AgentManagementDialog
- **Table**: agentColumns
- **Operations**: Approve, Suspend, View Analytics
- **Data**: Agents, Commissions, Ratings

### Device Management
- **Page**: `/admin/devices`
- **Components**: DeviceManagementDialog
- **Table**: deviceColumns
- **Operations**: Block, Assign Owner, Monitor
- **Data**: Devices, Status, Bandwidth

### Packages Management
- **Page**: `/admin/packages`
- **Components**: PackageManagementDialog
- **Table**: packageColumns
- **Operations**: Create, Edit, Delete, Set Pricing
- **Data**: Packages, Subscribers, Features

### Vouchers Management
- **Page**: `/admin/vouchers`
- **Components**: VoucherManagementDialog
- **Table**: voucherColumns
- **Operations**: Create, Deactivate, Track Usage
- **Data**: Vouchers, Usage Stats, Campaigns

### Payments Management
- **Page**: `/admin/payments`
- **Table**: paymentColumns
- **Operations**: View, Reconcile, Refund, Export
- **Data**: Transactions, Revenue, Methods

### Adverts Moderation
- **Page**: `/admin/adverts`
- **Components**: AdvertModerationDialog
- **Table**: advertColumns
- **Operations**: Approve, Reject, Review, Analytics
- **Data**: Ads, Performance, Publisher Info

### System Alerts
- **Page**: `/admin/alerts`
- **Table**: alertColumns
- **Operations**: View, Resolve, Configure
- **Data**: Alerts, Logs, Thresholds

### Activity Logs
- **Page**: `/admin/logs`
- **Table**: logColumns
- **Operations**: View, Filter, Export
- **Data**: Actions, Users, Timestamps

### Settings
- **Page**: `/admin/settings`
- **Sections**: Security, Notifications, Permissions, System
- **Operations**: Configure, Save, Reset
- **Data**: Configuration values

## Data Flow Example: User Banning

```
Admin UI (Users Page)
    ↓
[Click Actions → Ban User]
    ↓
UserManagementDialog (Confirmation)
    ↓
[Submit]
    ↓
API Call: PUT /api/admin/users/{userId}/ban
    ↓
Backend validates admin permission
    ↓
Database updates user status: banned
    ↓
Log entry created: "Admin banned user"
    ↓
Client app blocked on next login attempt
    ↓
Success notification on Admin Panel
```

## State Management

**Current**: Local component state with React hooks
**Future**: Zustand store for:
- User session
- Filter states
- Modal states
- Loading states
- Error handling

```typescript
// Example future store
const useAdminStore = create((set) => ({
  currentAdmin: null,
  filters: {},
  setFilter: (key, value) => set(state => ({
    filters: { ...state.filters, [key]: value }
  }))
}));
```

## Form Handling

Using React Hook Form + Zod:

```typescript
const schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  role: z.enum(['Client', 'Agent', 'Admin'])
});

type FormData = z.infer<typeof schema>;

const UserForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  // ...
};
```

## Error Handling

**Global Strategy**
1. Validation errors: Display inline form errors
2. API errors: Show toast notifications
3. Auth errors: Redirect to login
4. Business errors: Display specific messages
5. Server errors: Log and show generic message

```typescript
try {
  const response = await apiCall();
  showSuccess('Operation successful');
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    redirectToLogin();
  } else {
    showError(error.message);
  }
}
```

## Performance Considerations

### Optimization Strategies

1. **Code Splitting**: Page-based route splitting
2. **Lazy Loading**: Dynamic component imports
3. **Pagination**: Data tables paginate at 50 rows
4. **Caching**: API response caching
5. **Memoization**: Prevent unnecessary re-renders

```typescript
// Lazy load heavy components
const AdvancedChart = dynamic(
  () => import('@/components/charts/AdvancedChart'),
  { loading: () => <Skeleton /> }
);
```

## Security Architecture

### Authentication
- JWT tokens issued by auth service
- Refresh token rotation
- Secure cookie storage
- Session timeout (30 mins)

### Authorization
- Role-based access control (RBAC)
- Permission validation on every action
- API-level permission checks
- Operation audit logging

### Data Protection
- HTTPS only
- No sensitive data in URLs
- Password hashing with bcrypt
- Encryption for PII fields

### Audit Trail
- Every admin action logged
- Timestamp and actor information
- Resource change tracking
- Immutable log storage

## Testing Strategy

### Unit Tests
- Component props and state
- Form validation
- Utility functions

### Integration Tests
- Page rendering with data
- Form submission flows
- API integration

### E2E Tests
- Complete user workflows
- Permission enforcement
- Error scenarios

## Deployment Architecture

### Development
```
localhost:3000 → Next.js DevServer
              → API localhost:3001
```

### Production
```
Vercel/Docker → Production App
             → Cache (Redis)
             → Database (PostgreSQL)
             → API Services
```

### CI/CD
```
Git Push → GitHub Actions
        → Build & Test
        → Deploy to Staging
        → Manual approval
        → Deploy to Production
```

## Scalability Considerations

### Current Limits
- Table pagination: 50 rows default
- Search: Client-side filtering
- Real-time: Poll-based updates

### Future Improvements
- Server-side pagination
- Elasticsearch for search
- WebSocket for real-time updates
- Caching layer (Redis)
- CDN for static assets
- Database indexing on frequent queries

## Monitoring & Observability

### Metrics to Track
- Page load time
- API response time
- Error rates
- User session duration
- Feature usage patterns

### Logging
- Structured logging (JSON)
- Log aggregation (ELK Stack)
- Error tracking (Sentry)
- Performance monitoring (Datadog)

## Integration Points

### Backend Services
- Auth Service: Authentication & authorization
- User Service: User management
- Agent Service: Agent operations
- Device Service: Device management
- Payment Service: Financial operations
- Notification Service: Alerts & emails

### External Systems
- Email Service: Notifications
- SMS Service: Alerts
- Analytics: Usage tracking
- Cloud Storage: Backups

## Maintenance & Operations

### Regular Tasks
- Database optimization
- Log rotation
- Cache invalidation
- Security updates
- Backup verification

### Runbooks
- Incident response
- Scaling procedures
- Rollback procedures
- Data recovery
