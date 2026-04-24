"use client";

import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  isDeleting?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title = "Delete item",
  description = "This action cannot be undone.",
  isDeleting = false,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isDeleting) onClose(); }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-4 h-4 shrink-0" />
            {title}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 flex-row justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            id="confirm-delete-cancel-btn"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isDeleting}
            id="confirm-delete-confirm-btn"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
