# Prompts Used During Development

These are the AI prompts I used for help while building TaskMatrix, ordered from project start through Week 14 MVP completion.

---

### 1. Mock data structure

> Can you help me create mock data for a project management app? I need TypeScript interfaces and sample data for:
> - Users (5 users with id, name, email, avatar, role like admin/manager/developer/designer)
> - Tasks (11 tasks spread across 5 statuses: backlog, todo, in-progress, review, done — each with title, description, priority, assignee, projectId, dueDate, tags)
> - Projects (4 projects with name, description, color, progress percentage, members)
> - Notifications (5 notifications with different types: task, comment, project, member)
> - Activity items (8 recent activity entries)

---

### 2. Setting up Zustand stores

> How do I create a Zustand store in a Next.js 16 app with React 19? I need a task store that holds an array of tasks and supports add, update, delete, and move operations. Also need selector hooks like `useTasks()` and `useTasksByStatus(status)` to avoid unnecessary re-renders. Should I use persist middleware or not?

---

### 3. Project store with member management

> Help me create a Zustand project store (project-store.ts) similar to my task store. It should manage an array of projects and support:
> - addProject, updateProject, deleteProject
> - addMember(projectId, userId) and removeMember(projectId, userId)
> - Selector hooks: useProjects(), useProject(id), useProjectActions()
> - Initialize with mock projects from my data.ts file

---

### 4. Notification store

> I need a Zustand notification store for in-app notifications. It should have:
> - notifications array initialized from mock data
> - markRead(id), markAllRead(), dismiss(id), clearAll()
> - addNotification() to push new ones
> - useNotifications() and useUnreadCount() selector hooks

---

### 5. Team store

> I need a team store similar to my other stores. It should manage invited team members as User objects. Actions needed: inviteMember({ name, email }), removeMember(id), clearInvited(). Export useInvitedMembers() selector hook.

---

### 6. Auth store without persist

> Create an auth store with Zustand for my Next.js app. State should have user, isAuthenticated, and isLoading. The login function should match email against my MOCK_USERS array (no real backend). Don't use persist middleware — it causes hydration mismatches with Next.js SSR. Export hooks: useCurrentUser(), useIsAuthenticated()

---

### 7. Barrel exports for stores

> What's the best pattern for re-exporting multiple Zustand stores from a single index.ts file? I have 5 stores (auth, task, project, team, notification) each with their own selector hooks. I want to import everything from `@/store` instead of individual files.

---

### 8. Mock API service layer

> How do I create a mock API layer for a frontend-only app? I want to simulate REST API calls with fake delays so my UI code looks like it's talking to a real backend. The functions should wrap my Zustand store actions with `await delay(300)`. I need mock endpoints for auth, tasks, projects, and users. The idea is I can swap these with real fetch() calls later when I add a backend.

---

### 9. Route protection in Next.js App Router

> How to protect routes in Next.js 16 App Router? I have a route group `(app)` with dashboard, kanban, projects, etc. I want to redirect to the login page if the user is not authenticated. I'm using Zustand for auth state (not NextAuth). Should I check in the layout.tsx of the route group?

---

### 10. Login page split-panel layout

> I want to build a login page with a split-panel design — brand panel on the left with a gradient background, logo, tagline, feature list, and a testimonial card. The right side has the sign-in form with OAuth buttons (GitHub, Google), email/password inputs, and demo credentials hint. The brand panel should hide on mobile. How to structure this with Tailwind CSS?

---

### 11. CSS variables for dark/light theme

> What's the best way to set up dark and light mode CSS variables in Tailwind CSS 4 for a Next.js app using next-themes? I want to define background, foreground, card, primary, muted, border colors as CSS variables and have them switch automatically with the theme class.

---

### 12. Dark/light theme toggle component

> How to build a theme toggle button in Next.js using next-themes? I want a Sun/Moon icon button that switches between light, dark, and system themes. It should work with my Tailwind CSS variable-based theme setup and not cause hydration errors.

---

### 13. Sidebar navigation component

> Help me build a collapsible sidebar for my Next.js app. It should have a logo at the top, grouped navigation links (Main: Dashboard, Tasks; Workspace: Projects, Team, Activity; Other: Settings), badge counts on some items, and a user card at the bottom showing name, email, and avatar. On mobile it should collapse into a hamburger menu using a Sheet/drawer component.

---

### 14. Topbar with search and notifications

> Build a topbar component with: a search input on the left, notification bell icon with unread count badge, theme toggle button, and user avatar with a dropdown menu (Profile, Settings, Logout). The notification bell should open a dropdown panel showing the list of notifications.

---

