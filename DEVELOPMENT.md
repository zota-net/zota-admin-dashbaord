# Development Setup & Contribution Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_ADMIN_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3003
```

### 3. Start Development Server
```bash
npm run dev
```

Navigate to `http://localhost:3000/admin/dashboard`

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard routes
│   │   ├── [section]/page.tsx    # Management pages
│   │   └── layout.tsx            # Admin wrapper layout
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Redirect to dashboard
│   └── globals.css        # Global styles
│
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── cards/        # Dashboard cards
│   │   ├── tables/       # Data tables
│   │   │   ├── data-table.tsx        # Generic table
│   │   │   └── columns/  # Column definitions
│   │   └── dialogs/      # Modal dialogs
│   │
│   ├── ui/               # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   └── textarea.tsx
│   │
│   └── providers/         # React providers
│       └── theme-provider.tsx
│
├── lib/                   # Utility functions
│   └── utils.ts          # Helper functions (cn, etc)
│
└── public/               # Static assets
```

## Code Organization Guidelines

### Component Naming
- Files: `component-name.tsx` (kebab-case)
- Components: `ComponentName` (PascalCase)
- Example: `file-name.tsx` exports `FileName`

### File Structure
1. Imports
2. Types/Interfaces
3. Component definition
4. Export statement

```typescript
'use client';  // Add if component uses hooks

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onSubmit: () => void;
}

export function MyComponent({ title, onSubmit }: MyComponentProps) {
  const [state, setState] = useState(false);
  
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={onSubmit}>Submit</Button>
    </div>
  );
}
```

### Import Organization
1. React/Next imports
2. Third-party imports
3. Local imports (lib)
4. Component imports

## Creating New Admin Pages

### 1. Create Page File
`src/app/admin/[section]/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/admin/tables/data-table';
import { [Feature]Dialog } from '@/components/admin/dialogs/[feature]-dialog';

export default function [Section]Page() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any[]>([]);

  const filteredData = data.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Section Title</h1>
        <p className="text-muted-foreground mt-2">
          Description of section purpose
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
          <div className="flex gap-4 mt-4 flex-wrap">
            {/* Search, filters, exports */}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>

      <[Feature]Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
```

### 2. Create Column Definitions
`src/components/admin/tables/columns/[section]-columns.ts`

```typescript
import { Badge } from '@/components/ui/badge';

export const sectionColumns = [
  { header: 'Name', accessor: 'name' as const },
  { header: 'Email', accessor: 'email' as const },
  {
    header: 'Status',
    render: (row: any) => (
      <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
        {row.status}
      </Badge>
    ),
  },
];
```

### 3. Create Management Dialog
`src/components/admin/dialogs/[feature]-dialog.tsx`

```typescript
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeatureDialog({ open, onOpenChange }: DialogProps) {
  const [formData, setFormData] = useState({
    field1: '',
    field2: '',
  });

  const handleSubmit = () => {
    // Handle form submission
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            Dialog description
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="field1">Field Label</Label>
            <Input
              id="field1"
              placeholder="Placeholder"
              value={formData.field1}
              onChange={(e) =>
                setFormData({ ...formData, field1: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Working with Components

### DataTable Component
Generic table that supports custom columns and actions:

```typescript
<DataTable
  columns={columns}  // Column definitions
  data={filteredData}  // Data array
  onEdit={(row) => handleEdit(row)}  // Optional
  onDelete={(row) => handleDelete(row)}  // Optional
  onView={(row) => handleView(row)}  // Optional
/>
```

### Form Handling
Using React Hook Form + Zod (planned):

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

## Styling Guidelines

### Tailwind CSS Classes
Use semantic class names:

```typescript
<div className="p-8 space-y-6">  // padding, gap
  <h1 className="text-3xl font-bold">Title</h1>  // size, weight
  <p className="text-muted-foreground mt-2">Description</p>  // color, margin
</div>
```

### Responsive Design
```typescript
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Content */}
</div>
```

### Dark Mode
Automatic via `next-themes`, use CSS variables:

```css
--background: light/dark background
--foreground: light/dark text
--primary: brand color
--muted: disabled/secondary content
```

## Testing Guidelines

### Unit Test Example
```typescript
// component.test.ts
import { render, screen } from '@testing-library/react';
import { MyComponent } from './my-component';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Git Workflow

1. **Create Feature Branch**
```bash
git checkout -b feature/add-new-management-section
```

2. **Make Changes & Commit**
```bash
git add .
git commit -m "feat: Add new management section with CRUD operations"
```

3. **Push & Create PR**
```bash
git push origin feature/add-new-management-section
```

4. **Pull Request Description**
   - What: Description of changes
   - Why: Reason for changes
   - How: Technical implementation
   - Testing: How to verify
   - Screenshots: UI changes

## Performance Tips

1. **Component Memoization**
```typescript
const MemoizedComponent = React.memo(MyComponent);
```

2. **Dynamic Imports**
```typescript
const HeavyComponent = dynamic(() => import('./heavy'), {
  loading: () => <Skeleton />,
});
```

3. **Data Pagination**
```typescript
const PAGE_SIZE = 50;
const paginatedData = data.slice(
  (page - 1) * PAGE_SIZE,
  page * PAGE_SIZE
);
```

## Common Patterns

### Modal with Form
```typescript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({});

const handleSubmit = async () => {
  try {
    await apiCall(formData);
    setIsOpen(false);
    showSuccess('Operation successful');
  } catch (error) {
    showError(error.message);
  }
};
```

### Search & Filter
```typescript
const filteredData = data.filter(item =>
  item.name.toLowerCase().includes(search.toLowerCase()) &&
  (statusFilter ? item.status === statusFilter : true)
);
```

### Form Validation
```typescript
const errors: Record<string, string> = {};
if (!formData.name) errors.name = 'Name required';
if (!formData.email) errors.email = 'Email required';
setFormErrors(errors);
return Object.keys(errors).length === 0;
```

## Debugging

### React DevTools
- Install React DevTools browser extension
- Inspect component props and state
- Monitor re-renders

### Next.js DevTools
- Built-in error overlays
- Network tab in browser DevTools
- Console logs for debugging

### Console Debugging
```typescript
console.log('Debug value:', data);
console.assert(condition, 'Assertion failed');
console.group('Group name');
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Getting Help

1. **Check Documentation**: README.md, ARCHITECTURE.md
2. **Search Issues**: Look for similar problems
3. **Ask Team**: Slack or code review
4. **Debug Locally**: Reproduce issue and inspect
