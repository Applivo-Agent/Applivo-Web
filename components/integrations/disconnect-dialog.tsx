"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DisconnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerName: string;
  providerId: string;
  accountIdentifier?: string;
  onConfirm: () => Promise<void>;
  isDisconnecting: boolean;
}

export function DisconnectDialog({
  open,
  onOpenChange,
  providerName,
  accountIdentifier,
  onConfirm,
  isDisconnecting,
}: DisconnectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] bg-[var(--sx-bg-121215)] border border-zinc-800 text-white p-6 shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-semibold text-white">
              Disconnect {providerName}?
            </DialogTitle>
            {accountIdentifier && (
              <p className="text-xs text-zinc-400 mt-0.5">
                Connected as: <span className="text-zinc-200 font-mono">{accountIdentifier}</span>
              </p>
            )}
          </div>
          <DialogDescription className="text-xs text-zinc-400 leading-relaxed space-y-2">
            <span>
              Disconnecting will revoke Applivo&apos;s API access with {providerName} and remove your active authorization tokens.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-zinc-900/80 border border-zinc-800/80 p-3.5 space-y-2 text-xs text-zinc-300">
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
            <span>
              <strong className="text-white">Existing data is kept: </strong>
              Any resumes, documents, or profile project summaries you have already imported will remain safe in Applivo.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
            <span>
              <strong className="text-white">Future sync stops: </strong>
              Applivo will no longer be able to read or export files or schedule calendar events through this account.
            </span>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2.5 pt-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDisconnecting}
            className="text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDisconnecting}
            className="text-xs bg-red-600 hover:bg-red-500 text-white font-medium px-4"
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Disconnecting...
              </>
            ) : (
              `Disconnect ${providerName}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
