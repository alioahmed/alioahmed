import * as fs from "fs";
import * as path from "path";
import { CONFIG } from "./config";

type LogLevel = "info" | "warn" | "error" | "success";

export class Logger {
  private logFile: string;
  private prefix: string;
  private entries: Array<{ timestamp: string; level: LogLevel; message: string; data?: unknown }> = [];
  private startTime: number;

  constructor(subdirectory: string, prefix: string) {
    this.prefix = prefix;
    this.startTime = Date.now();
    const dir = path.join(CONFIG.logsDir, subdirectory);
    fs.mkdirSync(dir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    this.logFile = path.join(dir, `${prefix}-${timestamp}.json`);
  }

  info(message: string, data?: unknown): void {
    this.log("info", message, data);
  }

  success(message: string, data?: unknown): void {
    this.log("success", message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown): void {
    this.log("error", message, data);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const prefix = { info: "  ", warn: "  WARN ", error: "  FAIL ", success: "  OK " }[level];
    console.log(`${prefix}${message}`);
    this.entries.push({ timestamp, level, message, ...(data !== undefined && { data }) });
  }

  save(summary?: Record<string, unknown>): string {
    const output = {
      script: this.prefix,
      startedAt: new Date(this.startTime).toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - this.startTime,
      ...(summary && { summary }),
      entries: this.entries,
    };
    fs.writeFileSync(this.logFile, JSON.stringify(output, null, 2));
    console.log(`\n  Log: ${path.relative(process.cwd(), this.logFile)}`);
    return this.logFile;
  }

  getEntries() {
    return this.entries;
  }
}

// Find the most recent prior log of a given type — the primitive that lets a
// script compare this run against the last one (trend / delta reporting).
// Pair with loadLog(): const prev = getLatestLog("gsc", "gsc-report"); ...
export function getLatestLog(subdirectory: string, prefix: string): string | null {
  const dir = path.join(CONFIG.logsDir, subdirectory);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
    .sort()
    .reverse();
  return files.length > 0 ? path.join(dir, files[0]) : null;
}

export function loadLog(filePath: string): Record<string, unknown> | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}
