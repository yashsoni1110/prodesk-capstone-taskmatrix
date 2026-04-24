"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Pencil } from "lucide-react";
import { useTeamStore } from "@/store/team-store";
import type { User } from "@/lib/data";

interface EditMemberDialogProps {
  member: User;
  open: boolean;
  onClose: () => void;
}

export function EditMemberDialog({ member, open, onClose }: EditMemberDialogProps) {
  const updateMember = useTeamStore((s) => s.updateMember);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name,    setName]    = useState(member.name);
  const [email,   setEmail]   = useState(member.email);
  const [role,    setRole]    = useState<User["role"]>(member.role);

  useEffect(() => {
    setName(member.name);
    setEmail(member.email);
    setRole(member.role);
    setSuccess(false);
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));

    const initials = name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    updateMember(member.id, {
      name: name.trim(),
      email: email.trim(),
      role,
      initials,
    });

    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 700));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm" id="edit-member-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Edit Member
          </DialogTitle>
          <DialogDescription>Update this team member&apos;s details.</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium">Member updated!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-member-name" className="text-xs font-medium">
                Full name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-member-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9"
                autoFocus
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-member-email" className="text-xs font-medium">Email</Label>
              <Input
                id="edit-member-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9"
                placeholder="member@example.com"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as User["role"])}>
                <SelectTrigger className="h-9 w-full" id="edit-member-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">👑 Admin</SelectItem>
                  <SelectItem value="manager">📋 Manager</SelectItem>
                  <SelectItem value="developer">💻 Developer</SelectItem>
                  <SelectItem value="designer">🎨 Designer</SelectItem>
                  <SelectItem value="member">👤 Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="gap-2 min-w-[120px]"
                id="save-member-btn"
              >
                {loading ? (
                  <><span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />Saving…</>
                ) : (
                  <><Pencil className="w-4 h-4" />Save changes</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
