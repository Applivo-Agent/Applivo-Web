/** Decides what the admin Queue page may show. A failed request is NEVER turned into a successful zero. */
export interface QueueStats {
  pending: number;
  applying: number;
  failed: number;
  total_jobs: number;
  scheduled_tasks: { id: string; name: string; next_run: string | null }[];
  scheduler_running: boolean;
  celery_workers: { name: string; status: string; concurrency: number; active_tasks: number; reserved_tasks: number }[];
  celery_error?: string | null;
}

export type QueueView =
  | { kind: "loading" }
  | { kind: "unavailable"; message: string }
  | { kind: "ok"; stats: QueueStats; workersKnown: boolean };

export function queueView(input: { stats: QueueStats | null; error: string | null }): QueueView {
  if (input.error) return { kind: "unavailable", message: input.error };      // an error always wins over any stale numbers
  if (!input.stats) return { kind: "loading" };
  return { kind: "ok", stats: input.stats, workersKnown: !input.stats.celery_error };
}
