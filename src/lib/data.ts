// ─── Types ────────────────────────────────────────────────────────────────────

export type Priority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "backlog" | "todo" | "in-progress" | "review" | "done";
export type Role = "admin" | "manager" | "developer" | "designer";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: User;
  projectId: string;
  dueDate: string;
  tags: string[];
  createdAt: string;
  comments: number;
  attachments: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  progress: number;
  taskCount: number;
  members: User[];
  createdAt: string;
  dueDate: string;
}

export interface ActivityItem {
  id: string;
  user: User;
  action: string;
  target: string;
  time: string;
  type: "task" | "comment" | "project" | "member";
}

// ─── Mock Users ───────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Alex Morgan",
    email: "alex@taskmatrix.io",
    avatar: "",
    initials: "AM",
    role: "admin",
  },
  {
    id: "u2",
    name: "Priya Sharma",
    email: "priya@taskmatrix.io",
    avatar: "",
    initials: "PS",
    role: "manager",
  },
  {
    id: "u3",
    name: "James Liu",
    email: "james@taskmatrix.io",
    avatar: "",
    initials: "JL",
    role: "developer",
  },
  {
    id: "u4",
    name: "Sofia Chen",
    email: "sofia@taskmatrix.io",
    avatar: "",
    initials: "SC",
    role: "designer",
  },
  {
    id: "u5",
    name: "Marcus Webb",
    email: "marcus@taskmatrix.io",
    avatar: "",
    initials: "MW",
    role: "developer",
  },
];

// ─── Mock Projects ────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "TaskMatrix Web App",
    description: "Core SaaS platform — Kanban, auth, and dashboard",
    color: "#7c3aed",
    progress: 68,
    taskCount: 24,
    members: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2], MOCK_USERS[3]],
    createdAt: "2024-12-01",
    dueDate: "2025-05-30",
  },
  {
    id: "p2",
    name: "Mobile App (React Native)",
    description: "Cross-platform mobile companion app",
    color: "#0891b2",
    progress: 31,
    taskCount: 17,
    members: [MOCK_USERS[2], MOCK_USERS[4]],
    createdAt: "2025-01-15",
    dueDate: "2025-07-01",
  },
  {
    id: "p3",
    name: "Design System v2",
    description: "Revamped component library and style guide",
    color: "#be185d",
    progress: 85,
    taskCount: 12,
    members: [MOCK_USERS[1], MOCK_USERS[3]],
    createdAt: "2024-11-10",
    dueDate: "2025-04-20",
  },
  {
    id: "p4",
    name: "AI Integration Sprint",
    description: "GPT-powered task suggestions and auto-summaries",
    color: "#15803d",
    progress: 12,
    taskCount: 8,
    members: [MOCK_USERS[0], MOCK_USERS[2], MOCK_USERS[4]],
    createdAt: "2025-03-01",
    dueDate: "2025-06-15",
  },
];

// ─── Mock Tasks ───────────────────────────────────────────────────────────────

