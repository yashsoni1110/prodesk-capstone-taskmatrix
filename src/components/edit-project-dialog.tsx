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
import { CheckCircle2, X, UserPlus, Pencil, Loader2, Sparkles, Circle, Flag } from "lucide-react";
import { useProjectActions, PROJECT_COLORS } from "@/store/project-store";
import { useAuthStore } from "@/store/auth-store";
import type { Project } from "@/lib/data";
import { toast } from "sonner";
import { generateProjectPlan } from "@/lib/gemini";

/* ── Parse milestones from encoded description ───────────────────────────── */
function decodePlan(raw: string): { plainDesc: string; milestones: string[] } {
  const idx = raw.indexOf("\nMilestones:\n");
  if (idx === -1) return { plainDesc: raw, milestones: [] };

  const plainDesc = raw.slice(0, idx).trim();
  const milestones = raw
    .slice(idx + "\nMilestones:\n".length)
    .split("\n")
    .filter((l) => /^\d+\.\s/.test(l))
    .map((l) => l.replace(/^\d+\.\s*/, "").trim());

  return { plainDesc, milestones };
}

function encodePlan(desc: string, milestones: string[]): string {
  if (milestones.length === 0) return desc;
  return `${desc}\nMilestones:\n${milestones.map((m, i) => `${i + 1}. ${m}`).join("\n")}`;
}

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onClose: () => void;
}

