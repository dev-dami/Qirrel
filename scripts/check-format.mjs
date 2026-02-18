#!/usr/bin/env node

import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const EXCLUDED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "coverage",
  ".tmp",
]);
const EXCLUDED_FILES = new Set(["bun.lock", "package-lock.json"]);
const CHECKED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".cjs",
  ".mjs",
  ".json",
  ".md",
  ".yml",
  ".yaml",
]);

function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRS.has(entry.name)) walk(fullPath, out);
      continue;
    }
    if (!entry.isFile()) continue;
    if (EXCLUDED_FILES.has(entry.name)) continue;
    const ext = entry.name.includes(".")
      ? `.${entry.name.split(".").pop().toLowerCase()}`
      : "";
    if (CHECKED_EXTENSIONS.has(ext)) out.push(fullPath);
  }
}

const files = [];
walk(ROOT, files);

const failures = [];
for (const filePath of files) {
  const relativePath = relative(ROOT, filePath);
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("\r")) {
      failures.push(`${relativePath}:${i + 1} contains CRLF characters`);
    }
    if (/\t/.test(line)) {
      failures.push(`${relativePath}:${i + 1} contains tab indentation`);
    }
    if (/[ \t]+$/.test(line)) {
      failures.push(`${relativePath}:${i + 1} has trailing whitespace`);
    }
  }
}

if (failures.length > 0) {
  console.error("format:check failed");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("format:check passed");
