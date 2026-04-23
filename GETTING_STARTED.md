# Getting Started - Step by Step

## ⚡ Quick Start (5 minutes)

### 1. Clone & Install
```bash
cd zota-admin-dashbaord
npm install
```

### 2. Setup Environment
Copy `.env.local` file - it's already configured with default values.

Check the values:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open in Browser
```
http://localhost:3000
```

✅ **You should now see the admin dashboard!**

---

## 🔍 Verify Everything Works

### Checklist:
- [ ] `npm run dev` starts without errors
- [ ] Browser opens to http://localhost:3000
- [ ] Redirected to http://localhost:3000/admin/dashboard
- [ ] Sidebar shows 11 navigation items
- [ ] Dark mode toggle works (in top right)
- [ ] All pages load without console errors

If any of these fail, see **Troubleshooting** section below.

---

## 📁 Project Structure Quick View

```
zota-admin-dashbaord/
├── src/
│   └── app/admin/
│       ├── dashboard/page.tsx (Home page)
│       ├── users/page.tsx (User mgmt)
│       ├── agents/page.tsx (Agent mgmt)
│       └── ... (8 more pages)
├── src/components/
│   ├── ui/ (13 reusable components)
│   ├── admin/ (Sidebar, Header, Tables, Dialogs)
│   └── providers/ (Theme provider)
├── QUICK_REFERENCE.md ⭐ (Use this daily)
├── README.md (Project overview)
├── DEVELOPMENT.md (Coding standards)
└── API_INTEGRATION.md (API details)
```

---

## 🎯 First Task Ideas

### Task 1: Explore the Dashboard
1. Start dev server: `npm run dev`
2. Click through sidebar menu
3. Click "Settings" at bottom
4. Switch dark/light mode (top right)
5. Click user profile (top right)

**Expected**: All page skeletons load, styling works, navigation works

### Task 2: Understand Components
1. Open file: `src/components/ui/button.tsx`
2. Read the code (10 lines)
3. Open file: `src/app/admin/users/page.tsx`
4. Find where Button is used
5. Open file: `src/components/admin/tables/data-table.tsx`
6. See DataTable pattern

**Expected**: Understand component composition patterns

### Task 3: Add a UI Component
1. Open file: `src/components/ui/input.tsx`
2. Copy the entire component
3. Create new file: `src/components/ui/text-area.tsx`
4. Save and verify no errors

**Expected**: Component imports work, TypeScript validates

### Task 4: Create New Page (Template)
1. Create folder: `src/app/admin/test/`
2. Create file: `src/app/admin/test/page.tsx`
3. Copy content from any other admin page
4. Update import paths
5. Visit: http://localhost:3000/admin/test

**Expected**: New page appears in browser and loads

---

## 🔧 Development Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter (check code quality)
npm run lint

# Format code
npm run format  # (if configured)

# Run tests
npm test        # (when tests are added)
```

---

## 📖 Documentation Quick Links

| Document | Purpose | Reading Time |
|---|---|---|
| **QUICK_REFERENCE.md** | 📌 Component cheat sheet | 20 min |
| **README.md** | 📖 Project overview | 10 min |
| **DEVELOPMENT.md** | 🛠️ Coding standards | 20 min |
| **ARCHITECTURE.md** | 🏗️ System design | 30 min |
| **API_INTEGRATION.md** | 🔌 Backend API guide | 30 min |
| **FILE_INVENTORY.md** | 📁 File locations | 15 min |
| **IMPLEMENTATION_CHECKLIST.md** | ✅ Task list | 20 min |
| **ONBOARDING.md** | 🎓 Team onboarding | 30 min |

**Recommended Reading Order for Developers:**
1. This file (You're reading!)
2. QUICK_REFERENCE.md (for patterns)
3. DEVELOPMENT.md (for standards)

---

## 🆘 Troubleshooting

### "npm install" fails
```bash
# Try clearing npm cache
npm cache clean --force

# Then try install again
npm install
```

### "npm run dev" fails or shows errors
```bash
# Stop the server (Ctrl+C)
# Clear next cache
rm -rf .next

# Try again
npm run dev
```

### Port 3000 already in use
```bash
# On Windows:
netstat -ano | findstr :3000
# Note the PID number, then:
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :3000
kill -9 <PID>

# Then try again
npm run dev
```

### Styles not loading / Tailwind not working
```bash
# Restart development server
# Stop: Ctrl+C
# Start: npm run dev

# If still broken, clear build cache:
rm -rf .next node_modules
npm install
npm run dev
```

### "Cannot find module" errors
```bash
# This usually means imports are wrong
# Check:
# 1. File exists in correct folder
# 2. Path is correct (relative to current file)
# 3. Extension matches (.tsx not .ts for React components)