### 15. Notification dropdown panel

> Help me build a notification dropdown panel that opens when clicking the bell icon in the topbar. It should show a list of notifications with avatar, title, body text, timestamp, and read/unread state. Include "Mark all as read" and "Clear all" buttons at the top. Each notification should have a dismiss button on hover.

---

### 16. Live dashboard stats from Zustand

> I want to show live stat cards on my dashboard that compute values directly from my Zustand stores — like total tasks, completed tasks, in-progress count, and team member count. How do I derive these values using selectors without causing re-render issues? Also want a count-up animation when the numbers load.

---

### 17. Task card design for Kanban

> How should I design a task card component for a Kanban board? Each card needs to show: priority badge (color-coded: critical=red, high=orange, medium=yellow, low=slate), task title, tag pills, due date, comment count, attachment count, and an assignee avatar. Also need a three-dot menu with Edit/Delete options. Using Tailwind CSS and shadcn/ui.

---

### 18. Priority and status badges

> Create reusable badge components for task priority and status. Priority badges should be color-coded (Critical = red, High = orange, Medium = yellow, Low = slate). Status badges should match column colors (Backlog = gray, To Do = blue, In Progress = amber, Review = purple, Done = green). Using shadcn/ui Badge with custom variants.

---

### 19. Drag and drop for Kanban board

> How to implement drag and drop in React 19 with Next.js? I'm building a Kanban board with 5 columns (Backlog, To Do, In Progress, Review, Done). I want to use @hello-pangea/dnd. Need help with:
> - Setting up DragDropContext, Droppable, and Draggable
> - Handling same-column reorder vs cross-column move
> - Updating my Zustand task store on drag end

---

### 20. Responsive Kanban board layout

> My Kanban board has 5 columns but they overflow on smaller screens. How do I make it scroll horizontally on mobile while keeping each column a minimum width? Also the column headers should be sticky. Using Tailwind CSS and flexbox/grid.

---

### 21. shadcn/ui Dialog for task creation form

> Help me build a dialog/modal form for creating a new task using shadcn/ui Dialog component. The form should have fields for: title, description, status dropdown, priority dropdown, assignee dropdown (from team members), project dropdown, due date, and tags. It should call my taskStore.addTask() on submit and close the dialog.

---

### 22. Settings page with tabs

> I need a settings page with a tabbed layout using shadcn/ui Tabs component. Three tabs: Profile (name, email fields with save button), Workspace (app preferences), and Notifications (toggle switches for different notification types). The Profile tab should connect to my auth store's updateProfile function.

---

## 🔐 Week 14 — Supabase Auth & MVP

### 23. Connecting Supabase auth to Next.js

> I want to replace my mock auth store with real Supabase authentication in Next.js 16. I'm using @supabase/supabase-js v2 (not @supabase/ssr). How do I:
> - Create a supabase client in src/lib/supabase.ts
> - Update my Zustand auth store to call supabase.auth.signUp() and signInWithPassword()
> - Set up onAuthStateChange() to keep the store in sync with the Supabase session
> - Keep it SSR-safe (session in localStorage, not cookies)

---

### 24. Building real user profile from Supabase session

> When a new user registers with Supabase, I only get their email and a UUID — no name. I want to build a `buildUserFromSupabase()` helper that creates a proper User object for my Zustand store from just the email. For example, `john.doe@gmail.com` should become name "John Doe" with initials "JD". Priority: if the email matches a MOCK_USER, use their full profile. Otherwise derive from email.

---

### 25. Fixing the proxy/middleware redirect loop

> My Next.js 16 app has a proxy.ts (middleware) that was checking for Supabase auth cookies to protect routes, but Supabase JS v2 stores sessions in localStorage, not cookies. This caused a redirect loop where authenticated users were being sent back to /login. How do I fix this? Should I remove the cookie check from middleware and handle route protection client-side instead?

---

### 26. Client-side route guard with Supabase localStorage session

> How do I protect Next.js App Router routes using client-side state, not middleware? I have a `(app)/layout.tsx` that wraps all my protected pages. I want it to call `supabase.auth.getSession()` (or my Zustand initializeAuth function) on mount, wait for the result, then redirect to `/` if the user isn't authenticated. I need to show a loading spinner while checking to prevent a flash of the protected page.

---

### 27. Settings page with real Supabase profile data

> My settings page currently has hardcoded "Alex Morgan" as the default name. I want to update it to:
> - Pre-fill name and email fields from the real logged-in Supabase user (from my Zustand auth store)
> - Use useEffect to sync fields if the store loads after component mount
> - Wire "Save Changes" to call updateProfile() in my auth store so topbar updates immediately
> - Wire "Change Password" to call supabase.auth.updateUser({ password: newPw }) — re-authenticate first with current password

