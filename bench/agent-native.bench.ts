import { Bench } from "tinybench";
import { processText } from "../src/api";
import { createMcpRequestHandler, createQirrelAgentBridge } from "../src/agent";
import { printRows, toRows, type BenchmarkRow } from "./shared";

const sampleText =
  "Contact support@example.com or +1 415 555 2671 and visit https://example.com";

interface AgentBenchmarkOptions {
  timeMs?: number;
  warmupTimeMs?: number;
  printTable?: boolean;
}

export async function runAgentNativeBenchmark(
  options: AgentBenchmarkOptions = {},
): Promise<BenchmarkRow[]> {
  const bridge = createQirrelAgentBridge();
  const handle = createMcpRequestHandler(bridge);
  const bench = new Bench({
    time: options.timeMs ?? 1_000,
    warmupTime: options.warmupTimeMs ?? 300,
  });

  bench.add("direct: processText()", async () => {
    await processText(sampleText);
  });

  bench.add("agent bridge: qirrel.parse_text", async () => {
    await bridge.callTool("qirrel.parse_text", { text: sampleText });
  });

  bench.add("mcp handler: tools/call", async () => {
    await handle({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "qirrel.parse_text",
        arguments: { text: sampleText },
      },
    });
  });

  await bench.run();
  const rows = toRows(bench.tasks, "direct: processText()");

  if (options.printTable ?? true) {
    printRows(rows);
  }

  return rows;
}

if (process.argv[1]?.includes("agent-native.bench.ts")) {
  void runAgentNativeBenchmark();
}
