import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "task" | "comment" | "project" | "member";
  time: string;
  read: boolean;
  avatar: string;
  avatarGrad: string;
}

interface NotificationStore {
  notifications: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
  addNotification: (n: Omit<Notification, "id" | "read">) => void;
}

const INITIAL: Notification[] = [
  {
    id: "n1",
    title: "Task assigned to you",
    body: "James Liu assigned the task 'Implement JWT authentication' to you.",
    type: "task",
    time: "2 min ago",
    read: false,
    avatar: "JL",
    avatarGrad: "from-emerald-500 to-teal-600",
  },
  {
    id: "n2",
    title: "New comment",
    body: "Priya Sharma commented on Dashboard analytics charts.",
    type: "comment",
    time: "15 min ago",
    read: false,
    avatar: "PS",
    avatarGrad: "from-blue-500 to-cyan-600",
  },
  {
    id: "n3",
    title: "Task moved to Done",
    body: "Sofia Chen completed the User profile settings page task.",
    type: "task",
    time: "1h ago",
    read: false,
    avatar: "SC",
    avatarGrad: "from-pink-500 to-rose-600",
  },
  {
    id: "n4",
    title: "New project created",
    body: "Marcus Webb created AI Integration Sprint and added you as a member.",
    type: "project",
    time: "2h ago",
    read: true,
    avatar: "MW",
    avatarGrad: "from-emerald-500 to-teal-600",
  },
  {
    id: "n5",
    title: "Team invite accepted",
    body: "Marcus Webb has joined your workspace.",
    type: "member",
    time: "5h ago",
    read: true,
    avatar: "MW",
    avatarGrad: "from-emerald-500 to-teal-600",
  },
];

let _nId = INITIAL.length + 1;

export const useNotificationStore = create<NotificationStore>()((set) => ({
  notifications: INITIAL,

  markRead(id) {
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllRead() {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  dismiss(id) {
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll() {
    set({ notifications: [] });
  },

  addNotification(n) {
    const newN: Notification = { ...n, id: `n${_nId++}`, read: false };
    set((s) => ({ notifications: [newN, ...s.notifications] }));
  },
}));

export const useNotifications = () =>
  useNotificationStore((s) => s.notifications);

export const useUnreadCount = () =>
  useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
