"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, CheckCircle2 } from "lucide-react";
import { useTeamStore } from "@/store/team-store";

interface Props {
  /** Override the trigger button if needed */
  trigger?: React.ReactNode;
}

export function InviteMemberDialog({ trigger }: Props) {
  const inviteMember = useTeamStore((s) => s.inviteMember);

  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [error,   setError]   = useState("");

  const reset = () => {
    setName(""); setEmail(""); setError(""); setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter a name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }

    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500)); // simulate invite API

    inviteMember({ name: name.trim(), email: email.trim() });

    setLoading(false);
    setSuccess(true);

    // Close after showing success
    await new Promise((r) => setTimeout(r, 800));
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2 h-9" id="invite-member-btn">
            <UserPlus className="w-4 h-4" /> Invite Member
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm" id="invite-member-dialog">
        <DialogHeader>
          <DialogTitle>Invite a Team Member</DialogTitle>
          <DialogDescription>
            Send an invite to a colleague to join your workspace.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-center">Invitation sent!</p>
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-medium">{name}</span> will appear in your team list.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* Full name */}
            <div className="space-y-1.5">
              <Label htmlFor="invite-name" className="text-xs font-medium">
                Full name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="invite-name"
                placeholder="e.g. Sarah Johnson"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                autoFocus
                className="h-9"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="invite-email" className="text-xs font-medium">
                Email address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="sarah@company.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="h-9"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <DialogFooter className="pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading || !name.trim() || !email.trim()}
                className="gap-2 min-w-[120px]"
                id="send-invite-btn"
              >
                {loading ? (
                  <><span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-current border-t-transparent" />Sending…</>
                ) : (
                  <><UserPlus className="w-3.5 h-3.5" />Send Invite</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
