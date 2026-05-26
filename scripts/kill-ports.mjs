#!/usr/bin/env node
import { execSync } from "node:child_process";

const ports = [3000, 3001, 3002, 3010, 3011, 3012];

for (const port of ports) {
  try {
    const pids = execSync(`lsof -ti:${port}`, { encoding: "utf8" }).trim();
    if (pids) {
      execSync(`kill -9 ${pids.split("\n").filter(Boolean).join(" ")}`, {
        stdio: "inherit",
      });
      console.log(`Stopped process on port ${port}`);
    }
  } catch {
    /* port free */
  }
}
