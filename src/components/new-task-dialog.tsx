"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Sparkles, CheckCircle2, Loader2, X } from "lucide-react";
import { useTaskActions } from "@/store/task-store";
import { useAuthStore } from "@/store/auth-store";
import { useProjects } from "@/store/project-store";
import type { TaskStatus } from "@/lib/data";
import { generateSubSteps } from "@/lib/gemini";
import { toast } from "sonner";

interface NewTaskDialogProps {
  defaultStatus?: TaskStatus;
  triggerLabel?: string;
  defaultProjectId?: string;
}

export function NewTaskDialog({ defaultStatus = "todo", triggerLabel, defaultProjectId }: NewTaskDialogProps) {
  const { addTask } = useTaskActions();
  const supabaseUser = useAuthStore((s) => s.supabaseUser);
  const currentUser  = useAuthStore((s) => s.user);
  const projects     = useProjects();

  const [open,      setOpen]      = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [title,     setTitle]     = useState("");
  const [priority,  setPriority]  = useState("medium");
  const [status,    setStatus]    = useState<TaskStatus>(defaultStatus);
  const [assignee,  setAssignee]  = useState("u1");
  const [dueDate,   setDueDate]   = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  // AI sub-steps
  const [subSteps,  setSubSteps]  = useState<string[]>([]);

  const reset = () => {
    setTitle(""); setPriority("medium");
    setStatus(defaultStatus); setAssignee("u1");
    setDueDate(""); setSubSteps([]);
    setProjectId(defaultProjectId ?? "");
  };

  /* ── AI: Generate sub-steps ─────────────────────────────────────────────── */
  const handleGenerateSubSteps = async () => {
    if (!title.trim()) {
      toast.warning("Enter a task title first so AI knows what to plan.");
      return;
    }
    setAiLoading(true);
    try {
      const steps = await generateSubSteps(title.trim());
      setSubSteps(steps);
      toast.success("✨ AI generated sub-steps!", { description: `${steps.length} steps added below.` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "AI generation failed.";
      toast.error("AI Error", { description: msg });
    } finally {
      setAiLoading(false);
    }
  };

  const removeStep = (i: number) =>
    setSubSteps((prev) => prev.filter((_, idx) => idx !== i));

  /* ── Submit ─────────────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));

    // Append sub-steps to description
    const descriptionWithSteps = subSteps.length > 0
      ? `Sub-steps:\n${subSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
      : "";

    addTask(
      {
        title:       title.trim(),
        status,
        priority:    priority as "low" | "medium" | "high" | "critical",
        assigneeId:  assignee,
        projectId:   projectId || undefined,
        dueDate:     dueDate || undefined,
        description: descriptionWithSteps,
        currentUser: currentUser ?? undefined,
      },
      supabaseUser?.id ?? undefined
    );

    setLoading(false);
    toast.success("✅ Task created!", { description: `"${title.trim()}" added to ${status}.` });
    setOpen(false);
    reset();
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) reset();
  };

  /* ── Trigger appearance ── */
  const isIconOnly = triggerLabel === "";
  const triggerCls = isIconOnly
    ? "inline-flex items-center justify-center h-6 w-6 rounded-md bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
    : "inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-2.5 h-8 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:translate-y-px";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={triggerCls} id="new-task-dialog-btn" aria-label="New task">
        <Plus className={isIconOnly ? "w-3.5 h-3.5" : "w-4 h-4 shrink-0"} />
        {!isIconOnly && (triggerLabel ?? "New Task")}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" id="new-task-dialog">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to your workspace.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Title + AI button */}
          <div className="space-y-1.5">
            <Label htmlFor="task-title" className="text-xs font-medium">
              Task title <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="task-title"
                placeholder="e.g. Implement user authentication"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-9 flex-1 min-w-0"
                autoFocus
              />
              {/* AI generate button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 shrink-0 gap-1.5 border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
                onClick={handleGenerateSubSteps}
                disabled={aiLoading || !title.trim()}
                id="ai-generate-btn"
                title="Generate AI sub-steps"
              >
                {aiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline text-[12px]">AI Steps</span>
              </Button>
            </div>

            {/* AI sub-steps display */}
            {subSteps.length > 0 && (
              <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5">
                <p className="text-[11px] font-semibold text-primary flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  AI-generated sub-steps
                </p>
                <ol className="space-y-1">
                  {subSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 group">
                      <span className="text-[10px] font-bold text-primary/60 mt-0.5 w-3 shrink-0">{i + 1}.</span>
                      <span className="text-[12px] text-foreground/80 flex-1 leading-snug">{step}</span>
                      <button
                        type="button"
                        onClick={() => removeStep(i)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                        aria-label="Remove step"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Project */}
          {projects.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Project</Label>
              <Select value={projectId} onValueChange={(v) => setProjectId(v === "none" ? "" : v)}>
                <SelectTrigger className="h-9 w-full" id="task-project-select">
                  <SelectValue placeholder="No project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— No project —</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Priority</Label>
              <Select value={priority} onValueChange={(v) => { if (v) setPriority(v); }}>
                <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🔵 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="critical">🔴 Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Status</Label>
              <Select value={status} onValueChange={(v) => { if (v) setStatus(v as TaskStatus); }}>
                <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Assignee</Label>
              <Select value={assignee} onValueChange={(v) => { if (v) setAssignee(v); }}>
                <SelectTrigger className="h-9 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="u1">Alex Morgan</SelectItem>
                  <SelectItem value="u2">Priya Sharma</SelectItem>
                  <SelectItem value="u3">James Liu</SelectItem>
                  <SelectItem value="u4">Sofia Chen</SelectItem>
                  <SelectItem value="u5">Marcus Webb</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-due" className="text-xs font-medium">Due date</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} id="cancel-task-btn" className="sm:w-auto w-full">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title.trim()}
              id="create-task-btn"
              className="gap-2 min-w-[110px] sm:w-auto w-full"
            >
              {loading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Create Task</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
