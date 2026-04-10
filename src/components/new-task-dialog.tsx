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
import { Plus, CheckCircle2 } from "lucide-react";
import { useTaskActions } from "@/store/task-store";
import type { TaskStatus } from "@/lib/data";

interface NewTaskDialogProps {
  defaultStatus?: TaskStatus;
  triggerLabel?: string;
}

export function NewTaskDialog({ defaultStatus = "todo", triggerLabel }: NewTaskDialogProps) {
  const { addTask } = useTaskActions();

  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [title,    setTitle]    = useState("");
  const [priority, setPriority] = useState("medium");
  const [status,   setStatus]   = useState<TaskStatus>(defaultStatus);
  const [assignee, setAssignee] = useState("u1");
  const [dueDate,  setDueDate]  = useState("");

  const reset = () => {
    setTitle(""); setPriority("medium");
    setStatus(defaultStatus); setAssignee("u1");
    setDueDate(""); setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // brief optimistic delay

    addTask({
      title:      title.trim(),
      status,
      priority:   priority as "low" | "medium" | "high" | "critical",
      assigneeId: assignee,
      dueDate:    dueDate || undefined,
    });

    setLoading(false);
    setSuccess(true);

    // Auto-close after brief success flash
    await new Promise((r) => setTimeout(r, 700));
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

      <DialogContent className="sm:max-w-md" id="new-task-dialog">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to your workspace.</DialogDescription>
        </DialogHeader>

        {success ? (
          /* Success state */
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium">Task created!</p>
            <p className="text-xs text-muted-foreground">"{title}" added to {status}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="task-title" className="text-xs font-medium">
                Task title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="task-title"
                placeholder="e.g. Implement user authentication"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-9"
                autoFocus
              />
            </div>

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

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} id="cancel-task-btn">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !title.trim()}
                id="create-task-btn"
                className="gap-2 min-w-[110px]"
              >
                {loading ? (
                  <><span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" /> Creating…</>
                ) : (
                  <><Plus className="w-4 h-4" /> Create Task</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
