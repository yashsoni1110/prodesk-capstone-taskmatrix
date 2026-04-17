<div align="center">

# ⚡ TaskMatrix

### **A Modern Project Management Tool for Software Teams**

*Jira/Asana-inspired Kanban workspace — built as a Capstone project*

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Zustand](https://img.shields.io/badge/Zustand-5-brown)](https://zustand-demo.pmnd.rs/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)](https://prodesk-capstone-taskmatrix.vercel.app)

**🚀 Live Demo:** [prodesk-capstone-taskmatrix.vercel.app](https://prodesk-capstone-taskmatrix.vercel.app)

</div>

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Track & Role](#-track--role)
3. [Tech Stack](#-tech-stack)
4. [Week 14 MVP — Auth & Routing](#-week-14-mvp--auth--routing)
5. [Core Features](#-core-features)
6. [UI Wireframes (Figma)](#-ui-wireframes)
7. [State Architecture Diagram](#-state-architecture-diagram)
8. [Mock API Endpoints](#-mock-api-endpoints)
9. [Data Models](#-data-models)
10. [Folder Structure](#-folder-structure)
11. [Development Timeline](#-development-timeline)
12. [Getting Started](#-getting-started)

---

## 🎯 Project Overview

**TaskMatrix** is a commercial-grade project management application inspired by tools like **Jira**, **Asana**, and **Linear**. It provides software teams with an intuitive Kanban-based workflow to organize tasks, track sprint progress, manage team members, and stay aligned on deadlines.

### Why TaskMatrix?

| Pain Point | TaskMatrix Solution |
|---|---|
| Scattered tasks across tools | Unified Kanban board with 5 status columns |
| No visibility into team workload | Dashboard with real-time stats & activity feed |
| Rigid project management tools | Drag-and-drop cards, inline editing, priority tags |
| Complex onboarding | Real Supabase auth — register and see your dashboard instantly |

### Target Users
- **Software development teams** (3–20 members)
- **Project managers** tracking sprint progress
- **Designers** collaborating on cross-functional projects
- **Freelancers** managing client deliverables

---

## 👤 Track & Role

| Field | Detail |
|---|---|
| **Track** | 🎨 **Frontend** (Track A) |
| **BaaS** | Supabase (Auth + PostgreSQL) |
| **Deployment** | Vercel (Frontend) |
| **Auth Strategy** | Supabase JS SDK v2 — localStorage session + client-side route guard |
| **Data Strategy** | Real auth (Supabase) + Mock content data (Zustand stores) for MVP |

> **Week 14 note:** Authentication is 100% real (Supabase). Content data (tasks, projects) remains mock for MVP, to be replaced with real Supabase tables in Week 15.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | File-based routing, SSR/SSG, layouts |
| **UI Library** | React 19 | Component architecture |
| **Language** | TypeScript 5 | Type safety across the codebase |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **Component Library** | shadcn/ui (Radix primitives) | Accessible, themeable UI components |
| **State Management** | Zustand 5 | Lightweight global state |
| **Auth / BaaS** | Supabase JS SDK v2 | Real user registration, login, session management |
| **Drag & Drop** | @hello-pangea/dnd | Kanban card reordering & column moves |
| **Icons** | Lucide React | Consistent, tree-shakeable icon set |
| **Theming** | next-themes | Dark / Light mode toggle with system preference |
| **Animations** | tw-animate-css | Micro-animations for UI polish |

---

## 🔐 Week 14 MVP — Auth & Routing

This section documents what was built and proven for the **Week 14 Walking Skeleton MVP**.

### What is a Walking Skeleton?
The thinnest possible version of the app that connects all major pieces end-to-end:
- User can **register** → real account created in Supabase
- User can **log in** → real session established
- User sees **their own name** on the dashboard (not "Guest" or mock data)
- Dashboard is **protected** — unauthenticated users redirected to login
- User can **sign out** → session cleared, redirected to login

### Milestone 1 — Layouts & Routing ✅

| Route | File | Description |
|---|---|---|
| `/` | `src/app/page.tsx` | Combined login/register page (tab-switched) |
| `/login` | `src/app/login/page.tsx` | Canonical redirect → `/` |
| `/register` | `src/app/register/page.tsx` | Canonical redirect → `/?mode=register` |
| `/dashboard` | `src/app/(app)/dashboard/page.tsx` | Protected — shows real user data |
| `/kanban` | `src/app/(app)/kanban/page.tsx` | Protected — Kanban board |
| `/projects` | `src/app/(app)/projects/page.tsx` | Protected — projects grid |
| `/team` | `src/app/(app)/team/page.tsx` | Protected — team members |
| `/settings` | `src/app/(app)/settings/page.tsx` | Protected — real profile editing |

### Milestone 2 — Authentication (Supabase) ✅

| Feature | Implementation |
|---|---|
| User registration | `supabase.auth.signUp({ email, password })` |
| User login | `supabase.auth.signInWithPassword({ email, password })` |
| Session persistence | Supabase stores session in localStorage automatically |
| Auth state listener | `supabase.auth.onAuthStateChange()` in `initializeAuth()` |
| Real error messages | Supabase error objects displayed in UI (wrong password, rate limit, etc.) |

### Milestone 3 — Protected Routes & Global State ✅

| Feature | Implementation |
|---|---|
| Route protection | `(app)/layout.tsx` — `useEffect` redirects to `/` if `!isAuthenticated` after `initialized` |
| Proxy/Middleware | `src/proxy.ts` — handles canonical `/login` → `/` and `/register` → `/?mode=register` |
| Global user state | Zustand `auth-store.ts` — stores `user.name`, `user.email`, `user.initials`, `supabaseUser.id` |
| Real name from email | `buildUserFromSupabase()` — derives display name from email (e.g. `john.doe@gmail.com` → "John Doe") |
| Dashboard greeting | `"Good morning, [FirstName] 👋"` — computed from real Supabase session |
| Topbar & Sidebar | Show real user name/email/initials — never "Guest" or "Alex Morgan" |
| Settings page | Profile fields pre-filled from real session; Save Changes syncs to Zustand |
| Change password | Calls `supabase.auth.updateUser({ password })` — real password update |

### How the Auth Flow Works

```
User visits /dashboard (not logged in)
        │
        ▼
(app)/layout.tsx → initializeAuth()
        │
        ▼
Supabase reads localStorage session
        │
        ├── Session found → buildUserFromSupabase() → set user in Zustand → render dashboard
        │
        └── No session → router.replace("/") → login page
```

### Environment Variables (Vercel + Local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://rvvkkgihfwgfjymgurwc.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your_publishable_key_here
```

---

## ✨ Core Features

### 🔐 Authentication & Access Control
- [x] Register with email + password (real Supabase account created)
- [x] Login with email + password (real Supabase session)
- [x] Real user name/email shown in dashboard, sidebar, topbar, settings
- [x] Route guards — unauthenticated users redirected to login
- [x] Sign out clears session and redirects
- [x] Supabase error messages shown in UI (wrong password, rate limits, etc.)
- [x] `buildUserFromSupabase()` — derives full name & initials from email for any real user
- [x] Role-based user model: `admin`, `manager`, `developer`, `designer`

### 📊 Dashboard
- [x] **4 stat cards** — Total Tasks, In Progress, Completed, Team Members (live from store)
- [x] Personalized greeting: `"Good morning, [FirstName] 👋"`
- [x] Project overview cards with progress bars (clickable → opens Kanban)
- [x] Real-time activity feed
- [x] Quick-action buttons (New Task, New Project)

### 📋 Kanban Board
- [x] **5-column board** — Backlog → To Do → In Progress → Review → Done
- [x] **Drag-and-drop** task cards between columns and within columns
- [x] Task cards showing: title, priority badge, assignee avatar, due date, tags
- [x] Color-coded priority levels: `Critical` (red), `High` (orange), `Medium` (yellow), `Low` (slate)
- [x] Create, edit, and delete tasks via dialog

### 📁 Projects Management
- [x] Projects grid with color indicators, progress bars, member avatars
- [x] **Full card click** navigates to the Kanban board
- [x] Create new projects (name, description, color, due date, custom team members)
- [x] Free-text member input — logged-in user pre-added, type any name to add more
- [x] Delete projects via dropdown menu

### 👥 Team Management
- [x] **Real users** — new registered accounts see only themselves (no fake team)
- [x] **Mock demo users** shown only when logged in as alex@taskmatrix.io
- [x] **Invite Member dialog** — name + email form, invited member appears immediately
- [x] Search team by name, role, or email
- [x] Per-member workload stats (done, active, critical tasks)

### 🔔 Notifications
- [x] Notification dropdown panel in topbar
- [x] Unread count badge
- [x] Mark individual / all as read
- [x] Dismiss and clear all notifications

### ⚙️ Settings
- [x] Profile editing — name/email pre-filled from real Supabase session
- [x] Save Changes syncs name to topbar/sidebar instantly via Zustand
- [x] Change Password — calls `supabase.auth.updateUser()` (real password change)
- [x] Role field shows real role from auth store
- [x] Theme preferences (dark/light via toggle)

---

## 🖼 UI Wireframes

> **Figma Link:** [https://www.figma.com/design/3zV5KLsWPe9ev8SFO9bcp4/capstone-project-design?node-id=2-503&t=wqZuKGeKeZHaULHE-1]

### Screen 1 — Login Page
![Login Page Wireframe](docs/wireframes/01-login-page.png)

**Key Elements:**
- Split-panel layout: brand panel (left) + form panel (right)
- Email/password form with visibility toggle
- Register tab to create a new account
- Responsive: brand panel hides on mobile

---

### Screen 2 — Dashboard
![Dashboard Wireframe](docs/wireframes/02-dashboard.png)

**Key Elements:**
- Persistent sidebar navigation (6 routes)
- Real user name in greeting header and sidebar user card
- 4 live stat cards (computed from Zustand store)
- Project cards grid with progress bars

---

### Screen 3 — Kanban Board
![Kanban Board Wireframe](docs/wireframes/03-kanban-board.png)

**Key Elements:**
- 5-column drag-and-drop board (Backlog → Done)
- Task cards with priority badges, assignee avatars, due dates
- "New Task" dialog to create tasks

---

## 🏗 State Architecture Diagram

![State Architecture Diagram](docs/state-architecture.png)

### Store Breakdown

```
Zustand Global State
├── AuthStore                           ← REAL (Supabase)
│   ├── user: User | null               ← built from Supabase session
│   ├── supabaseUser: { id, email }     ← raw Supabase user
│   ├── isAuthenticated: boolean
│   ├── initialized: boolean            ← true after first session check
│   └── Actions: login(), logout(), register(),
│                initializeAuth(), updateProfile()
│
├── TaskStore                           ← Mock data (Week 15: real Supabase)
│   ├── tasks: Task[]
│   └── Actions: addTask(), updateTask(), deleteTask(),
│                moveTask(), reorderTasks()
│
├── ProjectStore                        ← Mock data (Week 15: real Supabase)
│   ├── projects: Project[]
│   └── Actions: addProject(), updateProject(), deleteProject(),
│                addMember(), removeMember()
│
├── TeamStore                           ← Real invited members stored here
│   ├── invitedMembers: User[]
│   └── Actions: inviteMember(), removeMember(), clearInvited()
│
└── NotificationStore
    ├── notifications: Notification[]
    └── Actions: markRead(), markAllRead(),
                 dismiss(), clearAll()
```

### Selector Hooks

| Hook | Returns | Store |
|---|---|---|
| `useCurrentUser()` | Authenticated User object | AuthStore |
| `useSupabaseUser()` | Raw `{ id, email }` from Supabase | AuthStore |
| `useIsAuthenticated()` | Auth status boolean | AuthStore |
| `useTasks()` | All tasks | TaskStore |
| `useTasksByStatus(status)` | Filtered tasks by column | TaskStore |
| `useProjects()` | All projects | ProjectStore |
| `useInvitedMembers()` | Members invited this session | TeamStore |
| `useNotifications()` | All notifications | NotificationStore |
| `useUnreadCount()` | Unread notification count | NotificationStore |

---

## 🔌 Mock API Endpoints

The `src/lib/api.ts` module simulates a RESTful API with realistic delays (300ms default, 800ms for auth). This allows the UI code to remain **identical to a real API integration** — simply swap the internals for `fetch()` calls when adding a real backend.

> **Note:** Auth (`authApi`) is deprecated for direct UI use — the Supabase SDK is called directly from `auth-store.ts`. `api.ts` is kept as a reference layer for future Supabase table connectivity.

### Tasks API
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | List all tasks |
| `POST` | `/api/tasks` | Create a new task |
| `PATCH` | `/api/tasks/:id` | Update task fields |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `PATCH` | `/api/tasks/:id/move` | Move task to new column |

### Projects API
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects |
| `POST` | `/api/projects` | Create a new project |
| `PATCH` | `/api/projects/:id` | Update project |
| `DELETE` | `/api/projects/:id` | Delete a project |

### Users / Team API
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users` | List invited members |
| `POST` | `/api/users/invite` | Invite a new member |
| `DELETE` | `/api/users/:id` | Remove a member |

---

## 📐 Data Models

### User
```typescript
interface User {
  id: string;          // "u1" for mock, Supabase UUID for real users
  name: string;        // Derived from email if real user: "john.doe" → "John Doe"
  email: string;       // Real email from Supabase session
  avatar: string;      // URL or empty
  role: Role;          // "admin" | "manager" | "developer" | "designer"
  initials: string;    // Derived: "John Doe" → "JD"
}
```

### Task (mock — Week 15: connect to Supabase `tasks` table)
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;  // "backlog" | "todo" | "in-progress" | "review" | "done"
  priority: Priority;  // "low" | "medium" | "high" | "critical"
  assignee: User;
  projectId: string;
  dueDate: string;
  tags: string[];
  createdAt: string;
  comments: number;
  attachments: number;
}
```

### Project (mock — Week 15: connect to Supabase `projects` table)
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  color: string;       // hex color for card accent
  progress: number;    // 0-100
  taskCount: number;
  members: User[];     // custom members added by the user
  createdAt: string;
  dueDate: string;
}
```

---

## 📂 Folder Structure

```
prodesk-capstone-taskmatrix/
├── docs/
│   ├── wireframes/
│   │   ├── 01-login-page.png
│   │   ├── 02-dashboard.png
│   │   └── 03-kanban-board.png
│   └── state-architecture.png
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (app)/                    # Protected route group
│   │   │   ├── dashboard/page.tsx    # Dashboard with real greeting + stats
│   │   │   ├── kanban/page.tsx       # Kanban board with drag-and-drop
│   │   │   ├── projects/page.tsx     # Project grid (clickable cards)
│   │   │   ├── team/page.tsx         # Team — shows real user or mock demo
│   │   │   ├── activity/page.tsx     # Activity feed log
│   │   │   ├── settings/page.tsx     # Real profile + Change Password
│   │   │   └── layout.tsx            # Auth guard (initializeAuth + redirect)
│   │   ├── login/page.tsx            # Canonical redirect → /
│   │   ├── register/page.tsx         # Canonical redirect → /?mode=register
│   │   ├── page.tsx                  # Login/Register combined page (Supabase auth)
│   │   ├── layout.tsx                # Root layout (theme provider, fonts)
│   │   └── globals.css               # Tailwind config + CSS variables
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives
│   │   ├── sidebar.tsx               # Sidebar with real user card
│   │   ├── topbar.tsx                # Topbar with real user avatar/name
│   │   ├── invite-member-dialog.tsx  # Invite member form (name + email)
│   │   ├── new-project-dialog.tsx    # Create project (free-text member input)
│   │   ├── new-task-dialog.tsx       # Create task form modal
│   │   ├── edit-task-dialog.tsx      # Edit task form modal
│   │   ├── notifications-panel.tsx   # Notification dropdown panel
│   │   ├── live-dashboard-stats.tsx  # Animated stat cards
│   │   ├── task-badges.tsx           # Priority & status badge components
│   │   ├── theme-toggle.tsx          # Dark/Light mode switch
│   │   └── theme-provider.tsx        # next-themes provider wrapper
│   ├── store/
│   │   ├── index.ts                  # Central re-export barrel
│   │   ├── auth-store.ts             # Real Supabase auth + Zustand state
│   │   ├── task-store.ts             # Task CRUD + drag-and-drop
│   │   ├── project-store.ts          # Project CRUD + custom members
│   │   ├── team-store.ts             # Invited members state
│   │   └── notification-store.ts     # In-app notifications
│   ├── lib/
│   │   ├── data.ts                   # Type definitions + mock data
│   │   ├── api.ts                    # Mock API reference layer
│   │   ├── supabase.ts               # Supabase client (createClient)
│   │   └── utils.ts                  # Utility functions (cn helper)
│   └── proxy.ts                      # Next.js 16 middleware (route redirects)
├── AGENTS.md                         # AI coding assistant rules
├── prompts.md                        # Prompts used during development
├── video-script.md                   # Demo video script
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📅 Development Timeline

| Week | Phase | Status | Deliverables |
|---|---|---|---|
| **Week 13** | 📐 Planning & Design | ✅ Done | PRD (README), Wireframes, State Architecture Diagram |
| **Week 14** | 🏗 MVP / Walking Skeleton | ✅ Done | Supabase auth, protected routes, real user profile, deployed to Vercel |
| **Week 15** | ✅ Real CRUD Features | 🔜 Next | Connect tasks/projects to Supabase tables, real team management |
| **Week 16** | 🤖 AI & Polish | 🔜 Upcoming | AI task suggestions, animations, profile photos |
| **Week 17** | 🚀 Final Deployment | 🔜 Upcoming | Final QA, demo video, presentation |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- A **Supabase** project (or use the existing one via env vars)

### Installation

```bash
# Clone the repository
git clone https://github.com/yashsoni1110/prodesk-capstone-taskmatrix.git
cd prodesk-capstone-taskmatrix

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Add your Supabase URL and key

# Start the development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=your_publishable_anon_key
```

Open [http://localhost:3000](http://localhost:3000) — register a new account or use the demo below.

### Demo Credentials (Mock User)

| Field | Value |
|---|---|
| Email | `alex@taskmatrix.io` |
| Password | *(set in your Supabase dashboard)* |

> **New users:** Register with any email at [http://localhost:3000](http://localhost:3000) — a real Supabase account will be created and you'll land on your personal dashboard.

---

<div align="center">

**Built with ❤️ as a Capstone Project — Week 14 MVP Complete**

*TaskMatrix — Ship faster with clarity.*

[![Deploy with Vercel](https://vercel.com/button)](https://prodesk-capstone-taskmatrix.vercel.app)

</div>
