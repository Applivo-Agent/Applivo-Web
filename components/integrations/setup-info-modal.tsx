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
import { Info } from "lucide-react";
import { IntegrationItem } from "@/lib/api";

interface SetupInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: IntegrationItem | null;
}

export function SetupInfoModal({
  open,
  onOpenChange,
  integration,
}: SetupInfoModalProps) {
  if (!integration) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[var(--sx-bg-121215)] border border-zinc-800 text-white p-6 shadow-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={integration.logo} alt={integration.name} className="w-full h-full object-contain" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                {integration.name} Setup Information
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Configuration and developer requirements for this service.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3.5 py-2 text-xs text-zinc-300">
          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/80 space-y-2">
            <div className="flex items-center gap-2 text-zinc-200 font-medium">
              <Info className="w-3.5 h-3.5 text-zinc-400" />
              <span>Current Status: <span className="capitalize text-amber-400">{integration.status.replace("_", " ")}</span></span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {integration.status_message || "This integration requires server-side API credentials to activate."}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-white block">Requirements:</span>
            {integration.id === "gmail" ? (
              <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-[11px] text-zinc-300 space-y-2 leading-relaxed">
                <p>
                  To connect Gmail in production, Google Cloud requires an authorized OAuth App with verified restricted scopes and third-party security assessment (CASA Tier 2).
                </p>
                <p className="text-zinc-400">
                  Applivo prioritizes candidate privacy: we never read personal threads without strict consent and verification.
                </p>
              </div>
            ) : integration.id === "google_drive" || integration.id === "google_calendar" ? (
              <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-[11px] text-zinc-300 space-y-2 leading-relaxed">
                <p>
                  To activate Google Workspace integrations, configure your environment variables:
                </p>
                <div className="p-2 rounded bg-black/60 font-mono text-[10px] text-zinc-300 space-y-1">
                  <div>GOOGLE_CLIENT_ID=&quot;your-oauth-client-id.apps.googleusercontent.com&quot;</div>
                  <div>GOOGLE_CLIENT_SECRET=&quot;your-oauth-client-secret&quot;</div>
                </div>
              </div>
            ) : integration.id === "github" ? (
              <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-[11px] text-zinc-300 space-y-2 leading-relaxed">
                <p>
                  Create an OAuth App in GitHub Developer Settings with callback URL:
                </p>
                <div className="p-2 rounded bg-black/60 font-mono text-[10px] text-zinc-300">
                  http://localhost:8000/api/integrations/oauth/github/callback
                </div>
                <div className="p-2 rounded bg-black/60 font-mono text-[10px] text-zinc-300 space-y-1">
                  <div>GITHUB_CLIENT_ID=&quot;your-github-client-id&quot;</div>
                  <div>GITHUB_CLIENT_SECRET=&quot;your-github-client-secret&quot;</div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-[11px] text-zinc-400 leading-relaxed">
                Planned integration scheduled for future Applivo releases.
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full text-xs bg-white text-zinc-900 hover:bg-zinc-200 font-medium"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
