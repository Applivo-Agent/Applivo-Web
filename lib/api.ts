import axios from "axios";
import { nextQuery, safeNext } from "./safe-redirect";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:8000");

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("applivo_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("applivo_token");
        localStorage.removeItem("applivo_user");
        const path = window.location.pathname;
        const isPublicPage = path === "/" || path === "/contact" || path === "/integrations" || path === "/pricing" || path.startsWith("/docs") || path === "/login" || path === "/register";
        if (!isPublicPage) {
          window.location.href = "/login" + nextQuery(safeNext(window.location.pathname + window.location.search));
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authApi = {
  // Signup
  registerInitiate: (data: { email: string; password: string; full_name: string }) =>
    api.post("/auth/register/initiate", data),
  registerVerify: (data: { email: string; otp: string; purpose: "register"; password?: string; full_name?: string }, userData: Record<string, unknown>) =>
    api.post("/auth/register/verify", { ...data, ...userData }),

  // Login
  loginInitiate: (data: { email: string; password: string }) =>
    api.post("/auth/login/initiate", data),
  loginVerify: (data: { email: string; otp: string; purpose: "login" }) =>
    api.post("/auth/login/verify", data),

  // Shared
  resendOtp: (email: string, purpose: "register" | "login") =>
    api.post("/auth/otp/resend", null, { params: { email, purpose } }),

  googleLogin: (id_token: string) =>
    api.post("/auth/google", { id_token }),
  me: () => api.get("/auth/me"),
  status: () => api.get("/auth/status"),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data: { token: string; new_password: string }) => api.post("/auth/reset-password", data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post("/auth/change-password", data),
  logout: () => api.post("/auth/logout"),

  // Legacy (can be removed once forms are updated)
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post("/auth/register/initiate", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login/initiate", data),
};

// ─── Profile ──────────────────────────────────────────────────────────────
export const profileApi = {
  get: () => api.get("/profile"),
  update: (data: Record<string, unknown>) => api.patch("/profile", data),
  listSkills: () => api.get("/profile/skills"),
  addSkill: (data: Record<string, unknown>) => api.post("/profile/skills", data),
  deleteSkill: (id: string) => api.delete(`/profile/skills/${id}`),
};

// ─── Onboarding ───────────────────────────────────────────────────────────
export const onboardingApi = {
  status: () => api.get("/v1/onboarding/status"),
  complete: (step: string, data: Record<string, unknown>) =>
    api.post(`/v1/onboarding/${step}`, data),
  parseResume: (formData: FormData) =>
    api.post("/v1/onboarding/resume/parse", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  parseResumeAndFill: (formData: FormData) =>
    api.post("/v1/onboarding/resume/parse-and-fill", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ─── Jobs ─────────────────────────────────────────────────────────────────
export const jobsApi = {
  list: (params?: Record<string, unknown>) => api.get("/jobs", { params }),
  get: (id: string) => api.get(`/jobs/${id}`),
  analyze: (id: string) => api.post(`/jobs/${id}/analyze`),
  skip: (id: string) => api.post(`/jobs/${id}/skip`),
  scrape: () => api.post("/jobs/scrape"),
};

// ─── Applications ─────────────────────────────────────────────────────────
export const applicationsApi = {
  list: (params?: Record<string, unknown>) => api.get("/applications", { params }),
  create: (data: Record<string, unknown>) => api.post("/applications", data),
  get: (id: string) => api.get(`/applications/${id}`),
  updateStatus: (id: string, data: Record<string, unknown>) =>
    api.patch(`/applications/${id}/status`, data),
  approve: (id: string) => api.post(`/applications/${id}/approve`),
  star: (id: string) => api.patch(`/applications/${id}/star`),
  stats: () => api.get("/applications/stats"),
  queueStatus: () => api.get("/applications/queue-status"),
};

// ─── Resumes ──────────────────────────────────────────────────────────────
export const resumesApi = {
  list: () => api.get("/resumes"),
  upload: (formData: FormData) =>
    api.post("/resumes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  generate: (data: { job_id: string; base_resume_id?: string }) =>
    api.post("/resumes/generate", data),
  setDefault: (id: string) => api.patch(`/resumes/${id}/set-default`),
  download: (id: string) => api.get(`/resumes/${id}/file`),
  getLatex: () => api.get("/resumes/latex"),
  getLatexTemplates: () => api.get("/resumes/latex/templates"),
  selectLatexTemplate: (name: string) =>
    api.post("/resumes/latex/template/select", { template_name: name }),
  analyze: () => api.get("/resumes/analyze"),
  delete: (id: string) => api.delete(`/resumes/${id}`),
};

// ─── Cover Letters ────────────────────────────────────────────────────────
export const coverLettersApi = {
  list: () => api.get("/cover-letters"),
  generate: (data: { job_id: string; tone?: string; additional_context?: string }) =>
    api.post("/cover-letters/generate", data),
  get: (id: string) => api.get(`/cover-letters/${id}`),
  delete: (id: string) => api.delete(`/cover-letters/${id}`),
};

// ─── Agent ────────────────────────────────────────────────────────────────
export const agentApi = {
  status: () => api.get("/agent/status"),
  tasks: (params?: Record<string, unknown>) => api.get("/agent/tasks", { params }),
  run: (data: { task_type: string; payload?: Record<string, unknown> }) =>
    api.post("/agent/run", data),
  pause: () => api.post("/agent/pause"),
  resume: () => api.post("/agent/resume"),
  applyOne: (applicationId: string) => api.post(`/agent/apply/${applicationId}`),
};

// ─── Workflow Pipeline ────────────────────────────────────────────────────
export const workflowsApi = {
  run: () => api.post("/workflows/run"),
  latest: () => api.get("/workflows/latest"),
  get: (id: string) => api.get(`/workflows/${id}`),
  cancel: (id: string) => api.post(`/workflows/${id}/cancel`),
};

// ─── Analytics ────────────────────────────────────────────────────────────
export const analyticsApi = {
  dashboard: () => api.get("/analytics/dashboard"),
  skillGaps: () => api.get("/analytics/skill-gaps"),
  market: () => api.get("/analytics/market"),
  resumePerformance: () => api.get("/analytics/resume-performance"),
  velocity: (days?: number) => api.get("/analytics/velocity", { params: { days } }),
  funnel: () => api.get("/analytics/funnel"),
  performance: (days?: number) => api.get("/analytics/performance", { params: { days } }),
  downloadCsv: async (days: number = 30) => {
    const res = await api.get("/analytics/export-csv", {
      params: { days },
      responseType: "blob",
    });
    return res.data;
  },
};

// ─── Chat ─────────────────────────────────────────────────────────────────
export const chatApi = {
  // History is kept and loaded server-side per conversation; the client only sends the new message.
  send: (data: { message: string; persona?: string; conversation_id?: string; job_id?: string }) =>
    api.post<{ response: string; actions_taken: string[]; conversation_id?: string }>("/chat", data),
  credits: () => api.get("/chat/credits"),
  history: (limit = 50, conversationId?: string) =>
    api.get(`/chat/history?limit=${limit}${conversationId ? `&conversation_id=${conversationId}` : ""}`),
  clearHistory: () => api.delete("/chat/history"),
  conversations: (limit = 30) => api.get(`/chat/conversations?limit=${limit}`),
  newConversation: () => api.post("/chat/conversations"),
  deleteConversation: (id: string) => api.delete(`/chat/conversations/${id}`),
};

// ─── Subscriptions ────────────────────────────────────────────────────────
export const subscriptionsApi = {
  plans: () => api.get("/subscriptions/plans"),
  current: () => api.get("/subscriptions/current"),
  cancel: () => api.post("/subscriptions/cancel"),
};

// ─── Payments ─────────────────────────────────────────────────────────────
export const paymentsApi = {
  createOrder: (data: { plan: string }) => api.post("/payments/create-order", data),
  verify: (data: Record<string, string>) => api.post("/payments/verify", data),
  history: () => api.get("/payments/history"),
  startTrialWithAutopay: (data: { plan: string }) =>
    api.post("/payments/start-trial-with-autopay", data),
  getAutopayManageUrl: () => api.get("/payments/autopay-manage-url"),
  cancelAutopay: () => api.post("/payments/cancel-autopay"),
};

// ─── Quotas ───────────────────────────────────────────────────────────────
export const quotasApi = {
  status: () => api.get("/quota/"),
  analyzeBudget: () => api.get("/quota/analyze-budget"),
};

// ─── Platform ─────────────────────────────────────────────────────────────
export const platformApi = {
  status: () => api.get("/platform/status"),
  connect: (data: { platform: string; cookies: string | Record<string, unknown> | unknown[] }) =>
    api.post("/platform/connect", data),
  uploadCookies: (data: { platform: string; cookies: string | Record<string, unknown> | unknown[] }) =>
    api.post("/platform/upload-cookies", data),
  login: (platform: string, data: { email: string; password: string }) =>
    api.post(`/platform/login/${platform}`, data, { timeout: 30000 }),
  loginStatus: (platform: string, taskId: string) =>
    api.get(`/platform/login/${platform}/status/${taskId}`),
  validate: (data: Record<string, unknown>) => api.post("/platform/validate", data),
  disconnect: (platform: string) => api.delete(`/platform/disconnect/${platform}`),
  invalidate: (platform: string) => api.post(`/platform/invalidate/${platform}`),
  messages: (platform: string = "internshala", limit: number = 50) =>
    api.get(`/platform/messages?platform=${platform}&limit=${limit}`),
  scanMessages: (platform: string = "internshala") =>
    api.post(`/platform/scan/messages/${platform}`),
  requestIntegration: (data: {
    service_name: string;
    service_url?: string;
    category?: string;
    use_case?: string;
    requester_email?: string;
  }) => api.post("/platform/request-integration", data),
};

// ─── Messages & Recruiter Inboxes ─────────────────────────────────────────
export const messagesApi = {
  list: (params?: { platform?: string; status?: string; search?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.platform) q.set("platform", params.platform);
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    if (params?.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return api.get(`/platform/messages${qs ? `?${qs}` : ""}`);
  },
  sync: (data: { platform: string; conversations: Array<Record<string, unknown>> }) =>
    api.post("/platform/messages/sync", data),
  updateStatus: (id: string, status: "read" | "unread") =>
    api.patch(`/platform/messages/${id}/status`, { status }),
};

// ─── Settings ─────────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => api.get("/settings"),
  update: (data: Record<string, unknown>) => api.patch("/settings", data),
};

// ─── Settings V2 (full persistence) ──────────────────────────────────────
export const settingsV2Api = {
  getAll: () => api.get("/settings/v2"),
  updateGeneral: (data: Record<string, unknown>) => api.put("/settings/v2/general", data),
  updateNotifications: (data: Record<string, unknown>) => api.put("/settings/v2/notifications", data),
  testNotification: (channel: string) => api.post("/settings/v2/notifications/test", { channel }),
  updateAutomation: (data: Record<string, unknown>) => api.put("/settings/v2/automation", data),
  updateStrategy: (data: Record<string, unknown>) => api.put("/settings/v2/strategy", data),
  updateAI: (data: Record<string, unknown>) => api.put("/settings/v2/ai", data),
  getAIModels: () => api.get("/settings/v2/ai/models"),
  getPlatformStatus: () => api.get("/settings/v2/platforms/status"),
  updatePlatforms: (data: Record<string, unknown>) => api.put("/settings/v2/platforms", data),
  updateSecurity: (data: Record<string, unknown>) => api.put("/settings/v2/security", data),
  getSessions: () => api.get("/settings/v2/security/sessions"),
  terminateSession: (sessionId: string) => api.post(`/settings/v2/security/sessions/${sessionId}/terminate`),
  terminateAllSessions: () => api.post("/settings/v2/security/sessions/terminate-all"),
  updateAdvanced: (data: Record<string, unknown>) => api.put("/settings/v2/advanced", data),
  exportData: (types: string[], format: string) => api.post("/settings/v2/advanced/export", { types, format }),
  resetSystem: (confirmation: string) => api.post("/settings/v2/advanced/reset", { confirmation }),
  getAuditLogs: (limit?: number, offset?: number) => api.get("/settings/v2/audit", { params: { limit, offset } }),
};

// ─── Security ─────────────────────────────────────────────────────────────
export const securityApi = {
  credentials: () => api.get("/security/credentials"),
  addCredential: (data: Record<string, unknown>) => api.post("/security/credentials", data),
  deleteCredential: (id: string) => api.delete(`/security/credentials/${id}`),
  consents: () => api.get("/security/consents"),
  updateConsent: (data: Record<string, unknown>) => api.post("/security/consents", data),
  audit: () => api.get("/security/data/audit"),
  exportData: () => api.post("/security/data/export"),
  deleteData: () => api.post("/security/data/delete"),
};

// ─── Admin ────────────────────────────────────────────────────────────────
export const adminApi = {
  stats: () => api.get("/admin/stats"),
  llmUsage: () => api.get("/admin/llm-usage"),
  health: () => api.get("/admin/system/health"),
  users: (params?: Record<string, unknown>) => api.get("/admin/users", { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: Record<string, unknown>) =>
    api.patch(`/admin/users/${id}`, data),
  suspendUser: (id: string) => api.patch(`/admin/users/${id}`, { is_active: false }),
  reactivateUser: (id: string) => api.patch(`/admin/users/${id}`, { is_active: true }),
  auditLogs: (params?: Record<string, unknown>) =>
    api.get("/admin/audit-logs", { params }),
};

// ─── Scheduler ───────────────────────────────────────────────────────────
export const schedulerApi = {
  listJobs: () => api.get("/scheduler/jobs"),
  addJob: (data: Record<string, unknown>) => api.post("/scheduler/jobs", data),
  removeJob: (jobId: string) => api.delete(`/scheduler/jobs/${jobId}`),
  runJobNow: (jobId: string) => api.post(`/scheduler/jobs/${jobId}/run`),
  pauseJob: (jobId: string) => api.post(`/scheduler/jobs/${jobId}/pause`),
  resumeJob: (jobId: string) => api.post(`/scheduler/jobs/${jobId}/resume`),
  triggerTask: (taskName: string) => api.post(`/scheduler/trigger/${taskName}`),
  toggleJob: async (jobId: string, enabled: boolean) => {
    if (enabled) {
      return api.post(`/scheduler/jobs/${jobId}/resume`);
    } else {
      return api.post(`/scheduler/jobs/${jobId}/pause`);
    }
  },
};

// ─── Browser extension (scoped tokens) ──────────────────────────────────
export type ExtRunStage =
  | "queued" | "opening" | "detecting_fields" | "preparing_answers" | "filling" | "submitting"
  | "validating" | "ready_to_submit" | "waiting_for_input" | "ready_for_review" | "submitted" | "failed" | "skipped"
  | "outcome_unknown" | "already_applied";

export interface ExtRun {
  id: string;
  mode: "review" | "auto_submit";
  status: "active" | "cancelled" | "completed";
  end_reason: string | null;
  auto_submit_authorized_at: string | null;
  created_at: string;
  ended_at: string | null;
  items: {
    application_id: string; title: string; company: string; stage: ExtRunStage;
    submit_authorized: boolean; detail: string | null; job_url: string | null;
  }[];
}

export const extApi = {
  /** Website session -> one-time pairing code bound to the extension's PKCE challenge. Never returns a token. */
  pairStart: (body: { code_challenge: string; state: string; label: string }) =>
    api.post<{ pairing_code: string; expires_in: number }>("/ext/pair/start", body),
  /** Server-verified plan state for the connect page. */
  entitlement: () =>
    api.get<{ entitled: boolean; reason: string; plan: string | null; ends_at: string | null; renewal_cancelled: boolean; plans_url: string }>("/ext/entitlement"),
  /** Create a background run. Automatic submission is recorded server-side only with an explicit acknowledgement. */
  createRun: (body: { application_ids: string[]; mode: "review" | "auto_submit"; acknowledge_auto_submit: boolean }) =>
    api.post<ExtRun>("/ext/runs", body),
  latestRun: () => api.get<{ run: ExtRun | null }>("/ext/runs/latest"),
  cancelRun: (id: string) => api.post<ExtRun>(`/ext/runs/${id}/cancel`),
  listTokens: () => api.get<{ tokens: { id: string; label: string; created_at: string; last_seen_at: string | null; expires_at: string; revoked: boolean }[] }>("/ext/tokens"),
  revokeToken: (id: string) => api.delete(`/ext/tokens/${id}`),
};

export interface ContactPayload {
  first_name: string;
  last_name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}


export const contactApi = {
  submit: (data: ContactPayload) =>
    api.post<{ ok: boolean; message: string; id: string }>("/contact", data),
};

// ─── Productivity Integrations ─────────────────────────────────────────────
export interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  logo: string;
  description: string;
  capabilities: string[];
  status: "connected" | "not_connected" | "setup_required" | "coming_soon" | "needs_reauth" | "error" | "available_manually";
  status_message?: string;
  account_identifier?: string;
  account_email?: string;
  account_name?: string;
  connected_at?: string;
  last_sync_at?: string;
  granted_scopes?: string;
  is_oauth?: boolean;
  is_browser_platform?: boolean;
  is_external_portal?: boolean;
  is_webhook?: boolean;
  is_telegram_bot?: boolean;
  setup_notes?: string;
  requires_config?: string[];
}

export interface IntegrationsSummary {
  connected_count: number;
  attention_count: number;
  connected_providers: string[];
  needs_attention_providers: string[];
}

export const integrationsApi = {
  list: () => api.get<IntegrationItem[]>("/integrations"),
  summary: () => api.get<IntegrationsSummary>("/integrations/summary"),
  getAuthUrl: (provider: string) => api.get<{ auth_url: string; provider: string }>(`/integrations/${provider}/auth-url`),
  disconnect: (provider: string) => api.post<{ success: boolean; provider: string; message: string }>(`/integrations/${provider}/disconnect`),
  checkHealth: (provider: string) => api.get<{ provider: string; status: string; healthy: boolean }>(`/integrations/${provider}/health`),
  driveImport: (data: { file_id: string; name?: string }) => api.post("/integrations/google_drive/import", data),
  driveExport: (data: { doc_type: "resume" | "cover_letter"; doc_id: string }) => api.post("/integrations/google_drive/export", data),
  githubRepos: () => api.get<{ repositories: { name: string; full_name: string; description: string; html_url: string; language: string; stargazers_count: number; forks_count: number; topics: string[]; updated_at: string }[] }>("/integrations/github/repos"),
  githubSync: (selected_repos: string[]) => api.post("/integrations/github/sync-projects", { selected_repos }),
  createCalendarEvent: (data: { title: string; start_time: string; duration_minutes?: number; description?: string; meeting_link?: string; user_timezone?: string }) =>
    api.post("/integrations/google_calendar/events", data),

  // Slack
  slackTestNotification: (message?: string) =>
    api.post<{ success: boolean; message: string }>("/integrations/slack/test-notification", message ? { message } : {}),
  getSlackPrefs: () => api.get<{ prefs: Record<string, boolean> }>("/integrations/slack/prefs"),
  updateSlackPrefs: (notification_prefs: Record<string, boolean>) =>
    api.patch<{ success: boolean; prefs: Record<string, boolean> }>("/integrations/slack/prefs", { notification_prefs }),

  // Notion
  notionListDatabases: () =>
    api.get<{ databases: Array<Record<string, unknown>> }>("/integrations/notion/databases"),
  notionSelectDatabase: (data: { database_id: string; database_title: string }) =>
    api.post<{ success: boolean; database_id: string; database_title: string }>("/integrations/notion/select-database", data),
  notionSync: (data?: { database_id?: string; limit?: number }) =>
    api.post<{ success: boolean; synced: number; errors: number; database_id: string }>("/integrations/notion/sync", data || {}),

  // Telegram
  telegramGenerateLinkCode: () =>
    api.post<{
      code: string;
      expires_in: number;
      deep_link: string;
      bot_username: string;
      instructions?: string;
    }>("/integrations/telegram/link-code"),
  telegramUnlink: () => api.delete<{ success: boolean; message: string }>("/integrations/telegram/unlink"),

  // Calendly
  calendlyEventTypes: () => api.get<{ event_types: Array<Record<string, unknown>> }>("/integrations/calendly/event-types"),
  calendlyEvents: () => api.get<{ events: Array<Record<string, unknown>> }>("/integrations/calendly/events"),

  // Webhooks (Zapier/Make/n8n)
  listWebhookEndpoints: () =>
    api.get<{
      endpoints: Array<{
        id: string;
        provider: string;
        label?: string | null;
        subscribed_events: string[];
        enabled: boolean;
        created_at?: string | null;
        updated_at?: string | null;
      }>;
    }>("/integrations/webhook-endpoints"),
  createWebhookEndpoint: (data: { url: string; events: string[]; label?: string | null }) =>
    api.post<{
      success: boolean;
      endpoint: {
        id: string;
        provider: string;
        label?: string | null;
        subscribed_events: string[];
        enabled: boolean;
      };
    }>("/integrations/webhook-endpoints", data),
  createProviderWebhookEndpoint: (provider: string, data: { url: string; events: string[]; label?: string | null }) =>
    api.post<{
      success: boolean;
      endpoint: {
        id: string;
        provider: string;
        label?: string | null;
        subscribed_events: string[];
        enabled: boolean;
      };
    }>(`/integrations/${provider}/webhook-endpoints`, data),
  updateWebhookEndpoint: (endpointId: string, data: { events?: string[]; enabled?: boolean; label?: string | null }) =>
    api.patch<{
      success: boolean;
      endpoint: {
        id: string;
        subscribed_events: string[];
        enabled: boolean;
        label?: string | null;
      };
    }>(`/integrations/webhook-endpoints/${endpointId}`, data),
  deleteWebhookEndpoint: (endpointId: string) =>
    api.delete<{ success: boolean; message: string }>(`/integrations/webhook-endpoints/${endpointId}`),
  testWebhookEndpoint: (endpointId: string) =>
    api.post<{ success: boolean; message: string }>(`/integrations/webhook-endpoints/${endpointId}/test`),
  getWebhookDeliveries: (endpointId: string) =>
    api.get<{
      deliveries: Array<{
        id: string;
        event_type: string;
        status: string;
        attempt_count: number;
        http_status?: number | null;
        response_body_excerpt?: string | null;
        error_message?: string | null;
        created_at?: string | null;
        delivered_at?: string | null;
      }>;
    }>(`/integrations/webhook-endpoints/${endpointId}/deliveries`),
  getSupportedWebhookEvents: () => api.get<{ events: string[] }>("/integrations/webhook-endpoints/supported-events"),
};

