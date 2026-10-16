"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail, CheckCircle2, AlertCircle, Loader2, Unlink,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

function useGmailConnector() {
  return useQuery({
    queryKey: ["outreach-connectors"],
    queryFn: async () => {
      const res = await api.get("/outreach/connectors");
      return (res.data as any[]).find((c: any) => c.provider === "gmail") ?? null;
    },
    staleTime: 30_000,
  });
}

function useGitHubConnector() {
  return useQuery({
    queryKey: ["outreach-github-connector"],
    queryFn: async () => {
      try {
        const res = await api.get("/outreach/connectors/github");
        return res.data as any | null;
      } catch {
        return null;
      }
    },
    staleTime: 30_000,
  });
}

function GmailIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
      <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z" fill="#EA4335" fillOpacity=".2" stroke="#EA4335" strokeWidth=".5"/>
      <path d="M22 6l-10 7L2 6" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg className="w-5 h-5 text-zinc-300" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function ConnectorCard({
  icon, name, description, badgeColor, connected,
  primaryLine, secondaryLine,
  onConnect, onDisconnect, connecting, disconnecting,
}: {
  icon: React.ReactNode; name: string; description: string; badgeColor: string;
  connected: boolean; primaryLine?: string; secondaryLine?: string;
  onConnect: () => void; onDisconnect: () => void;
  connecting?: boolean; disconnecting?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col gap-4 p-5 rounded-2xl border transition-all",
        connected ? "bg-[#1d1d1d] border-emerald-500/20" : "bg-[#1d1d1d] border-zinc-800 hover:border-zinc-700"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-[#222222] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-bold text-white">{name}</p>
            {connected && (
              <span className={cn("text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border", badgeColor)}>
                Connected
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">{description}</p>
        </div>
      </div>

      {connected && (primaryLine || secondaryLine) && (
        <div className="px-1 py-2 bg-[#222222] rounded-xl border border-white/[0.06] space-y-0.5 px-3">
          {primaryLine && <p className="text-[12px] font-semibold text-zinc-300 truncate">{primaryLine}</p>}
          {secondaryLine && <p className="text-[10px] text-zinc-500">{secondaryLine}</p>}
        </div>
      )}

      {connected ? (
        <button
          onClick={onDisconnect}
          disabled={disconnecting}
          className="flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-xl border border-zinc-800 bg-[#222222] hover:border-red-500/30 hover:text-red-400 text-[10px] font-bold uppercase tracking-wider text-zinc-500 transition-all"
        >
          {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlink className="w-3 h-3" />}
          Disconnect
        </button>
      ) : (
        <button
          onClick={onConnect}
          disabled={connecting}
          className="flex items-center gap-2 w-fit px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-[11px] font-bold uppercase tracking-widest text-black transition-colors"
        >
          {connecting && <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />}
          {connecting ? "Redirecting…" : `Connect ${name}`}
        </button>
      )}
    </motion.div>
  );
}

export default function OutreachSettingsPage() {
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [banner, setBanner] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [gmailConnecting, setGmailConnecting] = useState(false);
  const [githubConnecting, setGithubConnecting] = useState(false);

  const { data: gmailConnector, isLoading: gmailLoading } = useGmailConnector();
  const { data: githubConnector, isLoading: githubLoading } = useGitHubConnector();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const githubConnected = searchParams.get("github_connected");
    const error = searchParams.get("error");
    if (connected === "true") {
      setBanner({ type: "success", msg: "Gmail connected! Outreach emails will be sent from your inbox." });
      qc.invalidateQueries({ queryKey: ["outreach-connectors"] });
      window.history.replaceState({}, "", "/outreach/settings");
    } else if (githubConnected === "true") {
      setBanner({ type: "success", msg: "GitHub connected! Your repos will personalize your outreach emails." });
      qc.invalidateQueries({ queryKey: ["outreach-github-connector"] });
      window.history.replaceState({}, "", "/outreach/settings");
    } else if (error) {
      setBanner({ type: "error", msg: "Connection failed — please try again." });
      window.history.replaceState({}, "", "/outreach/settings");
    }
  }, [searchParams, qc]);

  const gmailConnectMut = useMutation({
    mutationFn: async () => (await api.post("/outreach/connectors/gmail/auth")).data as { auth_url: string },
    onMutate: () => setGmailConnecting(true),
    onSuccess: (data) => { window.location.href = data.auth_url; },
    onError: () => { setGmailConnecting(false); setBanner({ type: "error", msg: "Could not start Gmail auth. Check server GOOGLE_CLIENT_ID config." }); },
  });
  const gmailDisconnectMut = useMutation({
    mutationFn: async () => api.delete(`/outreach/connectors/${gmailConnector?.id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outreach-connectors"] }),
  });

  const githubConnectMut = useMutation({
    mutationFn: async () => (await api.post("/outreach/connectors/github/auth")).data as { auth_url: string },
    onMutate: () => setGithubConnecting(true),
    onSuccess: (data) => { window.location.href = data.auth_url; },
    onError: () => { setGithubConnecting(false); setBanner({ type: "error", msg: "Could not start GitHub auth. Check server GITHUB_CLIENT_ID config." }); },
  });
  const githubDisconnectMut = useMutation({
    mutationFn: async () => api.delete(`/outreach/connectors/github/${githubConnector?.id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["outreach-github-connector"] }),
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-1 md:p-4 min-h-[90vh]">

      <div>
        <h2 className="text-xl font-bold tracking-tight text-white/90">Connectors</h2>
        <p className="text-[11px] text-zinc-400 mt-1">Connect your accounts to power automated cold outreach</p>
      </div>

      {banner && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl border text-sm font-medium",
            banner.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"
          )}
        >
          {banner.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {banner.msg}
          <button onClick={() => setBanner(null)} className="ml-auto opacity-50 hover:opacity-100 text-xl leading-none">×</button>
        </motion.div>
      )}

      {/* Connectors grid */}
      <div className="bg-[#242424] border border-white/[0.08] rounded-2xl p-6">
        <div className="mb-6">
          <h3 className="font-bold text-lg tracking-tight">Connected Accounts</h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">Gmail sends emails · GitHub personalizes them with your technical projects</p>
        </div>
        {(gmailLoading || githubLoading) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1].map(i => <div key={i} className="h-40 bg-[#1d1d1d] border border-zinc-800 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ConnectorCard
              icon={<GmailIcon />}
              name="Gmail"
              description="Send cold emails directly from your inbox. AI writes personalized messages and attaches your resume as a PDF automatically."
              badgeColor="bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
              connected={!!gmailConnector}
              primaryLine={gmailConnector?.email_address}
              secondaryLine={gmailConnector?.last_sync_at ? `Last synced ${new Date(gmailConnector.last_sync_at).toLocaleDateString()}` : undefined}
              onConnect={() => gmailConnectMut.mutate()}
              onDisconnect={() => gmailDisconnectMut.mutate()}
              connecting={gmailConnecting}
              disconnecting={gmailDisconnectMut.isPending}
            />
            <ConnectorCard
              icon={<GitHubIcon />}
              name="GitHub"
              description="AI uses your repos, languages, and starred projects to write emails that show genuine technical depth — not generic templates."
              badgeColor="bg-zinc-400/10 text-zinc-300 border-zinc-700"
              connected={!!githubConnector}
              primaryLine={githubConnector?.github_username ? `@${githubConnector.github_username}` : undefined}
              secondaryLine={githubConnector ? `${githubConnector.repo_count ?? 0} repos · ${githubConnector.star_count ?? 0} stars` : undefined}
              onConnect={() => githubConnectMut.mutate()}
              onDisconnect={() => githubDisconnectMut.mutate()}
              connecting={githubConnecting}
              disconnecting={githubDisconnectMut.isPending}
            />
          </div>
        )}
      </div>


    </div>
  );
}