---

### 28. Team page — show real user only for new registrations

> My team page was showing 5 hardcoded mock users for everyone. I want to change it so:
> - If logged in as one of the mock demo users (alex@taskmatrix.io etc.) → show the full mock team (for demo purposes)
> - If logged in as any real new registered user → show only themselves ("Just you for now" empty state)
> - Invited members (via InviteDialog) → always shown in team list regardless

---

### 29. Invite Member dialog with Zustand team store

> I want an "Invite Member" button in my team page that opens a dialog. The dialog should:
> - Have a name field and email field (with validation)
> - On submit, call a `team-store.inviteMember({ name, email })` function that builds a User object with derived initials
> - Show a success screen with the person's name after invite
> - The invited member should appear immediately in the team list

---

### 30. New Project dialog with custom free-text member input

> My New Project dialog currently shows 5 MOCK_USERS as selectable chip buttons. I want to change this to a free-text input where:
> - The logged-in user is pre-added automatically as the first member (cannot be removed)
> - The user can type any name and click "Add" or press Enter to add a custom team member
> - Each added member shows as a removable chip with their initial as avatar
> - The project-store's addProject() should accept a direct members[] array instead of only memberIds[]

---

### 31. Making project cards clickable

> My project cards on the /projects page have an "Open Board" button but clicking anywhere else on the card does nothing. I want:
> - The entire card to navigate to /kanban when clicked (using router.push)
> - The three-dot dropdown menu trigger to stopPropagation() so it doesn't also navigate
> - The dropdown menu items to use onSelect + router.push instead of Link inside DropdownMenuItem
> - The "Open Board" button to also stopPropagation and navigate independently

---

### 32. Fixing TypeScript build errors for Vercel deployment

> My Vercel deployment is failing with TypeScript errors. The error is in src/lib/api.ts: "Property 'members' does not exist on type 'TeamStore'" and in src/store/index.ts: "Module team-store has no exported member useTeamMembers". My team store was refactored and now uses `invitedMembers` instead of `members`, and removed useTeamMembers/useTeamActions hooks. How do I fix the barrel file and api.ts to match the new store shape?

---

## 🗄️ Week 15 — Full CRUD & Supabase Database

### 33. Supabase database helpers for tasks

> I need a db-tasks.ts file that contains 4 functions wrapping Supabase queries:
> - `fetchTasksFromDB(userId)` — SELECT * FROM tasks WHERE user_id = userId ORDER BY created_at
> - `createTaskInDB(userId, task)` — INSERT and return the generated UUID
> - `updateTaskInDB(taskId, changes)` — PATCH only the fields that are provided (not undefined)
> - `deleteTaskFromDB(taskId)` — DELETE WHERE id = taskId
> Also need a `rowToTask()` mapper function that converts the Supabase row shape to my frontend Task interface (snake_case → camelCase).

---

### 34. Supabase database helpers for projects

> Same pattern as db-tasks.ts but for projects. I need db-projects.ts with:
> - `fetchProjectsFromDB(userId)` — SELECT * FROM projects WHERE user_id = userId
> - `createProjectInDB(userId, project)` — INSERT and return UUID
> - `updateProjectInDB(projectId, changes)` — PATCH only changed fields
> - `deleteProjectFromDB(projectId)` — DELETE
> Include a `rowToProject()` mapper. The project table has: id, user_id, name, description, color, progress, due_date, created_at.

---

### 35. Connecting Zustand task store to Supabase

> I have db-tasks.ts with 4 database functions. Now I need to update my Zustand task-store.ts to call them. Add a `fetchTasks(userId)` action that calls fetchTasksFromDB and sets the tasks array. Update `addTask()` to call createTaskInDB and replace the temp ID with the DB-generated UUID. Update `updateTask()` to call updateTaskInDB in the background. Update `deleteTask()` to call deleteTaskFromDB. The UI should update optimistically (before DB call) for the best UX.

---

### 36. Connecting Zustand project store to Supabase

> Same as task store but for projects. Update project-store.ts to add `fetchProjects(userId)`, and wire addProject / updateProject / deleteProject to call the corresponding db-projects.ts functions. Use optimistic updates so the UI updates instantly without waiting for Supabase to respond.

---

### 37. Edit Project dialog with pre-filled form

> Build an EditProjectDialog component using shadcn/ui Dialog. It should:
> - Accept a `project: Project | null` prop
> - Use useEffect to pre-fill name, description, color, dueDate whenever the project prop changes
> - Show a color picker grid (8 preset colors) and a date input
> - On submit, call updateProject() from the project store and close the dialog
> - The parent passes `editProject` state and `setEditProject(null)` as close handler

