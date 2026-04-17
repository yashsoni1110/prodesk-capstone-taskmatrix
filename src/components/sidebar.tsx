"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  FolderKanban,
  Users,
  Activity,
  Settings,
  Zap,
  Menu,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCurrentUser, useAuthStore } from "@/store/auth-store";
import { useState } from "react";

const navGroups = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/kanban",    icon: KanbanSquare,    label: "Tasks",         badge: "11" },
      { href: "/projects",  icon: FolderKanban,    label: "Projects",      badge: "4"  },
      { href: "/team",      icon: Users,           label: "Team" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/activity",  icon: Activity, label: "Activity" },
      { href: "/settings",  icon: Settings, label: "Settings" },
    ],
  },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/50 select-none">
            {group.label}
          </p>
          <div className="space-y-px">
            {group.items.map(({ href, icon: Icon, label, badge }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(
                    "group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-all duration-100",
                    active
                      ? "bg-primary/12 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  )}
                >
                  {/* active indicator bar */}
                  <span className={cn(
                    "absolute left-0 w-0.5 h-4 rounded-r-full bg-primary transition-opacity",
                    active ? "opacity-100" : "opacity-0"
                  )} />
                  <Icon
                    className={cn(
                      "w-[15px] h-[15px] shrink-0",
                      active ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                    )}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  <span className="flex-1 truncate">{label}</span>
                  {badge && (
                    <span className={cn(
                      "text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                      active
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarLogo() {
  return (
    <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border/60 shrink-0">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary shadow-lg shadow-primary/25">
        <Zap className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-[13px] tracking-tight leading-none">TaskMatrix</span>
        <span className="text-[9px] font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded-sm">
          Beta
        </span>
      </div>
    </div>
  );
}

function SidebarUserCard() {
  const user      = useCurrentUser();
  const supaUser  = useAuthStore((s) => s.supabaseUser);

  const displayName     = user?.name     ?? supaUser?.email?.split("@")[0] ?? "...";
  const displayEmail    = user?.email    ?? supaUser?.email    ?? "";
  const displayInitials = user?.initials
    ?? displayName.slice(0, 2).toUpperCase();

  return (
    <div className="px-2 pb-3 shrink-0">
      <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-accent/60 cursor-pointer transition-colors group">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0 ring-1 ring-primary/30">
          {displayInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold leading-none truncate">{displayName}</p>
          <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">{displayEmail}</p>
        </div>
        <ChevronRight className="w-3 h-3 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />
      </div>
    </div>
  );
}

export function MobileSidebarTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="md:hidden inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
        id="mobile-sidebar-trigger"
        aria-label="Open navigation"
      >
        <Menu className="w-4 h-4" />
      </SheetTrigger>
      <SheetContent side="left" className="p-0 flex flex-col w-56" id="mobile-sidebar">
        <SidebarLogo />
        <NavLinks onNavigate={() => setOpen(false)} />
        <SidebarUserCard />
      </SheetContent>
    </Sheet>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-[216px] shrink-0 h-screen sticky top-0 border-r border-border/60 bg-sidebar overflow-hidden relative">
      <SidebarLogo />
      <NavLinks />
      <SidebarUserCard />
    </aside>
  );
}
