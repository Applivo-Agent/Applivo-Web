import test from "node:test";
import assert from "node:assert/strict";
import { queueView } from "./queue-state.ts";

const zeros = { pending: 0, applying: 0, failed: 0, total_jobs: 0, scheduled_tasks: [], scheduler_running: true, celery_workers: [] };

test("a failed request is unavailable, never a zero-valued success", () => {
  const v = queueView({ stats: null, error: "Queue service unavailable" });
  assert.equal(v.kind, "unavailable");
  assert.equal(v.stats, undefined);
});

test("an error wins even if older numbers are still around", () => {
  assert.equal(queueView({ stats: zeros, error: "timeout" }).kind, "unavailable");
});

test("a genuine response of zeros is shown as zeros", () => {
  const v = queueView({ stats: zeros, error: null });
  assert.equal(v.kind, "ok");
  assert.equal(v.stats.pending, 0);
  assert.equal(v.workersKnown, true);
});

test("counts are shown but workers are marked unknown when worker inspection failed", () => {
  const v = queueView({ stats: { ...zeros, pending: 4, celery_error: "broker unreachable" }, error: null });
  assert.equal(v.kind, "ok");
  assert.equal(v.workersKnown, false);
});

test("no data and no error means still loading", () => {
  assert.equal(queueView({ stats: null, error: null }).kind, "loading");
});
