"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  UserPlus, CheckCircle2, Clock, AlertCircle,
  Search, Mail, Shield,
} from "lucide-react";
import { MOCK_USERS } from "@/lib/data";
import { useTasks } from "@/store/task-store";

const ROLE_STYLES: Record<string, { badge: string; grad: string }> = {
  admin:     { badge: "bg-violet-500/15 text-violet-400 border-violet-500/30",  grad: "from-violet-500 to-purple-600"  },
  manager:   { badge: "bg-blue-500/15   text-blue-400   border-blue-500/30",    grad: "from-blue-500   to-cyan-600"    },
  developer: { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", grad: "from-emerald-500 to-teal-600" },
  designer:  { badge: "bg-pink-500/15   text-pink-400   border-pink-500/30",    grad: "from-pink-500   to-rose-600"    },
};

export default function TeamPage() {
  const tasks  = useTasks();
  const [search, setSearch] = useState("");

  const members = MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Summary stats ── */
  const totalTasks = tasks.length;
  const doneTasks  = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-6 max-w-[1000px]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {MOCK_USERS.length} members · {doneTasks} of {totalTasks} tasks completed
          </p>
        </div>
        <Button className="gap-2 h-9 self-start sm:self-auto" id="invite-member-btn">
          <UserPlus className="w-4 h-4" /> Invite Member
        </Button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Members",    value: MOCK_USERS.length,                                                       color: "bg-primary/10",       text: "text-primary"    },
          { label: "Tasks Done", value: doneTasks,                                                               color: "bg-emerald-500/10",   text: "text-emerald-400" },
          { label: "In Progress",value: tasks.filter((t) => t.status === "in-progress").length,                  color: "bg-violet-500/10",    text: "text-violet-400"  },
          { label: "Critical",   value: tasks.filter((t) => t.priority === "critical").length,                   color: "bg-red-500/10",       text: "text-red-400"     },
        ].map(({ label, value, color, text }) => (
          <div key={label} className={`rounded-xl border border-border/50 ${color} p-3.5`}>
            <p className={`text-2xl font-bold tabular-nums ${text}`}>{value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          id="team-search"
          placeholder="Search by name, role, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 bg-muted/40 border-transparent focus-visible:border-border focus-visible:bg-background focus-visible:ring-0"
        />
      </div>

      {/* ── Member list ── */}
      <div className="grid gap-3">
        {members.map((user) => {
          const userTasks    = tasks.filter((t) => t.assignee.id === user.id);
          const done         = userTasks.filter((t) => t.status === "done").length;
          const inProgress   = userTasks.filter((t) => t.status === "in-progress").length;
          const critical     = userTasks.filter((t) => t.priority === "critical").length;
          const pct          = userTasks.length > 0 ? Math.round((done / userTasks.length) * 100) : 0;
          const style        = ROLE_STYLES[user.role] ?? ROLE_STYLES.developer;

          return (
            <Card key={user.id} id={`team-member-${user.id}`} className="border-border/50 hover:border-border transition-colors group">
              <CardContent className="px-5 py-4">
                <div className="flex items-center gap-4">

                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${style.grad} flex items-center justify-center text-base font-bold text-white ring-2 ring-background shrink-0`}>
                    {user.initials}
                  </div>

                  {/* Name / role / email */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{user.name}</span>
                      {user.role === "admin" && (
                        <Shield className="w-3 h-3 text-violet-400" />
                      )}
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${style.badge}`}
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>

                    {/* Workload progress */}
                    <div className="mt-2 hidden sm:block">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Workload</span>
                        <span>{done}/{userTasks.length} done</span>
                      </div>
                      <Progress value={pct} className="h-1" />
                    </div>
                  </div>

                  <Separator orientation="vertical" className="h-14 hidden sm:block" />

                  {/* Task stats */}
                  <div className="hidden sm:flex items-center gap-5 text-xs shrink-0">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1 text-emerald-500">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="font-semibold tabular-nums">{done}</span>
                      </div>
                      <span className="text-muted-foreground">Done</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1 text-violet-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-semibold tabular-nums">{inProgress}</span>
                      </div>
                      <span className="text-muted-foreground">Active</span>
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1 text-red-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="font-semibold tabular-nums">{critical}</span>
                      </div>
                      <span className="text-muted-foreground">Critical</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity"
                    id={`view-${user.id}-btn`}
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {members.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-2">
            <UserPlus className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No members match "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
