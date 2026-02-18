import type { AgentToolDefinition, AgentToolHandler, AgentToolResult } from "./types";

interface RegisteredTool {
  definition: AgentToolDefinition;
  handler: AgentToolHandler;
}

function isAgentToolResult(value: unknown): value is AgentToolResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AgentToolResult>;
  return Array.isArray(candidate.content);
}

function stringifyForAgents(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export class AgentBridge {
  private readonly tools = new Map<string, RegisteredTool>();

  public registerTool(definition: AgentToolDefinition, handler: AgentToolHandler): this {
    if (this.tools.has(definition.name)) {
      throw new Error(`Tool '${definition.name}' is already registered`);
    }

    this.tools.set(definition.name, { definition, handler });
    return this;
  }

  public registerApiTool<TArgs = unknown, TOutput = unknown>(
    definition: AgentToolDefinition,
    handler: (args: TArgs) => Promise<TOutput> | TOutput,
  ): this {
    return this.registerTool(definition, async (args: unknown) =>
      this.toAgentToolResult(await handler(args as TArgs)),
    );
  }

  public listTools(): AgentToolDefinition[] {
    return [...this.tools.values()].map((tool) => tool.definition);
  }

  public async callTool(name: string, args: unknown): Promise<AgentToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown tool '${name}'`);
    }

    const result = await tool.handler(args);
    return this.toAgentToolResult(result);
  }

  private toAgentToolResult(value: unknown): AgentToolResult {
    if (isAgentToolResult(value)) {
      return value;
    }

    return {
      content: [
        {
          type: "text",
          text: stringifyForAgents(value),
        },
      ],
      structuredContent: value,
    };
  }
}
