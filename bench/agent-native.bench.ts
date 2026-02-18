import { Bench } from "tinybench";
import { processText } from "../src/api";
import { createMcpRequestHandler, createQirrelAgentBridge } from "../src/agent";

const sampleText =
  "Contact support@example.com or +1 415 555 2671 and visit https://example.com";

async function run(): Promise<void> {
  const bridge = createQirrelAgentBridge();
  const handle = createMcpRequestHandler(bridge);
  const bench = new Bench({ time: 1_000, warmupTime: 300 });

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

  const rows = bench.tasks.map((task) => ({
    name: task.name,
    "ops/sec": task.result ? Math.round(task.result.hz) : 0,
    "avg ms": task.result ? Number(task.result.mean.toFixed(3)) : 0,
    "p99 ms": task.result ? Number(task.result.p99.toFixed(3)) : 0,
  }));

  console.table(rows);
}

void run();
