#!/usr/bin/env node
import os from "node:os";
import { fileURLToPath } from "node:url";

/** First non-internal IPv4 (Wi‑Fi / Ethernet) for phone URL */
export function getLanIp() {
  const nets = os.networkInterfaces();
  for (const ifaces of Object.values(nets)) {
    for (const net of ifaces ?? []) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return null;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const ip = getLanIp();
  if (ip) console.log(ip);
  else process.exit(1);
}
