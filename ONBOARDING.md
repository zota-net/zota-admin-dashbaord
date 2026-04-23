# Developer Onboarding Guide

Welcome to the Zota Admin Dashboard team! This guide will get you up to speed in 30 minutes.

## 🚀 First 30 Minutes

### Step 1: Project Overview (5 minutes)
Read these files in order:
1. **README.md** - Project overview (2 min)
2. **This file** - Developer onboarding (3 min)

### Step 2: Local Setup (10 minutes)
```bash
# Clone the repository (assuming you have access)
cd zota-admin-dashbaord

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# http://localhost:3000
```

You should see the admin dashboard!

### Step 3: Explore the Structure (10 minutes)
1. Read **FILE_INVENTORY.md** - Understand file structure
2. Open `src/app/admin/dashboard/page.tsx` - Look at the structure
3. Open `src/components/admin/sidebar.tsx` - See navigation
4. Open `src/components/ui/button.tsx` - See component patterns

### Step 4: Read Core Documentation (5 minutes)
- **QUICK_REFERENCE.md** - Bookmark this, you'll use it constantly
- **DEVELOPMENT.md** - Development standards and patterns

## 📚 Documentation Reading Order

**If you have 1 hour:**
1. README.md (10 min)
2. QUICK_REFERENCE.md (15 min)
3. FILE_INVENTORY.md (15 min)
4. DEVELOPMENT.md (20 min)

**If you have 2 hours (Recommended):**
1. README.md (10 min)
2. BUILD_COMPLETE.md (15 min)
3. ARCHITECTURE.md (20 min)
4. QUICK_REFERENCE.md (20 min)
5. DEVELOPMENT.md (20 min)
6. IMPLEMENTATION_CHECKLIST.md (15 min)

**If you have 4 hours (Comprehensive):**
Read all documentation files in order:
1. README.md
2. BUILD_COMPLETE.md
3. ARCHITECTURE.md
4. DEVELOPMENT.md
5. QUICK_REFERENCE.md
6. API_INTEGRATION.md
7. IMPLEMENTATION_CHECKLIST.md
8. FILE_INVENTORY.md

## 🎯 Your First Task (by Role)

### Backend Integration Developer
1. Read **API_INTEGRATION.md** (most important)
2. Check **IMPLEMENTATION_CHECKLIST.md** (Phase 1-2)
3. Start with: Connect Users API to `/admin/users/page.tsx`
4. Pattern to follow: See "Making API Calls" in QUICK_REFERENCE.md

### Frontend Developer
1. Read **QUICK_REFERENCE.md** (essential)
2. Check **DEVELOPMENT.md** (patterns)
3. Start with: Add a new dialog form
4. Reference: Existing dialogs in `src/components/admin/dialogs/`

### Full-Stack Developer
1. Read all docs in comprehensive order (4 hours)
2. Start with: Complete authentication system
3. Then: Connect first API section (users)
4. Reference: Both DEVELOPMENT.md and API_INTEGRATION.md

### DevOps/Deployment Engineer
1. Read **README.md** (deployment section)
2. Read **DEVELOPMENT.md** (deployment section)
3. Check **IMPLEMENTATION_CHECKLIST.md** (Phase 8)
4. Reference: Build & deployment commands

## 💡 Key Concepts (5 minutes)

### 1. Everything is a Page + Dialog Pattern
```
Page Component (lists data) + Dialog Component (CRUD form)
Example: 
- src/app/admin/users/page.tsx (displays user list)
- src/components/admin/dialogs/user-management-dialog.tsx (add/edit user)
```

### 2. DataTable is Reusable
```
All lists use the same generic DataTable component
Customize with column definitions:
- src/components/admin/tables/columns/user-columns.ts
```

### 3. UI Components are Your Foundation
```
Don't create new components - use existing Radix UI components
Examples: Button, Card, Input, Dialog, Table, Badge, Select
See: src/components/ui/
```

### 4. Styling Uses Tailwind CSS
```
No custom CSS needed - use Tailwind classes
Dark mode works automatically
Colors defined in: src/app/globals.css (CSS variables)
```

### 5. Pages are Interactive ('use client')
```
All admin pages use 'use client' for interactivity
They manage state with useState, useEffect
Connect to APIs when implementing
```

## 🔧 Common Development Tasks

### Task: Display Data in a Table

