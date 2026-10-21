"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Star,
  GitFork,
  ExternalLink,
  FolderGit2,
} from "lucide-react";
import { integrationsApi } from "@/lib/api";
import { toast } from "sonner";

interface RepositoryItem {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  updated_at: string;
}

interface GitHubSyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function GitHubSyncModal({
  open,
  onOpenChange,
  onSuccess,
}: GitHubSyncModalProps) {
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState<RepositoryItem[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (open) {
      loadRepositories();
    }
  }, [open]);

  const loadRepositories = async () => {
    setLoading(true);
    try {
      const resp = await integrationsApi.githubRepos();
      const list = resp.data?.repositories || [];
      setRepos(list);
      // Auto-select up to 3 non-empty repos
      const initial = new Set<string>();
      list.slice(0, 3).forEach((r: RepositoryItem) => initial.add(r.name));
      setSelectedRepos(initial);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Failed to load GitHub repositories.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleRepo = (name: string) => {
    const next = new Set(selectedRepos);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setSelectedRepos(next);
  };

  const selectAll = () => {
    setSelectedRepos(new Set(repos.map((r) => r.name)));
  };

  const clearAll = () => {
    setSelectedRepos(new Set());
  };

  const handleSync = async () => {
    if (selectedRepos.size === 0) {
      toast.error("Please select at least one repository to enrich your profile.");
      return;
    }

    setSyncing(true);
    try {
      const resp = await integrationsApi.githubSync(Array.from(selectedRepos));
      toast.success(`Successfully enriched profile with ${resp.data?.result?.synced_count || selectedRepos.size} projects!`);
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Failed to sync GitHub projects.";
      toast.error(msg);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] bg-[#121215] border border-zinc-800 text-white p-6 shadow-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="space-y-1.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center p-1.5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/github.svg" alt="GitHub" className="w-full h-full object-contain invert" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                Select Projects to Connect
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400">
                Choose which public repositories to use as verified project evidence for job matching.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800/80 pb-2.5 pt-2 shrink-0">
          <span>
            Selected <strong className="text-white">{selectedRepos.size}</strong> of {repos.length} repositories
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-zinc-300 hover:text-white transition-colors"
            >
              Select all
            </button>
            <span className="text-zinc-600">|</span>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-zinc-300 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Repositories Scrollable List */}
        <div className="overflow-y-auto flex-1 min-h-[240px] space-y-2 py-2 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
              <p className="text-xs">Fetching repositories from GitHub...</p>
            </div>
          ) : repos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-1.5 text-center">
              <FolderGit2 className="w-8 h-8 text-zinc-600" />
              <p className="text-xs text-zinc-300 font-medium">No public repositories found</p>
              <p className="text-[11px] text-zinc-500 max-w-xs">
                Ensure you have created public repositories on your connected GitHub account.
              </p>
            </div>
          ) : (
            repos.map((repo) => {
              const isSelected = selectedRepos.has(repo.name);
              return (
                <div
                  key={repo.name}
                  onClick={() => toggleRepo(repo.name)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected
                      ? "bg-zinc-800/90 border-white/20"
                      : "bg-zinc-900/50 border-zinc-800/70 hover:bg-zinc-900 hover:border-zinc-700"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleRepo(repo.name)}
                    className="mt-0.5 border-zinc-600 data-[state=checked]:bg-white data-[state=checked]:text-zinc-900"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white truncate">
                        {repo.name}
                      </span>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-zinc-500 hover:text-zinc-300 p-0.5 shrink-0"
                        title="View on GitHub"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {repo.description && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {repo.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-1 text-[10px] text-zinc-400">
                      {repo.language && (
                        <span className="flex items-center gap-1 text-zinc-300 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          {repo.language}
                        </span>
                      )}
                      {repo.stargazers_count > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 text-zinc-400" />
                          {repo.stargazers_count}
                        </span>
                      )}
                      {repo.forks_count > 0 && (
                        <span className="flex items-center gap-1">
                          <GitFork className="w-2.5 h-2.5 text-zinc-400" />
                          {repo.forks_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Security & Authenticity Footnote */}
        <div className="rounded-lg bg-zinc-900/70 border border-zinc-800/80 p-2.5 text-[11px] text-zinc-400 shrink-0 space-y-1">
          <strong className="text-zinc-300">Read-Only Safety: </strong>
          Applivo only requests read-only public identity (<code className="text-zinc-300">read:user</code>). We never request write permissions, delete privileges, or organization administrative control.
        </div>

        <DialogFooter className="flex items-center justify-end gap-2.5 pt-3 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={syncing}
            className="text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSync}
            disabled={syncing || selectedRepos.size === 0}
            className="text-xs bg-white text-zinc-900 hover:bg-zinc-200 font-medium px-4"
          >
            {syncing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Syncing Profile Projects...
              </>
            ) : (
              `Enrich Profile (${selectedRepos.size} Projects)`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
