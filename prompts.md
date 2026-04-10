# Prompts Used During Development

These are the AI prompts I used for help while building TaskMatrix, ordered roughly from project start to UI polish.

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

> I need a team store similar to my other stores. It should manage team members (extending User with joinedAt and status fields). Actions needed: inviteMember, removeMember, updateRole, updateStatus. Initialize from MOCK_USERS.

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
