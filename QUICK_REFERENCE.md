# Quick Reference Guide

## Getting Started (5 minutes)

### 1. Install & Run
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### 2. Project Structure Quick Tour
- **Pages**: `src/app/admin/[section]/` (11 management sections)
- **Components**: `src/components/admin/` (Layout, Cards, Tables, Dialogs)
- **UI Library**: `src/components/ui/` (13 Radix UI components)
- **Utilities**: `src/lib/utils.ts`

### 3. Navigation
Via sidebar on left (click to collapse/expand):
- Dashboard → System overview
- Users → User management
- Agents → Agent management
- Devices → Device management
- Packages → Service packages
- Vouchers → Promotional codes
- Payments → Financial monitoring
- Adverts → Content moderation
- Alerts → System alerts
- Logs → Activity audit trail
- Settings → Configuration

## File Locations Reference

| Feature | Location |
|---|---|
| User Management | `src/app/admin/users/page.tsx` |
| User Dialog | `src/components/admin/dialogs/user-management-dialog.tsx` |
| User Columns | `src/components/admin/tables/columns/user-columns.ts` |
| Dashboard | `src/app/admin/dashboard/page.tsx` |
| Sidebar | `src/components/admin/sidebar.tsx` |
| Header | `src/components/admin/header.tsx` |
| UI Components | `src/components/ui/` |
| Styles | `src/app/globals.css` |

## Common Patterns

### Adding a New Management Page

1. **Create Page**
```typescript
// src/app/admin/[section]/page.tsx
'use client';
import { useState } from 'react';
import { DataTable } from '@/components/admin/tables/data-table';
import { [Feature]Dialog } from '@/components/admin/dialogs/[feature]-dialog';

export default function [Section]Page() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="p-8 space-y-6">
      {/* Page content */}
    </div>
  );
}
```

2. **Add Column Definitions**
```typescript
// src/components/admin/tables/columns/[section]-columns.ts
export const [section]Columns = [
  { header: 'Name', accessor: 'name' as const },
  // ...
];
```

3. **Create Dialog**
```typescript
// src/components/admin/dialogs/[feature]-dialog.tsx
export function [Feature]Dialog({ open, onOpenChange }) {
  // Dialog form
}
```

### Making API Calls

```typescript
const [data, setData] = useState<any[]>([]);

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/endpoint`
      );
      const result = await response.json();
      setData(result.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  fetchData();
}, []);
```

### Form Validation

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validate = () => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.name) newErrors.name = 'Name required';
  if (!formData.email) newErrors.email = 'Email required';
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) return;
  
  // Submit form
};
```

## Component Cheat Sheet

### Button
```typescript
import { Button } from '@/components/ui/button';

<Button>Default</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="icon"><Icon /></Button>
```

### Card
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Input & Label
```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div>
  <Label htmlFor="name">Name</Label>
  <Input id="name" placeholder="Enter name" />
</div>
```

### Dialog
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Select
```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Badge
```typescript
import { Badge } from '@/components/ui/badge';

<Badge>Active</Badge>
<Badge variant="secondary">Pending</Badge>
<Badge variant="destructive">Blocked</Badge>
<Badge variant="outline">Draft</Badge>
```

### Table
```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Value</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### DataTable (Generic)
```typescript
import { DataTable } from '@/components/admin/tables/data-table';

<DataTable
  columns={columns}
  data={data}
  onEdit={(row) => handleEdit(row)}
  onDelete={(row) => handleDelete(row)}
/>
```

## Icons

Available from Lucide React:

```typescript
import { Users, Activity, Settings, Save, X, Plus, Search } from 'lucide-react';

<Users className="w-5 h-5" />
```

## Styling Classes

### Layout
- `p-8` - Padding
- `gap-4` - Gap between items
- `space-y-6` - Vertical spacing
- `flex` - Flexbox
- `grid` - Grid layout
- `rounded-lg` - Border radius

### Typography
- `text-3xl font-bold` - Large heading
- `text-sm` - Small text
- `font-semibold` - Bold
- `text-muted-foreground` - Muted color

### Colors
- `bg-primary` - Primary color background
- `text-primary` - Primary text color
- `border-border` - Border color
- `bg-muted` - Muted background
- `hover:bg-accent` - Hover state

### Responsive
- `md:grid-cols-2` - Medium screen: 2 columns
- `lg:grid-cols-4` - Large screen: 4 columns
- `hidden md:block` - Hidden on mobile, visible on medium+

## Common Imports

```typescript
// React & Next.js
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Icons
import { Plus, Edit, Trash, Search } from 'lucide-react';

// Utilities
import { cn } from '@/lib/utils';
```

## Environment Variables

Located in `.env.local`:

```env
# API Endpoints
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_ADMIN_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3003
```

## Debugging Tips

1. **Check Browser Console**: F12 → Console
2. **React DevTools**: Inspect components and state
3. **Network Tab**: View API requests/responses
4. **Console Logs**: `console.log('debug:', value);`
5. **Breakpoints**: Add breakpoints in DevTools

## Performance Tips

1. Use pagination for large tables (50 rows per page)
2. Lazy load heavy components
3. Memoize expensive computations
4. Debounce search inputs
5. Cache API responses

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

## Building for Production

```bash
npm run build
npm start
```

## Deployment Options

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```bash
docker build -t zota-admin .
docker run -p 3000:3000 zota-admin
```

### Manual
```bash
npm run build
npm start
```

## Troubleshooting

| Issue | Solution |
|---|---|
| Port 3000 in use | Kill process: `lsof -i :3000` → `kill -9 <PID>` |
| Modules not found | Run `npm install` |
| Styles not loading | Clear `.next` folder and rebuild |
| API calls failing | Check `.env.local` and backend URLs |
| Build errors | Check TypeScript errors: `npm run lint` |

## Documentation Files

- **README.md** - Project overview
- **BUILD_SUMMARY.md** - What was built
- **ARCHITECTURE.md** - System design
- **DEVELOPMENT.md** - Developer guide
- **API_INTEGRATION.md** - API details
- **QUICK_REFERENCE.md** - This file

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run linter
npm test                # Run tests

# Git
git status              # Check changes
git add .               # Stage changes
git commit -m "message" # Commit changes
git push                # Push to remote
```

## Quick Links

- **Local**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **Package.json**: Root directory
- **Source Code**: `src/` directory
- **Components**: `src/components/`
- **Pages**: `src/app/admin/`

## Support Resources

1. Check the README for project overview
2. Review ARCHITECTURE.md for design patterns
3. Look at existing pages as examples
4. Check TypeScript types for API contracts
5. Use browser DevTools for debugging

---

**Last Updated**: April 2026
**Version**: 1.0.0
