import { processText, processTexts } from "../api";
import { AgentBridge } from "./bridge";
import type { AgentToolDefinition } from "./types";

interface ParseTextArgs {
  text: string;
  configPath?: string;
}

interface ParseBatchArgs {
  texts: string[];
  configPath?: string;
  concurrency?: number;
}

function resolveConfigPath(
  overrideConfigPath: string | undefined,
  defaultConfigPath: string | undefined,
): string | undefined {
  return overrideConfigPath ?? defaultConfigPath;
}

export function createQirrelAgentBridge(defaultConfigPath?: string): AgentBridge {
  const bridge = new AgentBridge();

  const parseTextDefinition: AgentToolDefinition = {
    name: "qirrel.parse_text",
    description: "Parse one text input into a structured QirrelContext",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        text: { type: "string", description: "Raw input text to parse" },
        configPath: {
          type: "string",
          description: "Optional config path override",
        },
      },
      required: ["text"],
    },
    annotations: {
      title: "Parse Single Text",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    examples: [
      {
        title: "Extract entities from one message",
        arguments: {
          text: "Email hello@example.com and call +1 415 555 2671",
        },
      },
    ],
    tags: ["qirrel", "parse", "entities"],
  };

  const parseBatchDefinition: AgentToolDefinition = {
    name: "qirrel.parse_batch",
    description: "Parse many text inputs while preserving order",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {
        texts: {
          type: "array",
          items: { type: "string" },
          description: "List of text inputs",
        },
        configPath: {
          type: "string",
          description: "Optional config path override",
        },
        concurrency: {
          type: "number",
          description: "Maximum parallel workers for batch processing",
        },
      },
      required: ["texts"],
    },
    annotations: {
      title: "Parse Batch",
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    examples: [
      {
        title: "Parse multiple support messages",
        arguments: {
          texts: [
            "Reach me at team@example.com",
            "Website https://example.com and phone +44 20 7946 0958",
          ],
          concurrency: 2,
        },
      },
    ],
    tags: ["qirrel", "parse", "batch"],
  };

  bridge.registerApiTool<ParseTextArgs>(
    parseTextDefinition,
    async (args) => {
      if (typeof args?.text !== "string") {
        throw new TypeError("qirrel.parse_text expects a string 'text' argument");
      }

      return processText(
        args.text,
        resolveConfigPath(args.configPath, defaultConfigPath),
      );
    },
  );

  bridge.registerApiTool<ParseBatchArgs>(
    parseBatchDefinition,
    async (args) => {
      if (!Array.isArray(args?.texts)) {
        throw new TypeError("qirrel.parse_batch expects a string[] 'texts' argument");
      }

      return processTexts(
        args.texts,
        resolveConfigPath(args.configPath, defaultConfigPath),
        args.concurrency === undefined ? undefined : { concurrency: args.concurrency },
      );
    },
  );

  bridge.registerTool(
    {
      name: "qirrel.tool_help",
      description:
        "Explain available Qirrel tools, their arguments, and examples so an agent can choose and call correctly",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: {
            type: "string",
            description:
              "Optional specific tool name. If omitted, returns a summarized catalog.",
          },
        },
      },
      annotations: {
        title: "Tool Help",
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      examples: [
        {
          title: "Get help for one tool",
          arguments: { name: "qirrel.parse_text" },
        },
      ],
      tags: ["qirrel", "help", "discovery"],
    },
    (args: unknown) => {
      const name =
        typeof args === "object" &&
        args !== null &&
        "name" in args &&
        typeof (args as { name?: unknown }).name === "string"
          ? (args as { name: string }).name
          : undefined;
      const allTools = bridge.listTools().filter((tool) => tool.name !== "qirrel.tool_help");
      const picked = name ? bridge.getToolDefinition(name) : undefined;

      if (name && !picked) {
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: `Tool '${name}' not found. Call qirrel.tool_help with no arguments to list tools.`,
            },
          ],
          structuredContent: {
            found: false,
            availableTools: allTools.map((tool) => tool.name),
          },
        };
      }

      if (picked) {
        const usageLine = `Usage: call '${picked.name}' with JSON arguments that match the inputSchema.`;
        return {
          content: [
            {
              type: "text" as const,
              text: `${picked.name}\n${picked.description}\n${usageLine}`,
            },
          ],
          structuredContent: {
            found: true,
            tool: picked,
          },
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Available tools: ${allTools.map((tool) => tool.name).join(", ")}. Usage: call qirrel.tool_help with {"name":"<tool_name>"} for details.`,
          },
        ],
        structuredContent: {
          found: true,
          tools: allTools.map((tool) => ({
            name: tool.name,
            description: tool.description,
          })),
        },
      };
    },
  );

  return bridge;
}
