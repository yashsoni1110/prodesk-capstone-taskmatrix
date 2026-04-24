"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, X, UserPlus, Pencil } from "lucide-react";
import { useProjectActions, PROJECT_COLORS } from "@/store/project-store";
import { useAuthStore } from "@/store/auth-store";
import type { Project } from "@/lib/data";

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onClose: () => void;
}

export function EditProjectDialog({ project, open, onClose }: EditProjectDialogProps) {
  const { updateProject } = useProjectActions();
  const storeUser = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name,    setName]    = useState(project.name);
  const [desc,    setDesc]    = useState(project.description);
  const [color,   setColor]   = useState(project.color ?? PROJECT_COLORS[0]);
  const [dueDate, setDueDate] = useState(project.dueDate ?? "");

  /* member management */
  const selfName = storeUser?.name ?? "";
  const initialMembers = project.members.length > 0
    ? project.members.map((m) => m.name)
    : selfName ? [selfName] : [];
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<string[]>(initialMembers);

  /* sync when the dialog opens with a different project */
  useEffect(() => {
    setName(project.name);
    setDesc(project.description);
    setColor(project.color ?? PROJECT_COLORS[0]);
    setDueDate(project.dueDate ?? "");
    setMembers(
      project.members.length > 0
        ? project.members.map((m) => m.name)
        : selfName ? [selfName] : []
    );
    setSuccess(false);
    setMemberInput("");
  }, [project, selfName]);

  const addMember = () => {
    const trimmed = memberInput.trim();
    if (!trimmed || members.includes(trimmed)) { setMemberInput(""); return; }
    setMembers((prev) => [...prev, trimmed]);
    setMemberInput("");
  };

  const removeMember = (name: string) => {
    if (name === selfName) return; // can't remove yourself
    setMembers((prev) => prev.filter((m) => m !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));

    const memberUsers = members.map((m, i) => ({
      id: storeUser?.id
        ? m === selfName ? storeUser.id : `custom-${project.id}-${i}`
        : `custom-${project.id}-${i}`,
      name: m,
      email: m === selfName ? (storeUser?.email ?? "") : "",
      avatar: "",
      initials: m.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      role: (m === selfName
        ? (storeUser?.role ?? "developer")
        : "developer") as "admin" | "manager" | "developer" | "designer",
    }));

    updateProject(project.id, {
      name: name.trim(),
      description: desc,
      color,
      dueDate: dueDate || project.dueDate,
      // members are stored locally only (not in Supabase schema yet)
    });

    // Also update members in local state directly via the store
    // Since updateProject handles Partial<Project>, we pass members separately
    // by calling updateProject with an extended type workaround
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updateProject as any)(project.id, { members: memberUsers });

    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 700));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md" id="edit-project-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Edit Project
          </DialogTitle>
          <DialogDescription>Update the project details below.</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium">Project updated!</p>
            <p className="text-xs text-muted-foreground">&quot;{name}&quot; has been saved</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-project-name" className="text-xs font-medium">
                Project name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-project-desc" className="text-xs font-medium">Description</Label>
              <Textarea
                id="edit-project-desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={2}
                className="resize-none text-sm"
                placeholder="Brief overview of this project…"
              />
            </div>

            {/* Color picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Project color</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? "#fff" : "transparent",
                      boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Due date */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-project-due" className="text-xs font-medium">Due date</Label>
              <Input
                id="edit-project-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Team members */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Team members</Label>
              {members.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {members.map((m) => (
                    <span
                      key={m}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/15 border border-primary/30 text-primary"
                    >
                      <span className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-violet-600 text-[8px] text-white flex items-center justify-center font-bold shrink-0">
                        {m.charAt(0).toUpperCase()}
                      </span>
                      {m}
                      {m !== selfName && (
                        <button
                          type="button"
                          onClick={() => removeMember(m)}
                          className="ml-0.5 hover:text-destructive transition-colors"
                          aria-label={`Remove ${m}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  id="edit-member-input"
                  placeholder="Add a teammate name…"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMember(); } }}
                  className="h-8 text-[12px] flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addMember}
                  disabled={!memberInput.trim()}
                  className="h-8 px-3 gap-1 text-xs"
                  id="edit-add-member-btn"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button
                type="submit"
                disabled={loading || !name.trim()}
                className="gap-2 min-w-[130px]"
                id="save-project-btn"
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
