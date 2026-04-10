"use client";

import { useRef, useEffect } from "react";
import { Bell, X, CheckCheck, Trash2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useUnreadCount,
  useNotificationStore,
} from "@/store/notification-store";

const TYPE_STYLES = {
  task:    { dot: "bg-violet-500", ring: "bg-violet-500/15" },
  comment: { dot: "bg-blue-500",   ring: "bg-blue-500/15"   },
  project: { dot: "bg-emerald-500",ring: "bg-emerald-500/15"},
  member:  { dot: "bg-amber-500",  ring: "bg-amber-500/15"  },
};

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

export function NotificationsPanel({ open, onClose, anchorRef }: NotificationsPanelProps) {
  const notifications = useNotifications();
  const unread = useUnreadCount();
  const { markRead, markAllRead, dismiss, clearAll } = useNotificationStore();
  const panelRef = useRef<HTMLDivElement>(null);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current?.contains(e.target as Node) ||
        anchorRef.current?.contains(e.target as Node)
      )
        return;
      onClose();
    };
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handler);
    };
  }, [open, onClose, anchorRef]);

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-[360px] rounded-xl border border-border/70 bg-popover shadow-2xl z-[200] overflow-hidden"
      id="notifications-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
          <span className="text-[13px] font-semibold">Notifications</span>
          {unread > 0 && (
            <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors px-1.5 py-1 rounded-md hover:bg-primary/10"
              id="mark-all-read-btn"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors px-1.5 py-1 rounded-md hover:bg-destructive/10"
              id="clear-notifications-btn"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-border/30">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Info className="w-5 h-5" />
            </div>
            <p className="text-[13px]">No notifications</p>
          </div>
        ) : (
          notifications.map((n) => {
            const style = TYPE_STYLES[n.type];
            return (
              <div
                key={n.id}
                className={cn(
                  "group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/40",
                  !n.read && "bg-primary/[0.03]"
                )}
                onClick={() => markRead(n.id)}
                id={`notification-${n.id}`}
              >
                {/* Avatar */}
                <div className={`relative shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${n.avatarGrad} flex items-center justify-center text-[10px] font-bold text-white mt-0.5`}>
                  {n.avatar}
                  {!n.read && (
                    <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${style.dot} border-2 border-popover`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[12px] leading-snug", !n.read ? "font-semibold" : "font-medium text-muted-foreground")}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5 leading-relaxed">
                    {n.body}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    <span className="text-[10px] text-muted-foreground/60">{n.time}</span>
                  </div>
                </div>

                {/* Dismiss */}
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-border/60 px-4 py-2.5 text-center">
          <a href="/activity" onClick={onClose} className="text-[12px] text-primary hover:underline underline-offset-2">
            View all activity
          </a>
        </div>
      )}
    </div>
  );
}