# Restart dev server after fixing
npm run dev
```

### Dark mode isn't toggling
1. Check browser console (F12)
2. Verify `theme-provider.tsx` is in root layout
3. Verify `next-themes` is installed: `npm list next-themes`
4. Restart dev server

### Changes don't appear in browser
1. Check if save was successful (file shows saved in IDE)
2. Wait 1-2 seconds for hot reload
3. Refresh browser (F5)
4. If still not working: Stop and restart `npm run dev`

### TypeScript errors in IDE
1. These are usually type mismatches
2. Hover over red squiggles in VS Code
3. Read error message carefully
4. Check if interface matches what you're passing
5. Restart TypeScript server: Ctrl+Shift+P → "TypeScript: Restart Server"

---

## 🎓 Learning Path

### Hour 1: Setup & Overview
- [ ] Install and run project (15 min)
- [ ] Read README.md (10 min)
- [ ] Explore the dashboard in browser (15 min)
- [ ] Read QUICK_REFERENCE.md intro (20 min)

### Hour 2: Understanding Code
- [ ] Read QUICK_REFERENCE.md components section (20 min)
- [ ] Read DEVELOPMENT.md patterns (20 min)
- [ ] Open 3 existing pages and read code (20 min)

### Hour 3: Your First Contribution
- [ ] Pick task from IMPLEMENTATION_CHECKLIST.md
- [ ] Follow pattern from existing code
- [ ] Test your changes locally
- [ ] Ask for code review

---

## 🚀 Common First Tasks (Easy to Hard)

### Easy (30 min)
- [ ] Add a new UI component button variant
- [ ] Change a color or style in globals.css
- [ ] Modify an error message text
- [ ] Add a console.log for debugging

### Medium (1-2 hours)
- [ ] Create a new page by copying existing page
- [ ] Add new form field to existing dialog
- [ ] Create new column definition for a table
- [ ] Add a new navigation menu item

### Hard (2-4 hours)
- [ ] Connect a page to a mock API (use fetch)
- [ ] Create a completely new dialog component
- [ ] Implement new form validation
- [ ] Add loading states and error handling

---

## 💪 Key Things to Remember

### 1. **Use QUICK_REFERENCE.md**
Keep it open while developing. It has all the patterns you need.

### 2. **Copy, Don't Create**
Always copy an existing similar component and modify it.

### 3. **Follow Existing Patterns**
Every page/component follows the same pattern for consistency.

### 4. **Keep Components Small**
Each component does one thing. Compose them together.

### 5. **Use Tailwind Classes**
No custom CSS needed - Tailwind has everything.

### 6. **Test in Multiple Ways**
- Desktop (full screen)
- Tablet (resize to ~768px)
- Mobile (resize to ~375px)
- Dark mode (click toggle)

### 7. **Read Error Messages Carefully**
They tell you exactly what's wrong!

### 8. **Check Browser Console**
F12 → Console tab shows JavaScript errors

### 9. **Restart Dev Server When Stuck**
Often fixes mysterious issues: Ctrl+C, then `npm run dev`

### 10. **Ask Questions**
No question is dumb. Ask early, ask often!

---

## 🎯 Success Criteria

You're good to go when you can:

- [ ] Start dev server with no errors
- [ ] Navigate all 11 admin pages
- [ ] Toggle dark/light mode
- [ ] Explain what each admin section does
- [ ] Open and understand one page component
- [ ] Find where UI components are defined
- [ ] Run a linter and fix warnings
- [ ] Ask team lead a smart question

---

## 📋 Your Dev Environment Checklist

### Tools You Need
- [ ] Code editor (VS Code recommended)
- [ ] Node.js 18+ installed (check: `node --version`)
- [ ] npm 9+ installed (check: `npm --version`)
- [ ] Git (check: `git --version`)
- [ ] Browser (Chrome, Firefox, Safari, Edge)

### VS Code Extensions (Optional but helpful)
- [ ] ES7+ React/Redux Snippets
- [ ] Tailwind CSS IntelliSense
- [ ] Thunder Client or REST Client (for API testing)
- [ ] Git Graph (for Git visualization)

### Keyboard Shortcuts (VS Code)
- `Ctrl+P` - Quick file open
- `Ctrl+Shift+F` - Find in files
- `Ctrl+/` - Toggle comment
- `Alt+Shift+F` - Format document
- `F2` - Rename symbol
- `Ctrl+B` - Toggle sidebar

---

## 🔗 Useful Links

### Project Resources
- GitHub Repo: (ask tech lead)
- Slack Channel: (ask tech lead)
- Issue Tracker: (ask tech lead)

### Documentation
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Tailwind: https://tailwindcss.com
- Radix UI: https://www.radix-ui.com

### Team Docs
- All docs in root of `zota-admin-dashbaord/` folder

---

## 💬 Getting Help

### For Questions:
1. Check QUICK_REFERENCE.md
2. Search in DEVELOPMENT.md
3. Search in API_INTEGRATION.md
4. Ask team lead in chat

### For Bugs:
1. Check error in browser console (F12)
2. Read error message carefully
3. Try restarting dev server
4. Report with error message to team

### For Features:
1. Check IMPLEMENTATION_CHECKLIST.md
2. Find similar existing feature
3. Copy and modify pattern
4. Test thoroughly

---

## ✨ Next Steps

1. **Right Now:**
   - Complete the Quick Start section above (5 min)

2. **Next 30 Minutes:**
   - Read QUICK_REFERENCE.md
   - Explore admin dashboard

3. **Within 2 Hours:**
   - Read DEVELOPMENT.md
   - Pick your first task

4. **By End of Day:**
   - Complete first task
   - Submit for code review

---

## 🎉 You're Ready!

Everything is set up and ready to go. The codebase is clean, well-documented, and follows consistent patterns.

**Start with the Quick Start section above, and you'll be developing in minutes!**

If you get stuck anywhere, check the Troubleshooting section or ask your tech lead.

**Happy coding! 🚀**

---

**Last Updated**: April 2026
**Status**: ✅ Ready for Development
**Questions?**: Chat with your tech lead!
