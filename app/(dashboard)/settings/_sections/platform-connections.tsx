"use client";

import { SettingSection, SettingCard } from "@/components/settings/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsV2Api } from "@/lib/api";
import { Link2, RefreshCw, Unlink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", color: "text-zinc-400" },
  { id: "internshala", label: "Internshala", color: "text-zinc-300" },
  { id: "indeed", label: "Indeed", color: "text-zinc-300" },
  { id: "naukri", label: "Naukri", color: "text-zinc-300" },
] as const;

type PlatformId = typeof PLATFORMS[number]["id"];

interface PlatformStatus {
  connected: boolean;
  last_sync: string | null;
  health: string;
}

export function PlatformConnectionsSection() {
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState<PlatformId | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["platform-status"],
    queryFn: () => settingsV2Api.getPlatformStatus().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const platforms: Record<string, PlatformStatus> = data?.platforms ?? {};

  const handleConnect = (platformId: PlatformId) => {
    // LinkedIn uses OAuth — redirect to platform login via cookie service
    if (platformId === "linkedin") {
      window.open("/dashboard/platforms/linkedin/connect", "_blank");
    } else if (platformId === "internshala") {
      window.open("/dashboard/platforms/internshala/connect", "_blank");
    } else {
      toast.info(`${platformId} integration coming soon`);
    }
  };

  const handleSync = async (platformId: PlatformId) => {
    setSyncing(platformId);
    try {
      await settingsV2Api.updatePlatforms({
        platforms: {
          [platformId]: { last_sync: new Date().toISOString(), health: "syncing" },
        },
      });
      queryClient.invalidateQueries({ queryKey: ["platform-status"] });
      toast.success(`${platformId} synced`);
    } catch {
      toast.error(`Failed to sync ${platformId}`);
    } finally {
      setSyncing(null);
    }
  };

  const handleDisconnect = async (platformId: PlatformId) => {
    try {
      await settingsV2Api.updatePlatforms({
        platforms: { [platformId]: { connected: false, health: "disconnected" } },
      });
      queryClient.invalidateQueries({ queryKey: ["platform-status"] });
      toast.success(`${platformId} disconnected`);
    } catch {
      toast.error(`Failed to disconnect ${platformId}`);
    }
  };

  return (
    <SettingSection>
      <SettingCard
        title="Connected Platforms"
        description="Manage where your AI agent searches and applies for jobs"
        icon={<Link2 className="w-4 h-4 text-white" />}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {PLATFORMS.map((p) => {
              const status = platforms[p.id] ?? { connected: false, last_sync: null, health: "disconnected" };
              const isConnected = status.connected;
              const health = status.health;
              const isSyncing = syncing === p.id || health === "syncing";

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-lg border border-[var(--app-border-strong)] bg-transparent transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--app-card)] border border-[var(--app-border-strong)] text-zinc-300", p.color)}>
                      <span className="text-[12px] font-bold">{p.label.slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-[13px] sm:text-[14px] font-semibold text-white">{p.label}</p>
                      {isConnected && status.last_sync ? (
                        <p className="text-[12px] text-zinc-400 mt-0.5">
                          Last sync: {new Date(status.last_sync).toLocaleString()}
                        </p>
                      ) : (
                        <p className="text-[12px] text-zinc-400 mt-0.5">Not connected</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConnected && (
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          health === "healthy" && "bg-emerald-400",
                          health === "warning" && "bg-amber-400 animate-pulse",
                          (health === "error" || health === "disconnected") && "bg-zinc-500",
                          health === "syncing" && "bg-zinc-400 animate-pulse"
                        )}
                        title={`Health: ${health}`}
                      />
                    )}

                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleSync(p.id)}
                          disabled={isSyncing}
                          className="h-7 w-7 rounded bg-[var(--app-card)] border border-[var(--app-border-strong)] text-zinc-400 hover:text-white transition-colors flex items-center justify-center disabled:opacity-50"
                          title="Sync"
                        >
                          <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
                        </button>
                        <button
                          onClick={() => handleDisconnect(p.id)}
                          className="h-7 w-7 rounded bg-[var(--app-card)] border border-[var(--app-border-strong)] text-zinc-400 hover:text-white transition-colors flex items-center justify-center"
                          title="Disconnect"
                        >
                          <Unlink className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(p.id)}
                        className="h-8 px-3.5 bg-white text-black text-[13px] font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SettingCard>
    </SettingSection>
  );
}
