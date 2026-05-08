"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus, CheckCircle2, Clock, AlertCircle,
  Search, Mail, Shield, MoreHorizontal, Pencil, Trash2,
} from "lucide-react";
import { useTasks } from "@/store/task-store";
import { useAuthStore } from "@/store/auth-store";
import { useInvitedMembers, useTeamStore } from "@/store/team-store";
import { MOCK_USERS } from "@/lib/data";
import type { User } from "@/lib/data";
import { toast } from "sonner";

// Lazy-load dialogs
const InviteMemberDialog = dynamic(() => import("@/components/invite-member-dialog").then(m => m.InviteMemberDialog), { ssr: false });
const EditMemberDialog = dynamic(() => import("@/components/edit-member-dialog").then(m => m.EditMemberDialog), { ssr: false });
const ConfirmDeleteDialog = dynamic(() => import("@/components/confirm-delete-dialog").then(m => m.ConfirmDeleteDialog), { ssr: false });

const ROLE_STYLES: Record<string, { badge: string; grad: string }> = {
  admin:     { badge: "bg-violet-500/15 text-violet-400 border-violet-500/30",  grad: "from-violet-500 to-purple-600"  },
  manager:   { badge: "bg-blue-500/15   text-blue-400   border-blue-500/30",    grad: "from-blue-500   to-cyan-600"    },
  developer: { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", grad: "from-emerald-500 to-teal-600" },
  designer:  { badge: "bg-pink-500/15   text-pink-400   border-pink-500/30",    grad: "from-pink-500   to-rose-600"    },
  member:    { badge: "bg-slate-500/15  text-slate-400  border-slate-500/30",   grad: "from-slate-500  to-slate-600"   },
};

export function TeamClient() {
  const tasks = useTasks();
  const storeUser = useAuthStore(s => s.user);
  const invitedMembers = useInvitedMembers();
  const removeMember = useTeamStore(s => s.removeMember);
  const [search, setSearch] = useState("");
  const [editMember, setEditMember] = useState<User | null>(null);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMockUser = storeUser ? MOCK_USERS.some(u => u.id === storeUser.id) : false;
  const rosterBase = useMemo(() => [
    ...(isMockUser ? MOCK_USERS : storeUser ? [storeUser] : []),
    ...invitedMembers,
  ], [isMockUser, storeUser, invitedMembers]);

  const members = useMemo(() => rosterBase.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  ), [rosterBase, search]);

  const doneTasks = useMemo(() => tasks.filter(t => t.status === "done").length, [tasks]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteMemberId) return;
    setIsDeleting(true);
    await new Promise(r => setTimeout(r, 400));
    removeMember(deleteMemberId);
    setIsDeleting(false);
    setDeleteMemberId(null);
    toast.success("👥 Member removed");
  }, [deleteMemberId, removeMember]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {rosterBase.length} members · {doneTasks} of {tasks.length} tasks completed
          </p>
        </div>
        <InviteMemberDialog />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Members",     value: rosterBase.length, color: "bg-primary/10", text: "text-primary" },
          { label: "Tasks Done",  value: doneTasks, color: "bg-emerald-500/10", text: "text-emerald-400" },
        ].map(({ label, value, color, text }) => (
          <div key={label} className={`rounded-xl border border-border/50 ${color} p-3.5 animate-fade-up`}>
            <p className={`text-2xl font-bold tabular-nums ${text}`}>{value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input placeholder="Search team…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
      </div>

      <div className="grid gap-3">
        {members.map(user => {
          const style = ROLE_STYLES[user.role] ?? ROLE_STYLES.member;
          return (
            <Card key={user.id} className="border-border/50 hover:border-border transition-colors group">
              <CardContent className="px-5 py-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${style.grad} flex items-center justify-center text-base font-bold text-white shrink-0`}>
                  {user.initials}
                </div>
                <div className="flex-1 min-w-0">
                   <span className="font-semibold">{user.name}</span>
                   <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] capitalize ${style.badge}`}>{user.role}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editMember && <EditMemberDialog member={editMember} open={!!editMember} onClose={() => setEditMember(null)} />}
      <ConfirmDeleteDialog open={!!deleteMemberId} onClose={() => setDeleteMemberId(null)} onConfirm={handleDeleteConfirm} title="Remove Member" description="Permanently remove this member?" isDeleting={isDeleting} />
    </div>
  );
}
