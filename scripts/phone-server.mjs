#!/usr/bin/env node
/**
 * Stable phone testing: production build + LAN server (no flaky dev HMR).
 */
import { spawn } from "node:child_process";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { getLanIp } from "./get-lan-ip.mjs";

const root = join(import.meta.dirname, "..");
const port = 3000;

execSync("node scripts/kill-ports.mjs", { cwd: root, stdio: "inherit" });
execSync("sleep 0.6", { cwd: root, stdio: "inherit" });
execSync("node scripts/clean-next.mjs", { cwd: root, stdio: "inherit" });
execSync("npm run build", { cwd: root, stdio: "inherit" });

const ip = getLanIp();
const bust = Date.now();
const full = `?b=${bust}`;
const macUrl = `http://127.0.0.1:${port}`;
const phoneUrl = ip ? `http://${ip}:${port}` : null;

console.log("\n✓ Production server (best for phone)\n");
console.log(`  Mac:           ${macUrl}`);
console.log(`  Mac (full):    ${macUrl}${full}`);
if (phoneUrl) {
  console.log(`  Phone (full):  ${phoneUrl}${full}  (same Wi‑Fi — tap bow first)`);
} else {
  console.log("  Phone:  run `ipconfig getifaddr en0` and use http://YOUR_IP:3000");
}
console.log(`  Mobile video:  ${macUrl}/images/landing3-mobile.mp4`);
console.log(`  Mac video:     ${macUrl}/images/landing4-desktop.mp4`);
console.log("\n  (Run npm run phone after replacing video files so the server picks them up.)\n");
console.log("");

const child = spawn("npm", ["run", "start:lan"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
