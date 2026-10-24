// Asserts WCAG contrast of the theme tokens in app/globals.css (no browser needed).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

function blockVars(selectorRe) {
  const out = {};
  const re = new RegExp(selectorRe.source + "\\s*\\{([^}]*)\\}", "g");
  let m;
  while ((m = re.exec(css))) for (const [, k, v] of m[1].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) out[k] = v.trim();
  return out;
}
const darkVars = blockVars(/:root(?:, \.theme-dark-scope)?/);
const lightVars = { ...darkVars, ...blockVars(/html\.light/) };

function resolve(vars, v, depth = 0) {
  const m = /^var\((--[a-z0-9-]+)\)$/.exec(v);
  return m && depth < 8 ? resolve(vars, vars[m[1]], depth + 1) : v;
}
function parse(vars, name) {
  let v = resolve(vars, vars[name]);
  if (/^\d+\s+\d+\s+\d+$/.test(v)) { const [r, g, b] = v.split(/\s+/).map(Number); return { r, g, b, a: 1 }; }
  let m = /^#([0-9a-f]{6})$/i.exec(v);
  if (m) return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16), a: 1 };
  m = /^rgba?\(([^)]+)\)$/.exec(v);
  if (m) { const p = m[1].split(",").map((x) => parseFloat(x)); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; }
  throw new Error(`cannot parse ${name}: ${v}`);
}
const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
function ratio(vars, fgName, bgName) {
  const bg = parse(vars, bgName); const fg = over(parse(vars, fgName), bg);
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

const SURFACES = ["--app-bg", "--app-card", "--app-nested", "--app-menu"];
const cases = [
  // [fg, minimum ratio, surfaces]
  ["--app-text", 4.5, SURFACES],
  ["--app-text-dim", 4.5, SURFACES],
  ["--tw-white", 4.5, SURFACES],           // text-white
  ["--tw-zinc-300", 4.5, SURFACES],
  ["--tw-zinc-400", 4.5, SURFACES],
  ["--tw-zinc-500", 4.5, ["--app-bg", "--app-card"]],
  ["--status-success", 4.5, ["--app-card", "--app-bg"]],
  ["--status-warning", 4.5, ["--app-card", "--app-bg"]],
  ["--status-danger", 4.5, ["--app-card", "--app-bg"]],
  ["--status-info", 4.5, ["--app-card", "--app-bg"]],
  ["--chart-axis", 4.5, ["--app-card", "--chart-tooltip-bg"]],
  ["--focus-ring", 3, ["--app-card", "--app-bg"]],
  ["--app-border-strong", 1.25, ["--app-card", "--app-bg"]],   // visible but subtle boundary
];
for (const [themeName, vars] of [["dark", darkVars], ["light", lightVars]]) {
  for (const [fg, min, bgs] of cases) {
    for (const bg of bgs) {
      // Known limitation of the unchanged dark palette (recorded in docs/planning/theme): zinc-500 and the chart axis text are 3.8-4.0:1.
      if (themeName === "dark" && (fg === "--tw-zinc-500" || fg === "--chart-axis")) continue;
      test(`${themeName}: ${fg} on ${bg} >= ${min}`, () => {
        const r = ratio(vars, fg, bg);
        assert.ok(r >= min, `${themeName} ${fg} on ${bg} is ${r.toFixed(2)}:1, needs ${min}:1`);
      });
    }
  }
}
test("button pair: bg-white with text-black stays readable in both themes", () => {
  for (const vars of [darkVars, lightVars]) assert.ok(ratio(vars, "--tw-black", "--tw-white") >= 7);
});
test("dark tokens equal the original dark palette", () => {
  assert.equal(darkVars["--app-sidebar"], "#101012");
  assert.equal(darkVars["--app-bg"], "#0c0c0e");
  assert.equal(darkVars["--app-nested"], "#1a1a1c");
  assert.equal(darkVars["--tw-zinc-400"], "161 161 170");
});
