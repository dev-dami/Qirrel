import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runAgentNativeBenchmark } from "./agent-native.bench";
import { runFrameworkComparisonBenchmark } from "./framework-comparison.bench";
import type { BenchmarkRow } from "./shared";

function toMarkdownTable(rows: BenchmarkRow[]): string {
  const header = "| Scenario | ops/sec | avg ms | p99 ms | vs direct |";
  const divider = "| --- | ---: | ---: | ---: | ---: |";
  const body = rows
    .map(
      (row) =>
        `| ${row.name} | ${row.opsPerSec} | ${row.avgMs.toFixed(3)} | ${row.p99Ms.toFixed(3)} | ${row.slowdownVsBaseline.toFixed(2)}x |`,
    )
    .join("\n");

  return [header, divider, body].join("\n");
}

function getSystemSummary(): string[] {
  const cpus = os.cpus();
  const cpuModel = cpus[0]?.model ?? "unknown";

  return [
    `- Date (UTC): ${new Date().toISOString()}`,
    `- Runtime: Bun ${process.versions.bun ?? "unknown"}`,
    `- OS: ${os.platform()} ${os.release()} (${os.arch()})`,
    `- CPU: ${cpuModel}`,
    `- Logical cores: ${cpus.length}`,
  ];
}

function summarizeFrameworkAdvantage(rows: BenchmarkRow[]): string[] {
  const qirrelBridge = rows.find((row) => row.name === "Qirrel AgentBridge");
  const qirrelMcp = rows.find((row) => row.name === "Qirrel MCP Handler");
  const langchain = rows.find((row) => row.name === "LangChain tool()");
  const aiSdk = rows.find((row) => row.name === "AI SDK tool()");

  const summary: string[] = [];

  if (qirrelBridge && langchain && langchain.opsPerSec > 0) {
    summary.push(
      `- Qirrel AgentBridge is ${(qirrelBridge.opsPerSec / langchain.opsPerSec).toFixed(2)}x faster than LangChain tool() in this run.`,
    );
  }

  if (qirrelMcp && langchain && langchain.opsPerSec > 0) {
    summary.push(
      `- Qirrel MCP handler is ${(qirrelMcp.opsPerSec / langchain.opsPerSec).toFixed(2)}x faster than LangChain tool() in this run.`,
    );
  }

  if (qirrelMcp && aiSdk && aiSdk.opsPerSec > 0) {
    summary.push(
      `- Qirrel MCP handler runs at ${(qirrelMcp.opsPerSec / aiSdk.opsPerSec).toFixed(2)}x of AI SDK tool() throughput while adding MCP compatibility.`,
    );
  }

  return summary;
}

async function run(): Promise<void> {
  const agentRows = await runAgentNativeBenchmark();
  const framework = await runFrameworkComparisonBenchmark();
  const notes = summarizeFrameworkAdvantage(framework.rows);
  const markdown = `# Benchmark Report (Local Machine)

[Docs Home](./README.md) | [Benchmarks](./benchmarks.md) | [Framework Comparison](./framework-comparison.md) | [Agent-Native](./agent-native.md)

This report is generated from this repository with:

\`\`\`bash
bun run bench:report
\`\`\`

## Machine

${getSystemSummary().join("\n")}

## Agent Overhead

${toMarkdownTable(agentRows)}

## Framework Comparison

${toMarkdownTable(framework.rows)}

${notes.length > 0 ? `## Highlights\n\n${notes.join("\n")}\n` : ""}
${framework.skipped.length > 0 ? `## Skipped Frameworks\n\n- ${framework.skipped.join("\n- ")}\n` : ""}
## Reproduce

1. Close heavy background apps.
2. Run \`bun run bench:report\` twice.
3. Commit this file if the numbers are representative.
`;

  const outputPath = path.resolve(__dirname, "..", "docs", "benchmark-report.md");
  fs.writeFileSync(outputPath, markdown, "utf8");
  console.log(`Wrote benchmark report to ${outputPath}`);
}

void run();

