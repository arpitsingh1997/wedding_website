#!/usr/bin/env node
/**
 * Stops stale Next servers, clears .next, starts dev on all interfaces (Mac + phone).
 * If phone shows errors, use: npm run phone  (production build, more reliable)
 */
import { spawn } from "node:child_process";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { getLanIp } from "./get-lan-ip.mjs";

const root = join(import.meta.dirname, "..");

execSync("node scripts/kill-ports.mjs", { cwd: root, stdio: "inherit" });
execSync("node scripts/clean-next.mjs", { cwd: root, stdio: "inherit" });

const ip = getLanIp();
console.log("Starting dev server (LAN)…");
console.log("  Mac:    http://127.0.0.1:3000");
if (ip) {
  console.log(`  Phone:  http://${ip}:3000  (same Wi‑Fi)`);
  console.log("  If phone shows an error, stop this and run: npm run phone\n");
} else {
  console.log("  Phone:  npm run phone  (after Wi‑Fi connected)\n");
}

const child = spawn("npm", ["run", "dev:phone"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
