"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/lib/auth";
import { ExtensionProvider } from "@/lib/extension";
import { SubscriptionProvider } from "@/lib/subscription";
import { AppThemeProvider, ThemedToaster } from "@/lib/theme-client";
import { useState } from "react";

import { AgentStatusProvider } from "@/lib/agent-status";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <ExtensionProvider>
          <AgentStatusProvider>
            {children}
            <ThemedToaster />
          </AgentStatusProvider>
          </ExtensionProvider>
        </SubscriptionProvider>
      </AuthProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
}
