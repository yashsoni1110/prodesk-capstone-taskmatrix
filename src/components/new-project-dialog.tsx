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
import { Plus, X, UserPlus, Loader2, Sparkles, CheckCircle2, Flag } from "lucide-react";
import { useProjectActions, PROJECT_COLORS } from "@/store/project-store";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { generateProjectPlan } from "@/lib/gemini";

/* ── Encode milestones into description for persistence ─────────────────── */
function encodePlan(desc: string, milestones: string[]): string {
  if (milestones.length === 0) return desc;
  return `${desc}\nMilestones:\n${milestones.map((m, i) => `${i + 1}. ${m}`).join("\n")}`;
}

export function NewProjectDialog() {
  const { addProject }   = useProjectActions();
  const storeUser        = useAuthStore((s) => s.user);
  const supabaseUser     = useAuthStore((s) => s.supabaseUser);

  const [open,       setOpen]       = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [name,       setName]       = useState("");
  const [desc,       setDesc]       = useState("");
  const [color,      setColor]      = useState<typeof PROJECT_COLORS[number]>(PROJECT_COLORS[0]);
  const [dueDate,    setDueDate]    = useState("");
  const [aiLoading,  setAiLoading]  = useState(false);
  const [milestones, setMilestones] = useState<string[]>([]);

  const selfName = storeUser?.name ?? "";
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers]         = useState<string[]>(selfName ? [selfName] : []);

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

  const reset = () => {
    setName(""); setDesc(""); setColor(PROJECT_COLORS[0]);
    setDueDate(""); setMemberInput(""); setMilestones([]);
    setMembers(selfName ? [selfName] : []);
    setSuccess(false);
  };

  /* ── AI: Generate project description + milestones ── */
  const handleGeneratePlan = async () => {
    if (!name.trim()) { toast.warning("Enter a project name first."); return; }
    setAiLoading(true);
    try {
      const plan = await generateProjectPlan(name.trim());
      setDesc(plan.description);
      setMilestones(plan.milestones);
      toast.success("✨ Project plan generated!", {
        description: `Description + ${plan.milestones.length} milestones ready.`,
      });
    } catch (err) {
      toast.error("AI Error", { description: err instanceof Error ? err.message : "Failed." });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const memberUsers = members.map((m, i) => ({
      id: storeUser?.id ? (m === selfName ? storeUser.id : `custom-${i}`) : `custom-${i}`,
      name: m,
      email: m === selfName ? (storeUser?.email ?? "") : "",
      avatar: "",
      initials: m.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      role: (m === selfName ? (storeUser?.role ?? "developer") : "developer") as "admin" | "manager" | "developer" | "designer",
    }));

    addProject(
      {
        name: name.trim(),
        description: encodePlan(desc, milestones),
        color,
        dueDate: dueDate || undefined,
        members: memberUsers,
      },
      supabaseUser?.id ?? undefined
    );

    setLoading(false);
    toast.success("🚀 Project created!", { description: `"${name.trim()}" is ready to go.` });
    setSuccess(true);
    await new Promise((r) => setTimeout(r, 600));
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

      <DialogContent className="sm:max-w-md w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto" id="new-project-dialog">
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

            {/* ── AI Milestone Preview Card ──────────────────────────── */}
            {milestones.length > 0 && (
              <div className="rounded-xl border border-primary/25 bg-gradient-to-br from-primary/5 to-violet-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
                    <Flag className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-[12px] font-semibold text-primary">AI Project Milestones</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">{milestones.length} phases</span>
                </div>
                <ol className="space-y-1.5">
                  {milestones.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-[12px] text-foreground/80 leading-snug">{m}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Project name + AI button */}
            <div className="space-y-1.5">
              <Label htmlFor="project-name" className="text-xs font-medium">
                Project name <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="project-name"
                  placeholder="e.g. Marketing Website Redesign"
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
                  id="generate-project-plan-btn"
                  title="Generate AI description + milestones"
                >
                  {aiLoading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Sparkles className="w-3.5 h-3.5" />
                  }
                  <span className="hidden sm:inline text-[12px]">
                    {milestones.length > 0 ? "Regen" : "Generate"}
                  </span>
                </Button>
              </div>
              {milestones.length === 0 && (
                <p className="text-[11px] text-muted-foreground">
                  Click <Sparkles className="w-3 h-3 inline text-primary" /> to auto-generate a description and project milestones.
                </p>
              )}
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
                    key={c} type="button" onClick={() => setColor(c)}
                    className="w-6 h-6 rounded-full border-2 transition-all"
                    style={{ backgroundColor: c, borderColor: color === c ? "#fff" : "transparent", boxShadow: color === c ? `0 0 0 2px ${c}` : "none" }}
                  />
                ))}
              </div>
            </div>

            {/* Due date */}
            <div className="space-y-1.5">
              <Label htmlFor="project-due" className="text-xs font-medium">Due date</Label>
              <Input id="project-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-9" />
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
                  id="member-name-input" placeholder="Type a name and press Add…"
                  value={memberInput} onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMember(); } }}
                  className="h-8 text-[12px] flex-1"
                />
                <Button type="button" size="sm" variant="outline" onClick={addMember} disabled={!memberInput.trim()} className="h-8 px-3 gap-1 text-xs" id="add-member-btn">
                  <UserPlus className="w-3.5 h-3.5" /> Add
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">You are added automatically.</p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading || !name.trim()} className="gap-2 min-w-[130px]" id="create-project-btn">
                {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Creating…</> : <><Plus className="w-4 h-4" />Create Project</>}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