1. **Create Page** (if doesn't exist)
```bash
# Create src/app/admin/[section]/page.tsx
```

2. **Import Components**
```typescript
import { DataTable } from '@/components/admin/tables/data-table';
import { [section]Columns } from '@/components/admin/tables/columns/[section]-columns';
```

3. **Add State and Data Fetching**
```typescript
const [data, setData] = useState([]);

useEffect(() => {
  fetchData(); // Fetch from API
}, []);
```

4. **Render Table**
```typescript
<DataTable columns={[section]Columns} data={data} />
```

See: QUICK_REFERENCE.md → "Making API Calls" section

### Task: Add a Form Dialog

1. **Copy Existing Dialog** (template)
```bash
cp src/components/admin/dialogs/user-management-dialog.tsx 
   src/components/admin/dialogs/[feature]-management-dialog.tsx
```

2. **Update Form Fields**
```typescript
const [formData, setFormData] = useState({
  // your fields here
});
```

3. **Add Form Fields** using Input, Select, Textarea from UI
```typescript
<Input 
  placeholder="Field name"
  value={formData.fieldName}
  onChange={(e) => setFormData({...formData, fieldName: e.target.value})}
/>
```

4. **Connect to Page**
```typescript
// In page.tsx
<[Feature]Dialog open={isOpen} onOpenChange={setIsOpen} />
```

See: QUICK_REFERENCE.md → Component patterns

### Task: Call an API Endpoint

1. **Check API_INTEGRATION.md** for endpoint details
2. **Use fetch pattern**
```typescript
const fetchData = async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users`
    );
    const result = await response.json();
    setData(result.data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

3. **Call in useEffect**
```typescript
useEffect(() => {
  fetchData();
}, []);
```

See: API_INTEGRATION.md → "Testing Integration" section

## ✅ Onboarding Checklist

- [ ] **Repository Access**
  - [ ] Clone repository
  - [ ] Verify you can run `npm install`
  - [ ] Verify `npm run dev` starts server

- [ ] **Environment Setup**
  - [ ] Read `.env.local` file
  - [ ] Understand API endpoints
  - [ ] Verify backend is running (if doing API work)

- [ ] **Documentation Review**
  - [ ] Read README.md (overview)
  - [ ] Read QUICK_REFERENCE.md (patterns)
  - [ ] Bookmark FILE_INVENTORY.md (file locations)
  - [ ] Read your role-specific docs (see above)

- [ ] **Code Exploration**
  - [ ] Open one of 11 admin pages in IDE
  - [ ] Understand page structure
  - [ ] Look at similar feature's dialog
  - [ ] Check UI components being used

- [ ] **First Contribution**
  - [ ] Pick a small task from IMPLEMENTATION_CHECKLIST.md
  - [ ] Complete the task following existing patterns
  - [ ] Ask team lead for code review
  - [ ] Merge after approval

- [ ] **Team Integration**
  - [ ] Join team communication channel
  - [ ] Introduce yourself
  - [ ] Ask questions if unclear
  - [ ] Share what you learned

## 🆘 Getting Help

### If you can't find something:
1. Check **FILE_INVENTORY.md** - Lists all files by function
2. Use Ctrl+P in VS Code - File search
3. Use Ctrl+Shift+F in VS Code - Code search
4. Ask a team member in chat

### If something doesn't work:
1. Check **DEVELOPMENT.md** → "Troubleshooting" section
2. Check browser console (F12)
3. Check `.env.local` file (API endpoints)
4. Check if backend services are running
5. Ask team lead

### Common Issues & Solutions:

**"Cannot find module" error**
→ Run `npm install` again

**Styles not showing**
→ Restart dev server: Ctrl+C then `npm run dev`

**API calls return 401**
→ Check if backend is running and authentication is configured

**Dark mode not working**
→ Check if next-themes provider is in layout.tsx

**Port 3000 already in use**
→ Kill process: `lsof -i :3000` then `kill -9 <PID>`

## 🎓 Learning Resources

### For Next.js
- Docs: https://nextjs.org/docs
- App Router: https://nextjs.org/docs/app

### For React
- Docs: https://react.dev
- Hooks: https://react.dev/reference/react/hooks

### For TypeScript
- Docs: https://www.typescriptlang.org/docs
- Handbook: https://www.typescriptlang.org/docs/handbook

### For Tailwind CSS
- Docs: https://tailwindcss.com/docs
- Components: https://ui.shadcn.com

### For Radix UI
- Docs: https://www.radix-ui.com/docs
- All components we use are documented there

## 📞 Team Structure

| Role | Responsibility | Contact |
|---|---|---|
| Tech Lead | Architecture, reviews, decisions | |
| Backend Lead | API endpoints, authentication | |
| Frontend Lead | UI, components, styling | |
| DevOps | Deployment, monitoring, infrastructure | |
| QA Lead | Testing, bug reports, validation | |

Ask your Tech Lead for contact details.

## 🚀 Success Metrics

You'll know you're ready when you can:
- [ ] Explain project structure to someone new
- [ ] Add a new admin page following existing patterns
- [ ] Connect a page to an API endpoint
- [ ] Create a form dialog with validation
- [ ] Deploy the application
- [ ] Debug issues using browser DevTools

## 📝 Next Steps (In Order)

### Day 1
1. ✅ Read this onboarding guide
2. ✅ Setup local environment
3. ✅ Read README.md and QUICK_REFERENCE.md
4. ✅ Explore codebase in IDE
5. ✅ Ask tech lead any burning questions

### Day 2
1. ✅ Read DEVELOPMENT.md (coding standards)
2. ✅ Read FILE_INVENTORY.md (file locations)
3. ✅ Complete first small task
4. ✅ Submit code for review

### Day 3+
1. ✅ Pick tasks from IMPLEMENTATION_CHECKLIST.md
2. ✅ Follow patterns from existing code
3. ✅ Ask for help when needed
4. ✅ Contribute to team goals

## 💪 Pro Tips

1. **Use QUICK_REFERENCE.md constantly** - Bookmark it
2. **Copy, don't create** - Template existing code, modify
3. **Ask questions early** - Don't struggle alone
4. **Read code before writing** - Understand patterns first
5. **Test in dev before submitting** - Use `npm run dev`
6. **Keep components small** - Use composition over duplication
7. **Follow existing patterns** - Consistency is key
8. **Comment complex logic** - Help future developers
9. **Test on mobile** - Use browser DevTools device emulation
10. **Check dark mode** - Toggle in settings menu

## 🎉 Welcome Aboard!

You're joining an exciting project. The foundation is solid, the patterns are clear, and the team is supportive. 

**You've got this!** 💪

---

**Created**: April 2026
**Last Updated**: April 2026
**Status**: Ready for New Developers

**Next Action**: Start with README.md, then pick your first task!
