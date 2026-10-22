"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { AppHeader } from "@/components/app-header";
import { PageTransition } from "@/components/page-transition";
import { LumiProvider, useLumi } from "@/lib/lumi-context";
import { LumiPanel } from "@/components/lumi-panel";

interface ShellState {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  expand: () => void;
  closeMobile: () => void;
}

const ShellContext = createContext<ShellState | null>(null);

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used within AppShell");
  return ctx;
}

const STORAGE_KEY = "applivo_sidebar_collapsed";

function ShellBody({
  children,
  collapsed,
  mobileOpen,
  closeMobile,
  isChat,
}: {
  children: React.ReactNode;
  collapsed: boolean;
  mobileOpen: boolean;
  closeMobile: () => void;
  isChat: boolean;
}) {
  const { isOpen: isLumiOpen } = useLumi();

  return (
    <div className={`app-shell dashboard-typography ${isChat ? "h-screen max-h-screen overflow-hidden" : "min-h-screen"} bg-[var(--app-sidebar)]`}>
      <Sidebar />
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={closeMobile}
        />
      )}
      <div className={`app-main ${isChat ? "h-screen max-h-screen overflow-hidden" : "min-h-screen"} flex flex-col transition-[padding] duration-200 ${collapsed ? "md:pl-[var(--app-sidebar-w-collapsed)]" : "md:pl-[var(--app-sidebar-w)]"}`}>
        <AppHeader />
        <main className={`flex-1 min-w-0 bg-[var(--app-bg)] md:border-l border-t border-[var(--app-border)] px-4 md:px-6 ${isChat ? "min-h-0 overflow-hidden pt-3 pb-3 flex flex-col" : "overflow-x-hidden pt-6 pb-12"}`}>
          <div className={`w-full ${isChat ? "h-full flex-1 min-h-0 flex flex-col" : ""}`}>
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      <LumiPanel />
    </div>
  );
}

/** Authenticated application frame: sidebar + header + content panel. Public pages never use it. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch { /* storage unavailable */ }
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const toggle = useCallback(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setMobileOpen((o) => !o);
      return;
    }
    setCollapsed((c) => {
      try { localStorage.setItem(STORAGE_KEY, c ? "0" : "1"); } catch { /* ignore */ }
      return !c;
    });
  }, []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const expand = useCallback(() => {
    setCollapsed((c) => {
      if (c) { try { localStorage.setItem(STORAGE_KEY, "0"); } catch { /* ignore */ } }
      return false;
    });
  }, []);

  const isChat = pathname === "/chat";

  return (
    <ShellContext.Provider value={{ collapsed, mobileOpen, toggle, expand, closeMobile }}>
      <LumiProvider>
        <ShellBody
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          closeMobile={closeMobile}
          isChat={isChat}
        >
          {children}
        </ShellBody>
      </LumiProvider>
    </ShellContext.Provider>
  );
}
