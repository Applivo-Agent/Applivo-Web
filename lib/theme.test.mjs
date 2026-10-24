import test from "node:test";
import assert from "node:assert/strict";
import { normalizeTheme, resolveInitialTheme, isThemedPath, effectiveTheme, THEME_STORAGE_KEY } from "./theme.ts";

test("storage key is namespaced and distinct from applivo_ preference keys", () => {
  assert.equal(THEME_STORAGE_KEY, "applivo-theme");
  assert.ok(!THEME_STORAGE_KEY.startsWith("applivo_"));
});

test("normalizeTheme accepts only light, dark and system", () => {
  for (const v of ["light", "dark", "system"]) assert.equal(normalizeTheme(v), v);
  assert.equal(normalizeTheme(" LIGHT "), "light");
  for (const bad of [null, undefined, "", "blue", "auto", 3, {}, [], "dark;drop"]) assert.equal(normalizeTheme(bad), null);
});

test("precedence: local choice, then account, then system, then dark", () => {
  assert.equal(resolveInitialTheme({ local: "light", account: "dark", systemAvailable: true }), "light");
  assert.equal(resolveInitialTheme({ local: "garbage", account: "light", systemAvailable: true }), "light");
  assert.equal(resolveInitialTheme({ local: null, account: "system", systemAvailable: false }), "system");
  assert.equal(resolveInitialTheme({ local: null, account: "nonsense", systemAvailable: true }), "system");
  assert.equal(resolveInitialTheme({ local: undefined, account: undefined, systemAvailable: false }), "dark");
});

test("every route is themed (public site included); null is not", () => {
  for (const p of ["/", "/dashboard", "/admin", "/pricing", "/docs", "/docs/faq", "/blog", "/blog/x", "/contact", "/login", "/admin/login", "/extension/connect", "/onboarding"]) assert.equal(isThemedPath(p), true, p);
  for (const p of [null, undefined, ""]) assert.equal(isThemedPath(p), false, String(p));
});

test("effective theme: flag off or marketing route is always dark", () => {
  const base = { preference: "light", systemLight: true };
  assert.equal(effectiveTheme({ ...base, pathname: "/dashboard", enabled: false }), "dark");
  assert.equal(effectiveTheme({ ...base, pathname: "/pricing", enabled: true }), "light");   // pricing is themed now
  assert.equal(effectiveTheme({ ...base, pathname: null, enabled: true }), "dark");
  assert.equal(effectiveTheme({ ...base, pathname: "/", enabled: true }), "light");   // landing page is themed
  assert.equal(effectiveTheme({ ...base, pathname: "/dashboard", enabled: true }), "light");
  assert.equal(effectiveTheme({ preference: "system", systemLight: false, pathname: "/admin", enabled: true }), "dark");
  assert.equal(effectiveTheme({ preference: "system", systemLight: true, pathname: "/admin", enabled: true }), "light");
});