export function EditProjectDialog({ project, open, onClose }: EditProjectDialogProps) {
  const { updateProject } = useProjectActions();
  const storeUser         = useAuthStore((s) => s.user);

  const [loading,     setLoading]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [name,        setName]        = useState(project.name);
  const [plainDesc,   setPlainDesc]   = useState("");
  const [color,       setColor]       = useState(project.color ?? PROJECT_COLORS[0]);
  const [dueDate,     setDueDate]     = useState(project.dueDate ?? "");
  const [aiLoading,   setAiLoading]   = useState(false);
  const [milestones,  setMilestones]  = useState<string[]>([]);
  const [checked,     setChecked]     = useState<boolean[]>([]);

  const selfName = storeUser?.name ?? "";
  const initialMembers = project.members.length > 0
    ? project.members.map((m) => m.name)
    : selfName ? [selfName] : [];
  const [memberInput, setMemberInput] = useState("");
  const [members,     setMembers]     = useState<string[]>(initialMembers);

  /* ── Sync state when project changes ── */
  useEffect(() => {
    setName(project.name);
    setColor(project.color ?? PROJECT_COLORS[0]);
    setDueDate(project.dueDate ?? "");
    setMembers(project.members.length > 0 ? project.members.map((m) => m.name) : selfName ? [selfName] : []);
    setSuccess(false);
    setMemberInput("");

    const { plainDesc: pd, milestones: ms } = decodePlan(project.description ?? "");
    setPlainDesc(pd);
    setMilestones(ms);
    setChecked(ms.map(() => false));
  }, [project, selfName]);

  const addMember = () => {
    const trimmed = memberInput.trim();
    if (!trimmed || members.includes(trimmed)) { setMemberInput(""); return; }
    setMembers((prev) => [...prev, trimmed]);
    setMemberInput("");
  };
  const removeMember = (n: string) => {
    if (n === selfName) return;
    setMembers((prev) => prev.filter((m) => m !== n));
  };

  /* ── AI: generate/regenerate project plan ── */
  const handleGeneratePlan = async () => {
    if (!name.trim()) { toast.warning("Enter a project name first."); return; }
    setAiLoading(true);
    try {
      const plan = await generateProjectPlan(name.trim());
      setPlainDesc(plan.description);
      setMilestones(plan.milestones);
      setChecked(plan.milestones.map(() => false));
      toast.success("✨ Project plan updated!", {
        description: `Description + ${plan.milestones.length} milestones regenerated.`,
      });
    } catch (err) {
      toast.error("AI Error", { description: err instanceof Error ? err.message : "Failed." });
    } finally {
      setAiLoading(false);
    }
  };

  /* ── Toggle milestone checkbox ── */
  const toggleMilestone = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const doneCount    = checked.filter(Boolean).length;
  const totalCount   = milestones.length;
  const progressPct  = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  /* ── Save ── */
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
      role: (m === selfName ? (storeUser?.role ?? "developer") : "developer") as "admin" | "manager" | "developer" | "designer",
    }));

    updateProject(project.id, {
      name: name.trim(),
      description: encodePlan(plainDesc, milestones),
      color,
      dueDate: dueDate || project.dueDate,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updateProject as any)(project.id, { members: memberUsers });

    setLoading(false);
    setSuccess(true);
    toast.success("✅ Project updated!", { description: `"${name.trim()}" saved.` });
    await new Promise((r) => setTimeout(r, 700));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" id="edit-project-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4" /> Project Details
          </DialogTitle>
          <DialogDescription>Update project information and track milestones.</DialogDescription>
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

            {/* ── Milestone Checklist Card ───────────────────────────── */}
            {milestones.length > 0 && (
              <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/5 to-violet-500/5 p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
                      <Flag className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-[12px] font-semibold text-primary">Project Milestones</span>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">
                    {doneCount}/{totalCount} complete
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-primary/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Milestones checklist */}
                <ol className="space-y-2">
                  {milestones.map((m, i) => (
                    <li
                      key={i}
                      onClick={() => toggleMilestone(i)}
                      className="flex items-start gap-2.5 cursor-pointer group select-none"
                    >
                      <span className="mt-0.5 shrink-0">
                        {checked[i] ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary/60 transition-colors" />
                        )}
                      </span>
                      <span className={[
                        "text-[12px] leading-snug transition-colors",
                        checked[i]
                          ? "line-through text-muted-foreground/50"
                          : "text-foreground/80 group-hover:text-foreground",
                      ].join(" ")}>
                        {m}
                      </span>
                    </li>
                  ))}
                </ol>

                {/* All complete banner */}
                {doneCount === totalCount && totalCount > 0 && (
                  <div className="flex items-center gap-2 pt-1 border-t border-primary/15">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] font-medium text-emerald-500">All milestones completed! 🎉</span>
                  </div>
                )}
              </div>
            )}

            {/* Project name + AI button */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-project-name" className="text-xs font-medium">
                Project name <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="edit-project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-9 flex-1 min-w-0"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 shrink-0 gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                  onClick={handleGeneratePlan}
                  disabled={aiLoading || !name.trim()}
                  id="regen-project-plan-btn"
                  title={milestones.length > 0 ? "Regenerate milestones" : "Generate AI milestones"}
                >
                  {aiLoading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Sparkles className="w-3.5 h-3.5" />
                  }
                  <span className="hidden sm:inline text-[12px]">
                    {milestones.length > 0 ? "Regen" : "AI Plan"}
                  </span>
                </Button>
              </div>
              {milestones.length === 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Click <Sparkles className="w-3 h-3 inline text-primary" /> to generate AI milestones for this project.
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-project-desc" className="text-xs font-medium">Description</Label>
              <Textarea
                id="edit-project-desc"
                value={plainDesc}
                onChange={(e) => setPlainDesc(e.target.value)}
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
                    key={c} type="button" onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full border-2 transition-all"
                    style={{ backgroundColor: c, borderColor: color === c ? "#fff" : "transparent", boxShadow: color === c ? `0 0 0 2px ${c}` : "none" }}
                  />
                ))}
              </div>
            </div>

            {/* Due date */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-project-due" className="text-xs font-medium">Due date</Label>
              <Input id="edit-project-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9" />
            </div>

            {/* Team members */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Team members</Label>
              {members.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {members.map((m) => (
                    <span key={m} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/15 border border-primary/30 text-primary">
                      <span className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-violet-600 text-[8px] text-white flex items-center justify-center font-bold shrink-0">
                        {m.charAt(0).toUpperCase()}
                      </span>
                      {m}
                      {m !== selfName && (
                        <button type="button" onClick={() => removeMember(m)} className="ml-0.5 hover:text-destructive transition-colors" aria-label={`Remove ${m}`}>
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  id="edit-member-input" placeholder="Add a teammate name…"
                  value={memberInput} onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMember(); } }}
                  className="h-8 text-[12px] flex-1"
                />
                <Button type="button" size="sm" variant="outline" onClick={addMember} disabled={!memberInput.trim()} className="h-8 px-3 gap-1 text-xs" id="edit-add-member-btn">
                  <UserPlus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={loading || !name.trim()} className="gap-2 min-w-[130px]" id="save-project-btn">
                {loading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</>
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