export const MOCK_TASKS: Task[] = [
  // Backlog
  {
    id: "t1",
    title: "Define onboarding flow wireframes",
    description: "Create low-fi wireframes for new user onboarding experience",
    status: "backlog",
    priority: "medium",
    assignee: MOCK_USERS[3],
    projectId: "p1",
    dueDate: "2025-05-10",
    tags: ["design", "ux"],
    createdAt: "2025-04-01",
    comments: 3,
    attachments: 1,
  },
  {
    id: "t2",
    title: "Research competitor pricing models",
    description: "Analyze top 5 competitors pricing & tier structure",
    status: "backlog",
    priority: "low",
    assignee: MOCK_USERS[1],
    projectId: "p1",
    dueDate: "2025-05-20",
    tags: ["research", "strategy"],
    createdAt: "2025-04-02",
    comments: 0,
    attachments: 0,
  },
  // Todo
  {
    id: "t3",
    title: "Implement JWT authentication",
    description: "Set up access + refresh token strategy for auth flow",
    status: "todo",
    priority: "high",
    assignee: MOCK_USERS[2],
    projectId: "p1",
    dueDate: "2025-04-18",
    tags: ["backend", "security"],
    createdAt: "2025-04-03",
    comments: 5,
    attachments: 2,
  },
  {
    id: "t4",
    title: "Build notification system",
    description: "Real-time in-app notifications using polling",
    status: "todo",
    priority: "medium",
    assignee: MOCK_USERS[4],
    projectId: "p1",
    dueDate: "2025-04-25",
    tags: ["frontend", "feature"],
    createdAt: "2025-04-04",
    comments: 2,
    attachments: 0,
  },
  {
    id: "t5",
    title: "Set up CI/CD pipeline",
    description: "GitHub Actions workflow for lint, test, deploy",
    status: "todo",
    priority: "high",
    assignee: MOCK_USERS[0],
    projectId: "p1",
    dueDate: "2025-04-15",
    tags: ["devops", "automation"],
    createdAt: "2025-04-05",
    comments: 1,
    attachments: 1,
  },
  // In Progress
  {
    id: "t6",
    title: "Kanban board drag-and-drop",
    description: "Implement @hello-pangea/dnd for card reordering across columns",
    status: "in-progress",
    priority: "critical",
    assignee: MOCK_USERS[2],
    projectId: "p1",
    dueDate: "2025-04-12",
    tags: ["frontend", "core"],
    createdAt: "2025-04-01",
    comments: 8,
    attachments: 3,
  },
  {
    id: "t7",
    title: "Dashboard analytics charts",
    description: "Velocity chart, burn-down, and task completion graphs",
    status: "in-progress",
    priority: "medium",
    assignee: MOCK_USERS[1],
    projectId: "p1",
    dueDate: "2025-04-14",
    tags: ["frontend", "analytics"],
    createdAt: "2025-04-02",
    comments: 4,
    attachments: 1,
  },
  // Review
  {
    id: "t8",
    title: "User profile settings page",
    description: "Name, avatar, password change, and notification preferences",
    status: "review",
    priority: "medium",
    assignee: MOCK_USERS[3],
    projectId: "p1",
    dueDate: "2025-04-11",
    tags: ["frontend", "ui"],
    createdAt: "2025-03-28",
    comments: 6,
    attachments: 2,
  },
  {
    id: "t9",
    title: "Write API documentation",
    description: "OpenAPI spec for all REST endpoints",
    status: "review",
    priority: "low",
    assignee: MOCK_USERS[4],
    projectId: "p1",
    dueDate: "2025-04-13",
    tags: ["docs"],
    createdAt: "2025-04-01",
    comments: 2,
    attachments: 0,
  },
  // Done
  {
    id: "t10",
    title: "Initial project scaffolding",
    description: "Next.js + Tailwind + shadcn/ui setup",
    status: "done",
    priority: "high",
    assignee: MOCK_USERS[0],
    projectId: "p1",
    dueDate: "2025-04-05",
    tags: ["devops", "setup"],
    createdAt: "2025-03-25",
    comments: 3,
    attachments: 1,
  },
  {
    id: "t11",
    title: "Database schema design",
    description: "ERD for Users, Projects, Tasks, and Activity",
    status: "done",
    priority: "critical",
    assignee: MOCK_USERS[0],
    projectId: "p1",
    dueDate: "2025-04-03",
    tags: ["backend", "database"],
    createdAt: "2025-03-22",
    comments: 10,
    attachments: 4,
  },
];

// ─── Mock Activity Feed ───────────────────────────────────────────────────────

export const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: "a1",
    user: MOCK_USERS[2],
    action: "moved task to",
    target: "In Progress · Kanban drag-and-drop",
    time: "2 min ago",
    type: "task",
  },
  {
    id: "a2",
    user: MOCK_USERS[1],
    action: "commented on",
    target: "Dashboard analytics charts",
    time: "15 min ago",
    type: "comment",
  },
  {
    id: "a3",
    user: MOCK_USERS[3],
    action: "completed task",
    target: "User profile settings page",
    time: "1h ago",
    type: "task",
  },
  {
    id: "a4",
    user: MOCK_USERS[0],
    action: "added member to",
    target: "AI Integration Sprint",
    time: "2h ago",
    type: "member",
  },
  {
    id: "a5",
    user: MOCK_USERS[4],
    action: "created task",
    target: "Build notification system",
    time: "3h ago",
    type: "task",
  },
  {
    id: "a6",
    user: MOCK_USERS[1],
    action: "updated project",
    target: "Design System v2",
    time: "5h ago",
    type: "project",
  },
];

// ─── Kanban columns ───────────────────────────────────────────────────────────

export const KANBAN_COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "bg-slate-500" },
  { id: "todo", label: "To Do", color: "bg-blue-500" },
  { id: "in-progress", label: "In Progress", color: "bg-violet-500" },
  { id: "review", label: "Review", color: "bg-amber-500" },
  { id: "done", label: "Done", color: "bg-emerald-500" },
];
