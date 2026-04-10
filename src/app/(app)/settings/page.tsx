"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Eye, EyeOff, AlertTriangle, Upload } from "lucide-react";

/* ── Tiny toast hook ── */
function useToast() {
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const show = (text: string, type: "success" | "error" = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };
  return { msg, show };
}

/* ── Notification toggle row ── */
function NotifRow({
  id,
  label,
  desc,
  defaultOn = true,
}: {
  id: string;
  label: string;
  desc: string;
  defaultOn?: boolean;
}) {
  const [enabled, setEnabled] = useState(defaultOn);

  return (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <p className="text-[13px] font-medium">{label}</p>
        <p className="text-[11px] text-muted-foreground/70 mt-0.5">{desc}</p>
      </div>
      {/* Toggle switch */}
      <button
        id={id}
        role="switch"
        aria-checked={enabled}
        onClick={() => setEnabled((v) => !v)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          enabled ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition duration-200 ${
            enabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/* ── Page ── */
export default function SettingsPage() {
  const { msg: toast, show } = useToast();

  /* Profile fields */
  const [name,     setName]     = useState("Alex Morgan");
  const [email,    setEmail]    = useState("alex@taskmatrix.io");
  const [timezone, setTimezone] = useState("IST (UTC+5:30)");
  const [savingProfile, setSavingProfile] = useState(false);

  /* Password fields */
  const [curPw,     setCurPw]     = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCur,   setShowCur]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [savingPw,  setSavingPw]  = useState(false);

  /* Workspace */
  const [wsName, setWsName] = useState("TaskMatrix Workspace");
  const [wsUrl,  setWsUrl]  = useState("my-team");
  const [savingWs, setSavingWs] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  /* ── Save handlers ── */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingProfile(false);
    show("Profile saved successfully!");
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curPw) return show("Enter your current password.", "error");
    if (newPw.length < 8) return show("Password must be at least 8 characters.", "error");
    if (newPw !== confirmPw) return show("Passwords do not match.", "error");
    setSavingPw(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingPw(false);
    setCurPw(""); setNewPw(""); setConfirmPw("");
    show("Password updated successfully!");
  };

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingWs(true);
    await new Promise((r) => setTimeout(r, 600));
    setSavingWs(false);
    show("Workspace settings saved!");
  };

  return (
    <div className="space-y-5 max-w-[780px]">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Manage your account and workspace preferences</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border text-[13px] font-medium ${
          toast.type === "success"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            : "bg-destructive/10 border-destructive/20 text-destructive"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          {toast.text}
        </div>
      )}

      <Tabs defaultValue="profile" id="settings-tabs">
        <TabsList className="mb-5">
          <TabsTrigger value="profile"       id="tab-profile">Profile</TabsTrigger>
          <TabsTrigger value="workspace"     id="tab-workspace">Workspace</TabsTrigger>
          <TabsTrigger value="notifications" id="tab-notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ── */}
        <TabsContent value="profile" className="space-y-4">

          {/* Profile Info */}
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-[14px]">Profile Information</CardTitle>
              <CardDescription className="text-[12px]">Update your name, email, and timezone.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Avatar row */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-violet-600 text-white">
                      {name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <label
                      htmlFor="avatar-upload"
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border/80 text-[12px] font-medium cursor-pointer hover:bg-accent transition-colors"
                      id="upload-avatar-btn"
                    >
                      <Upload className="w-3.5 h-3.5" /> Change Avatar
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" />
                    <p className="text-[11px] text-muted-foreground/60 mt-1">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-name" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Full name</Label>
                    <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-[13px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-email" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
                    <Input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9 text-[13px]" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-role" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Role</Label>
                    <Input id="settings-role" defaultValue="Admin" disabled className="h-9 text-[13px] opacity-60" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-timezone" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Timezone</Label>
                    <Input id="settings-timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="h-9 text-[13px]" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={savingProfile} id="save-profile-btn" className="gap-2 min-w-[120px]">
                    {savingProfile ? (
                      <><span className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" /> Saving…</>
                    ) : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-[14px]">Change Password</CardTitle>
              <CardDescription className="text-[12px]">Use a strong, unique password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {[
                  { id: "current-password", label: "Current password",  val: curPw,     set: setCurPw,     show: showCur, toggle: () => setShowCur((v) => !v) },
                  { id: "new-password",     label: "New password",      val: newPw,     set: setNewPw,     show: showNew, toggle: () => setShowNew((v) => !v) },
                  { id: "confirm-password", label: "Confirm new password", val: confirmPw, set: setConfirmPw, show: showNew, toggle: () => setShowNew((v) => !v) },
                ].map(({ id, label, val, set, show, toggle }) => (
                  <div key={id} className="space-y-1.5">
                    <Label htmlFor={id} className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
                    <div className="relative">
                      <Input
                        id={id}
                        type={show ? "text" : "password"}
                        value={val}
                        onChange={(e) => set(e.target.value)}
                        className="h-9 text-[13px] pr-9"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={toggle}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button type="submit" size="sm" variant="outline" disabled={savingPw} id="update-password-btn" className="gap-2 min-w-[140px]">
                    {savingPw ? (
                      <><span className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" /> Updating…</>
                    ) : "Update Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Workspace Tab ── */}
        <TabsContent value="workspace" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-[14px]">Workspace Settings</CardTitle>
              <CardDescription className="text-[12px]">Configure your team workspace identity.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveWorkspace} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="workspace-name" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Workspace name</Label>
                  <Input id="workspace-name" value={wsName} onChange={(e) => setWsName(e.target.value)} className="h-9 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="workspace-url" className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Workspace URL</Label>
                  <div className="flex gap-2 items-center">
                    <span className="flex items-center text-[12px] text-muted-foreground bg-muted px-3 h-9 rounded-md border border-border/60 whitespace-nowrap">
                      app.taskmatrix.io/
                    </span>
                    <Input id="workspace-url" value={wsUrl} onChange={(e) => setWsUrl(e.target.value)} className="h-9 text-[13px] flex-1" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={savingWs} id="save-workspace-btn" className="gap-2 min-w-[140px]">
                    {savingWs ? (
                      <><span className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" /> Saving…</>
                    ) : "Save Workspace"}
                  </Button>
                </div>
              </form>

              <Separator className="my-5" />

              {/* Danger zone */}
              <div>
                <p className="text-[13px] font-semibold text-destructive mb-1">Danger Zone</p>
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-destructive/20 bg-destructive/5">
                  <div>
                    <p className="text-[13px] font-medium">Delete Workspace</p>
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">Permanently delete all projects, tasks, and members.</p>
                  </div>
                  {deleteConfirm ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => { setDeleteConfirm(false); show("Workspace deletion cancelled (demo).", "error"); }}
                        id="confirm-delete-workspace-btn"
                      >
                        Confirm Delete
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteConfirm(true)}
                      id="delete-workspace-btn"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications Tab ── */}
        <TabsContent value="notifications">
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-[14px]">Notification Preferences</CardTitle>
              <CardDescription className="text-[12px]">Choose what you want to be notified about.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/40">
                <NotifRow id="notif-task-assigned" label="Task assigned to me"  desc="When someone assigns a task to you"            defaultOn={true}  />
                <NotifRow id="notif-task-due"      label="Task due soon"        desc="24 hours before a task deadline"                defaultOn={true}  />
                <NotifRow id="notif-comment"       label="Comments on my tasks" desc="When someone comments on your task"            defaultOn={true}  />
                <NotifRow id="notif-project"       label="Project updates"      desc="Major milestone or status changes"              defaultOn={false} />
                <NotifRow id="notif-member"        label="New team members"     desc="When someone joins your workspace"             defaultOn={true}  />
                <NotifRow id="notif-digest"        label="Weekly digest"        desc="A weekly summary of activity in your workspace" defaultOn={false} />
              </div>
              <div className="flex justify-end mt-4">
                <Button size="sm" onClick={() => show("Notification preferences saved!")} id="save-notif-btn">
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
