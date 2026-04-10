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
import { Plus, CheckCircle2 } from "lucide-react";
import { useProjectActions, PROJECT_COLORS } from "@/store/project-store";
import { MOCK_USERS } from "@/lib/data";

export function NewProjectDialog() {
  const { addProject } = useProjectActions();

  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name,    setName]    = useState("");
  const [desc,    setDesc]    = useState("");
  const [color,   setColor]   = useState<typeof PROJECT_COLORS[number]>(PROJECT_COLORS[0]);
  const [dueDate, setDueDate] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>(["u1"]);

  const reset = () => {
    setName(""); setDesc(""); setColor(PROJECT_COLORS[0]);
    setDueDate(""); setMemberIds(["u1"]); setSuccess(false);
  };

  const toggleMember = (id: string) =>
    setMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    addProject({ name: name.trim(), description: desc, color, dueDate: dueDate || undefined, memberIds });

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
            <p className="text-xs text-muted-foreground">"{name}" is ready</p>
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

            {/* Members */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Team members</Label>
              <div className="flex flex-wrap gap-2">
                {MOCK_USERS.map((u) => {
                  const selected = memberIds.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleMember(u.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        selected
                          ? "bg-primary/15 border-primary/40 text-primary"
                          : "bg-muted border-border text-muted-foreground hover:border-border/80"
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-violet-600 text-[9px] text-white flex items-center justify-center font-bold shrink-0">
                        {u.initials.charAt(0)}
                      </span>
                      {u.name.split(" ")[0]}
                    </button>
                  );
                })}
              </div>
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
