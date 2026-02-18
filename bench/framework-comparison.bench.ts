import { Bench } from "tinybench";
import { AgentBridge, createMcpRequestHandler } from "../src/agent";
import { printRows, toRows, type BenchmarkRow } from "./shared";

type HandlerArgs = { text: string };
type HandlerResult = { normalized: string; hasEmail: boolean; length: number };

type Dispatcher = {
  name: string;
  invoke: (args: HandlerArgs) => Promise<unknown>;
};

const sampleArgs: HandlerArgs = {
  text: "Contact support@example.com for status updates",
};

const baseHandler = async ({ text }: HandlerArgs): Promise<HandlerResult> => ({
  normalized: text.toLowerCase(),
  hasEmail: /@/.test(text),
  length: text.length,
});

async function createQirrelDispatcher(handler: typeof baseHandler): Promise<Dispatcher[]> {
  const bridge = new AgentBridge();
  bridge.registerApiTool(
    {
      name: "benchmark.parse",
      description: "Benchmark parser",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string" },
        },
        required: ["text"],
      },
    },
    handler,
  );

  const mcp = createMcpRequestHandler(bridge);

  return [
    {
      name: "Qirrel AgentBridge",
      invoke: (args) => bridge.callTool("benchmark.parse", args),
    },
    {
      name: "Qirrel MCP Handler",
      invoke: async (args) =>
        mcp({
          jsonrpc: "2.0",
          id: 1,
          method: "tools/call",
          params: {
            name: "benchmark.parse",
            arguments: args,
          },
        }),
    },
  ];
}

async function createLangChainDispatcher(handler: typeof baseHandler): Promise<Dispatcher | undefined> {
  try {
    const [{ tool }, { z }] = await Promise.all([import("langchain"), import("zod")]);

    const wrapped = tool(
      async ({ text }: HandlerArgs) => handler({ text }),
      {
        name: "benchmark.parse",
        description: "Benchmark parser",
        schema: z.object({
          text: z.string(),
        }),
      },
    );

    return {
      name: "LangChain tool()",
      invoke: (args) => wrapped.invoke(args),
    };
  } catch {
    return undefined;
  }
}

async function createAiSdkDispatcher(handler: typeof baseHandler): Promise<Dispatcher | undefined> {
  try {
    const [{ tool }, { z }] = await Promise.all([import("ai"), import("zod")]);

    const wrapped = tool({
      description: "Benchmark parser",
      inputSchema: z.object({
        text: z.string(),
      }),
      execute: async ({ text }: HandlerArgs) => handler({ text }),
    });

    return {
      name: "AI SDK tool()",
      invoke: async (args) => {
        if (typeof wrapped.execute !== "function") {
          throw new Error("AI SDK tool execute() is unavailable");
        }
        return wrapped.execute(args, {} as never);
      },
    };
  } catch {
    return undefined;
  }
}

interface FrameworkBenchmarkOptions {
  timeMs?: number;
  warmupTimeMs?: number;
  printTable?: boolean;
}

export async function runFrameworkComparisonBenchmark(
  options: FrameworkBenchmarkOptions = {},
): Promise<{ rows: BenchmarkRow[]; skipped: string[] }> {
  const bench = new Bench({
    time: options.timeMs ?? 1_000,
    warmupTime: options.warmupTimeMs ?? 300,
  });
  const qirrelDispatchers = await createQirrelDispatcher(baseHandler);
  const langchainDispatcher = await createLangChainDispatcher(baseHandler);
  const aiDispatcher = await createAiSdkDispatcher(baseHandler);

  bench.add("Direct handler", async () => {
    await baseHandler(sampleArgs);
  });

  for (const dispatcher of qirrelDispatchers) {
    bench.add(dispatcher.name, async () => {
      await dispatcher.invoke(sampleArgs);
    });
  }

  if (langchainDispatcher) {
    bench.add(langchainDispatcher.name, async () => {
      await langchainDispatcher.invoke(sampleArgs);
    });
  }

  if (aiDispatcher) {
    bench.add(aiDispatcher.name, async () => {
      await aiDispatcher.invoke(sampleArgs);
    });
  }

  await bench.run();
  const rows = toRows(bench.tasks, "Direct handler");
  const skipped = [
    !langchainDispatcher ? "langchain" : null,
    !aiDispatcher ? "ai" : null,
  ].filter((value): value is string => Boolean(value));

  if (options.printTable ?? true) {
    printRows(rows);

    if (skipped.length > 0) {
      console.log(`Skipped optional frameworks: ${skipped.join(", ")}`);
    }
  }

  return { rows, skipped };
}

if (process.argv[1]?.includes("framework-comparison.bench.ts")) {
  void runFrameworkComparisonBenchmark();
}
