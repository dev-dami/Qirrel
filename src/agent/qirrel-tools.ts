import { processText, processTexts } from "../api";
import { AgentBridge } from "./bridge";

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

  bridge.registerApiTool<ParseTextArgs>(
    {
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
    },
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
    {
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
    },
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

  return bridge;
}