---

### 38. Edit Task dialog with pre-filled form

> Build an EditTaskDialog component similar to NewTaskDialog but for editing. It should:
> - Accept `task: Task | null` prop
> - Pre-fill all fields (title, description, status, priority, dueDate, tags) from the task object
> - Use the same form layout as NewTaskDialog
> - On submit, call updateTask(task.id, changes) from task store
> - Tags input should allow adding/removing tags as chips

---

### 39. Reusable ConfirmDeleteDialog component

> I need a reusable confirmation dialog for delete operations. It should:
> - Accept `open`, `onClose`, `onConfirm`, `title`, `description` props
> - Show a warning icon, customizable title and description text
> - Have a Cancel button and a red "Delete" button
> - Show a loading spinner on the Delete button while `onConfirm` is awaiting
> - Work for both task and project deletions

---

### 40. Project card dropdown menu — Edit and Delete

> My project cards on /projects need a ⋯ (MoreHorizontal) dropdown menu. The menu should have:
> - "Open Board" → router.push("/kanban")
> - "Edit project…" → sets editProject state to open EditProjectDialog
> - "Delete project…" → sets confirmDeleteId to open ConfirmDeleteDialog
> The key challenge: the card itself also navigates on click. I need the dropdown area to stopPropagation so clicking Edit/Delete doesn't also navigate. Wrap the entire badge+dropdown div in onClick stopPropagation.

---

### 41. Team member Edit and Remove with dropdown menu

> Update my team page to add a per-member ⋯ dropdown menu with:
> - "Edit member" → opens EditMemberDialog with pre-filled name, role, email fields
> - "Remove member" → opens ConfirmDeleteDialog before removing
> The EditMemberDialog should call `updateMember(id, { name, role, email })` from team-store. Add an `updateMember` action to the team store. Admin users cannot be removed (hide remove option or disable it).

---

### 42. Live sidebar badge counts from Zustand stores

> The sidebar navigation shows hardcoded badge counts (Tasks: "11", Projects: "4"). These never update when I add or delete items. Fix this by:
> - Moving navGroups array INSIDE the NavLinks component (not a module-level constant)
> - Calling useTasks().length and useProjects().length inside NavLinks
> - Setting badge: taskCount > 0 ? String(taskCount) : undefined
> This makes the badges reactive — they update instantly when the Zustand stores change.

---

### 43. Analytics chart with Recharts AreaChart

> Build an AnalyticsChart component using Recharts. It should show:
> 1. An AreaChart with gradient fills showing tasks by day of week (Mon-Sun). Use .reduce() to bucket tasks by their createdAt day. Show 3 areas: total, in-progress (violet), done (green).
> 2. A status distribution section showing % of tasks in each status as colored progress bars.
> 3. A priority breakdown grid with 4 mini cards: Critical, High, Medium, Low — each showing the count.
> Use the Recharts ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip components. Add gradient defs for each area fill.

---

### 44. Fix project card date format

> My project cards show the raw ISO date "2025-05-30" in the footer. I want it to show "Due May 30, 2025" instead. Fix the template literal to use:
> ```tsx
> project.dueDate
>   ? `Due ${new Date(project.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
>   : "No due date"
> ```

---

### 45. Make project card ⋯ menu button discoverable

> The ⋯ menu trigger on project cards uses `opacity-0 group-hover:opacity-100` which makes it completely invisible until hover. This makes it hard for users to discover. Change it to `opacity-30 group-hover:opacity-100` so there's always a faint hint of the button, and it becomes fully visible on hover.

---

### 46. Kill stuck Next.js dev server and restart cleanly

> My terminal shows "Another next dev server is already running on port 3000 with PID 21320". How do I kill it and restart? On Windows PowerShell:
> ```powershell
> Stop-Process -Id 21320 -Force -ErrorAction SilentlyContinue
> Start-Sleep 2
> npm run dev
> ```
> Or to kill ALL node processes: `taskkill /F /IM node.exe`

---

### 47. Commit and deploy all Week 15 changes to Vercel

> I've finished all my Week 15 CRUD features. How do I commit everything and deploy to Vercel?
> ```bash
> git add .
> git commit -m "feat(week15): full CRUD with Supabase, Recharts analytics, live sidebar counts"
> git push
> ```
> If Vercel is connected to GitHub it auto-deploys on push. For first-time setup: run `vercel --prod` or go to vercel.com/new and import the GitHub repo. Remember to add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY as environment variables in the Vercel dashboard.

---
