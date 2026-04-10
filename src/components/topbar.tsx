"use client";

import { useRef, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Bell, Search, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { NotificationsPanel } from "@/components/notifications-panel";
import { useUnreadCount } from "@/store/notification-store";

interface TopbarProps {
  mobileTrigger?: React.ReactNode;
}

export function Topbar({ mobileTrigger }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const unread = useUnreadCount();
  const router = useRouter();

  return (
    <header className="h-14 border-b border-border/60 bg-background/95 backdrop-blur-sm sticky top-0 z-50 flex items-center gap-3 px-4 shrink-0">
      {mobileTrigger}

      {/* Search */}
      <div className="relative max-w-[280px] flex-1">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
        <Input
          id="global-search"
          placeholder="Search…"
          className="pl-8 h-8 text-[13px] bg-muted/50 border-transparent focus-visible:border-border focus-visible:bg-background focus-visible:ring-0 transition-all placeholder:text-muted-foreground/50"
        />
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-4 select-none items-center gap-0.5 rounded border border-border/60 bg-muted/80 px-1 font-mono text-[10px] text-muted-foreground/60">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1">

        {/* ── Notifications bell + panel ── */}
        <div className="relative">
          <button
            ref={bellRef}
            id="notifications-btn"
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" strokeWidth={1.8} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-[14px] rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center border-2 border-background px-0.5">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {/* Floating panel — positioned relative to bell */}
          {notifOpen && (
            <NotificationsPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              anchorRef={bellRef as React.RefObject<HTMLElement>}
            />
          )}
        </div>

        {/* Theme */}
        <ThemeToggle />

        {/* Divider */}
        <div className="w-px h-4 bg-border mx-1" />

        {/* ── User Menu ── */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center gap-2 h-8 px-2 rounded-md hover:bg-accent transition-colors focus-visible:outline-none"
            id="user-menu-btn"
          >
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[9px] font-bold bg-gradient-to-br from-primary to-violet-600 text-white">
                AM
              </AvatarFallback>
            </Avatar>
            <span className="text-[13px] font-medium hidden sm:block">Alex Morgan</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" strokeWidth={2} />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal py-2.5">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-[10px] font-bold bg-gradient-to-br from-primary to-violet-600 text-white">
                    AM
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[13px] font-semibold leading-none">Alex Morgan</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">alex@taskmatrix.io</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Use onSelect + router.push to avoid button-inside-button */}
            <DropdownMenuItem
              onSelect={() => router.push("/settings")}
              id="profile-menu-item"
            >
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[13px]">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => router.push("/settings")}
              id="settings-menu-item"
            >
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[13px]">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => router.push("/")}
              id="logout-menu-item"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="text-[13px]">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
