#!/usr/bin/env node
import { rmSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");

for (const dir of [".next", join("node_modules", ".cache")]) {
  const target = join(root, dir);
  try {
    rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
    console.log(`Removed ${dir}`);
  } catch (err) {
    console.warn(`Could not remove ${dir} — stop dev servers first (npm run dev:reset)`);
    if (err instanceof Error) console.warn(err.message);
  }
}
