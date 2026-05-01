"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2, Sparkles, CheckCircle2, Circle, FolderKanban } from "lucide-react";
import { useTaskActions } from "@/store/task-store";
import { useProjects } from "@/store/project-store";
import type { Task, TaskStatus, Priority } from "@/lib/data";
import { toast } from "sonner";
import { generateSubSteps } from "@/lib/gemini";

/* ── Helper: parse sub-steps out of description ─────────────────────────────
   Expected format (written by new-task-dialog):
     Sub-steps:
     1. Do this
     2. Do that
   Returns { steps, plainDescription } where plainDescription is everything
   else (currently empty, but future-proof).
──────────────────────────────────────────────────────────────────────────── */
function parseDescription(raw: string): { steps: string[]; plain: string } {
  if (!raw.startsWith("Sub-steps:")) return { steps: [], plain: raw };
  const lines  = raw.split("\n");
  const steps  = lines
    .slice(1)                              // skip "Sub-steps:" header
    .filter((l) => /^\d+\.\s/.test(l))    // only numbered items
    .map((l) => l.replace(/^\d+\.\s*/, "").trim());
  return { steps, plain: "" };
}

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onClose: () => void;
}

export function EditTaskDialog({ task, open, onClose }: EditTaskDialogProps) {
  const { updateTask, deleteTask } = useTaskActions();
  const projects = useProjects();

  const [title,      setTitle]      = useState(task.title);
  const [description,setDescription]= useState(task.description);
  const [priority,   setPriority]   = useState<Priority>(task.priority);
  const [status,     setStatus]     = useState<TaskStatus>(task.status);
  const [assignee,   setAssignee]   = useState(task.assignee.id);
  const [dueDate,    setDueDate]    = useState(task.dueDate);
  const [projectId,  setProjectId]  = useState(task.projectId ?? "");
  const [loading,    setLoading]    = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  // AI sub-step state
  const [aiSteps,    setAiSteps]    = useState<string[]>([]);
  const [checked,    setChecked]    = useState<boolean[]>([]);
  const [aiLoading,  setAiLoading]  = useState(false);

  /* ── Parse steps from description when dialog opens / task changes ── */
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setStatus(task.status);
    setAssignee(task.assignee.id);
    setDueDate(task.dueDate);
    setProjectId(task.projectId ?? "");
    setConfirmDel(false);

    const { steps } = parseDescription(task.description ?? "");
    setAiSteps(steps);
    setChecked(steps.map(() => false));
  }, [task]);

  /* ── Generate new AI steps ── */
  const handleGenerateSteps = async () => {
    if (!title.trim()) {
      toast.warning("Enter a task title first.");
      return;
    }
    setAiLoading(true);
    try {
      const steps = await generateSubSteps(title.trim());
      setAiSteps(steps);
      setChecked(steps.map(() => false));
      toast.success("✨ Sub-steps generated!", { description: `${steps.length} steps added.` });
    } catch (err) {
      toast.error("AI Error", { description: err instanceof Error ? err.message : "Generation failed." });
    } finally {
      setAiLoading(false);
    }
  };

  /* ── Toggle a checklist item ── */
  const toggleStep = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const doneCount  = checked.filter(Boolean).length;
  const totalCount = aiSteps.length;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  /* ── Save ── */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));

    // Re-encode the steps back into description so they persist
    const newDescription = aiSteps.length > 0
      ? `Sub-steps:\n${aiSteps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
      : description;

    updateTask(task.id, {
      title: title.trim(),
      description: newDescription,
      priority,
      status,
      dueDate,
      projectId,
      // @ts-expect-error – store resolves assigneeId internally
      assigneeId: assignee,
    });
    setLoading(false);
    toast.success("✅ Task updated!", { description: `"${title.trim()}" saved successfully.` });
    await new Promise((r) => setTimeout(r, 400));
    onClose();
  };

  const handleDelete = () => {
    deleteTask(task.id);
    toast.error("🗑️ Task deleted", { description: `"${task.title}" was permanently removed.` });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" id="edit-task-dialog">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Task Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 pt-1">

          {/* ── AI Sub-steps Card ─────────────────────────────────────── */}
          {aiSteps.length > 0 ? (
            <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/5 to-violet-500/5 p-4 space-y-3">
              {/* Card header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[12px] font-semibold text-primary">AI Sub-steps</span>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">
                  {doneCount}/{totalCount} done
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-primary/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Steps checklist */}
              <ol className="space-y-2">
                {aiSteps.map((step, i) => (
                  <li
                    key={i}
                    onClick={() => toggleStep(i)}
                    className="flex items-start gap-2.5 cursor-pointer group select-none"
                  >
                    {/* Checkbox icon */}
                    <span className="mt-0.5 shrink-0 transition-colors">
                      {checked[i] ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
                      )}
                    </span>
                    {/* Step text */}
                    <span className={[
                      "text-[12px] leading-snug transition-colors",
                      checked[i]
                        ? "line-through text-muted-foreground/50"
                        : "text-foreground/80 group-hover:text-foreground",
                    ].join(" ")}>
                      {step}
                    </span>
                  </li>
                ))}
              </ol>

              {/* Completion badge */}
              {doneCount === totalCount && totalCount > 0 && (
                <div className="flex items-center gap-2 pt-1 border-t border-primary/15">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] font-medium text-emerald-500">All steps completed! 🎉</span>
                </div>
              )}
            </div>
          ) : null}

          {/* Title + AI generate button */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-task-title" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Title <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="edit-task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-9 text-[13px] flex-1 min-w-0"
                autoFocus
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 shrink-0 gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                onClick={handleGenerateSteps}
                disabled={aiLoading || !title.trim()}
                id="regen-ai-steps-btn"
                title={aiSteps.length > 0 ? "Regenerate sub-steps" : "Generate AI sub-steps"}
              >
                {aiLoading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Sparkles className="w-3.5 h-3.5" />
                }
                <span className="hidden sm:inline text-[12px]">
                  {aiSteps.length > 0 ? "Regen" : "AI Steps"}
                </span>
              </Button>
            </div>
            {aiSteps.length === 0 && (
              <p className="text-[11px] text-muted-foreground">
                Click <Sparkles className="w-3 h-3 inline text-primary" /> to generate AI sub-steps for this task.
              </p>
            )}
          </div>

          {/* Project — show if projects exist */}
          {projects.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FolderKanban className="w-3 h-3" /> Project
              </Label>
              <Select value={projectId || "none"} onValueChange={(v) => setProjectId(v === "none" ? "" : v)}>
                <SelectTrigger className="h-9 w-full text-[13px]" id="edit-task-project-select">
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

          {/* Description — only show if no AI steps */}
          {aiSteps.length === 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="edit-task-desc" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Description
              </Label>
              <Textarea
                id="edit-task-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="resize-none text-[13px]"
                placeholder="Add a description…"
              />
            </div>
          )}

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Priority</Label>
              <Select value={priority} onValueChange={(v) => { if (v) setPriority(v as Priority); }}>
                <SelectTrigger className="h-9 w-full text-[13px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🔵 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="critical">🔴 Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</Label>
              <Select value={status} onValueChange={(v) => { if (v) setStatus(v as TaskStatus); }}>
                <SelectTrigger className="h-9 w-full text-[13px]"><SelectValue /></SelectTrigger>
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
              <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Assignee</Label>
              <Select value={assignee} onValueChange={(v) => { if (v) setAssignee(v); }}>
                <SelectTrigger className="h-9 w-full text-[13px]"><SelectValue /></SelectTrigger>
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
              <Label htmlFor="edit-task-due" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Due date</Label>
              <Input
                id="edit-task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 text-[13px]"
              />
            </div>
          </div>

          {/* Delete confirmation */}
          {confirmDel && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <p className="text-[12px] text-destructive flex-1">This will permanently delete the task.</p>
              <Button type="button" size="sm" variant="destructive" onClick={handleDelete} id="confirm-delete-btn">
                Yes, delete
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setConfirmDel(false)}>
                Cancel
              </Button>
            </div>
          )}

          <DialogFooter className="pt-1 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto gap-1.5 text-[12px]"
              onClick={() => setConfirmDel(true)}
              id="delete-task-btn"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete task
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onClose} id="cancel-edit-btn">Cancel</Button>
            <Button type="submit" size="sm" disabled={loading || !title.trim()} className="gap-2 min-w-[100px]" id="save-task-btn">
              {loading ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</> : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
