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
import { CheckCircle2, Trash2 } from "lucide-react";
import { useTaskActions } from "@/store/task-store";
import type { Task, TaskStatus, Priority } from "@/lib/data";

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onClose: () => void;
}

export function EditTaskDialog({ task, open, onClose }: EditTaskDialogProps) {
  const { updateTask, deleteTask } = useTaskActions();

  const [title,       setTitle]       = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority,    setPriority]    = useState<Priority>(task.priority);
  const [status,      setStatus]      = useState<TaskStatus>(task.status);
  const [assignee,    setAssignee]    = useState(task.assignee.id);
  const [dueDate,     setDueDate]     = useState(task.dueDate);
  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);

  /* Sync fields when task prop changes */
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setStatus(task.status);
    setAssignee(task.assignee.id);
    setDueDate(task.dueDate);
    setSuccess(false);
    setConfirmDel(false);
  }, [task]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    updateTask(task.id, {
      title: title.trim(),
      description,
      priority,
      status,
      dueDate,
      // @ts-expect-error – store resolves assigneeId internally
      assigneeId: assignee,
    });
    setLoading(false);
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 600));
    onClose();
  };

  const handleDelete = () => {
    deleteTask(task.id);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg" id="edit-task-dialog">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Edit Task</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-[13px] font-medium">Task updated!</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 pt-1">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-task-title" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-9 text-[13px]"
                autoFocus
              />
            </div>

            {/* Description */}
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
            {confirmDel ? (
              <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
                <p className="text-[12px] text-destructive flex-1">This will permanently delete the task.</p>
                <Button type="button" size="sm" variant="destructive" onClick={handleDelete} id="confirm-delete-btn">
                  Yes, delete
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setConfirmDel(false)}>
                  Cancel
                </Button>
              </div>
            ) : null}

            <DialogFooter className="pt-1 flex items-center">
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
                {loading ? (
                  <><span className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" /> Saving…</>
                ) : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
