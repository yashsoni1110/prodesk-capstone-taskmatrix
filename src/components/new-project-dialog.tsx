"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, CheckCircle2, X, UserPlus } from "lucide-react";
import { useProjectActions, PROJECT_COLORS } from "@/store/project-store";
import { useAuthStore } from "@/store/auth-store";

export function NewProjectDialog() {
  const { addProject } = useProjectActions();
  const storeUser = useAuthStore((s) => s.user);

  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name,    setName]    = useState("");
  const [desc,    setDesc]    = useState("");
  const [color,   setColor]   = useState<typeof PROJECT_COLORS[number]>(PROJECT_COLORS[0]);
  const [dueDate, setDueDate] = useState("");

  /* ── Custom member list (free-text names) ── */
  // Always start with the logged-in user pre-added
  const selfName = storeUser?.name ?? "";
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<string[]>(selfName ? [selfName] : []);

  const addMember = () => {
    const trimmed = memberInput.trim();
    if (!trimmed || members.includes(trimmed)) { setMemberInput(""); return; }
    setMembers((prev) => [...prev, trimmed]);
    setMemberInput("");
  };

  const removeMember = (name: string) => {
    // Don't allow removing yourself
    if (name === selfName) return;
    setMembers((prev) => prev.filter((m) => m !== name));
  };

  const reset = () => {
    setName(""); setDesc(""); setColor(PROJECT_COLORS[0]);
    setDueDate(""); setMemberInput("");
    setMembers(selfName ? [selfName] : []);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    // Build minimal User objects from the free-text member names
    const memberUsers = members.map((m, i) => ({
      id: storeUser?.id ? (m === selfName ? storeUser.id : `custom-${i}`) : `custom-${i}`,
      name: m,
      email: m === selfName ? (storeUser?.email ?? "") : "",
      avatar: "",
      initials: m.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      role: (m === selfName ? (storeUser?.role ?? "developer") : "developer") as "admin" | "manager" | "developer" | "designer",
    }));

    addProject({
      name: name.trim(),
      description: desc,
      color,
      dueDate: dueDate || undefined,
      members: memberUsers,
    });

    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 700));
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 h-9 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        id="new-project-dialog-btn"
      >
        <Plus className="w-4 h-4" /> New Project
      </DialogTrigger>

      <DialogContent className="sm:max-w-md" id="new-project-dialog">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Set up a new project workspace for your team.</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium">Project created!</p>
            <p className="text-xs text-muted-foreground">&quot;{name}&quot; is ready</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="project-name" className="text-xs font-medium">
                Project name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-name"
                placeholder="e.g. Marketing Website Redesign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="project-desc" className="text-xs font-medium">Description</Label>
              <Textarea
                id="project-desc"
                placeholder="Brief overview of this project…"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={2}
                className="resize-none text-sm"
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
              <Label htmlFor="project-due" className="text-xs font-medium">Due date</Label>
              <Input
                id="project-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9"
              />
            </div>

            {/* ── Custom team members ── */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Team members</Label>

              {/* Added members chips */}
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

              {/* Add member input */}
              <div className="flex gap-2">
                <Input
                  id="member-name-input"
                  placeholder="Type a name and press Add…"
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
                  id="add-member-btn"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                You are added automatically. Type names of teammates to add.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading || !name.trim()} className="gap-2 min-w-[130px]" id="create-project-btn">
                {loading ? (
                  <><span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />Creating…</>
                ) : (
                  <><Plus className="w-4 h-4" />Create Project</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
