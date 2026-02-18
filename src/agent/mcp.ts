import readline from "node:readline";
import type { Writable } from "node:stream";
import { AgentBridge } from "./bridge";
import type {
  JsonRpcErrorObject,
  JsonRpcErrorResponse,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcSuccessResponse,
} from "./types";

interface McpServerInfo {
  name: string;
  version: string;
}

interface StdioServerOptions {
  input?: NodeJS.ReadableStream;
  output?: Writable;
  error?: Writable;
  protocolVersion?: string;
  serverInfo?: McpServerInfo;
}

const DEFAULT_PROTOCOL_VERSION = "2025-03-26";
const DEFAULT_SERVER_INFO: McpServerInfo = {
  name: "qirrel-mcp",
  version: "0.2.1",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function successResponse(id: string | number | null, result: unknown): JsonRpcSuccessResponse {
  return {
    jsonrpc: "2.0",
    id,
    result,
  };
}

function errorResponse(
  id: string | number | null,
  error: JsonRpcErrorObject,
): JsonRpcErrorResponse {
  return {
    jsonrpc: "2.0",
    id,
    error,
  };
}

export function createMcpRequestHandler(
  bridge: AgentBridge,
  options?: {
    protocolVersion?: string;
    serverInfo?: McpServerInfo;
  },
): (request: JsonRpcRequest) => Promise<JsonRpcResponse> {
  const protocolVersion = options?.protocolVersion ?? DEFAULT_PROTOCOL_VERSION;
  const serverInfo = options?.serverInfo ?? DEFAULT_SERVER_INFO;

  return async (request: JsonRpcRequest): Promise<JsonRpcResponse> => {
    if (request.jsonrpc !== "2.0" || typeof request.method !== "string") {
      return errorResponse(request.id ?? null, {
        code: -32600,
        message: "Invalid Request",
      });
    }

    try {
      switch (request.method) {
        case "initialize":
          return successResponse(request.id ?? null, {
            protocolVersion,
            capabilities: {
              tools: {
                listChanged: false,
              },
            },
            serverInfo,
          });
        case "tools/list":
          return successResponse(request.id ?? null, {
            tools: bridge.listTools(),
          });
        case "tools/call": {
          const params = (request.params ?? {}) as {
            name?: string;
            arguments?: unknown;
          };
          if (typeof params.name !== "string") {
            return errorResponse(request.id ?? null, {
              code: -32602,
              message: "Invalid params: tools/call requires 'name'",
            });
          }
          if (params.arguments !== undefined && !isRecord(params.arguments)) {
            return errorResponse(request.id ?? null, {
              code: -32602,
              message: "Invalid params: tools/call 'arguments' must be an object",
            });
          }

          const result = await bridge.callTool(params.name, params.arguments ?? {});
          return successResponse(request.id ?? null, result);
        }
        case "ping":
          return successResponse(request.id ?? null, {});
        default:
          return errorResponse(request.id ?? null, {
            code: -32601,
            message: `Method not found: ${request.method}`,
          });
      }
    } catch (error) {
      return errorResponse(request.id ?? null, {
        code: -32000,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };
}

export function startMcpStdioServer(
  bridge: AgentBridge,
  options: StdioServerOptions = {},
): { close: () => void } {
  const input = options.input ?? process.stdin;
  const output = options.output ?? process.stdout;
  const error = options.error ?? process.stderr;
  const requestHandlerOptions: { protocolVersion?: string; serverInfo?: McpServerInfo } = {};
  if (options.protocolVersion !== undefined) {
    requestHandlerOptions.protocolVersion = options.protocolVersion;
  }
  if (options.serverInfo !== undefined) {
    requestHandlerOptions.serverInfo = options.serverInfo;
  }
  const handleRequest = createMcpRequestHandler(bridge, requestHandlerOptions);

  const rl = readline.createInterface({
    input,
    crlfDelay: Infinity,
    terminal: false,
  });

  rl.on("line", async (line: string) => {
    const payload = line.trim();
    if (!payload) {
      return;
    }

    let request: JsonRpcRequest;
    try {
      request = JSON.parse(payload) as JsonRpcRequest;
    } catch {
      output.write(
        `${JSON.stringify(
          errorResponse(null, { code: -32700, message: "Parse error" }),
        )}\n`,
      );
      return;
    }

    const response = await handleRequest(request);
    if (request.id !== undefined) {
      output.write(`${JSON.stringify(response)}\n`);
    }
  });

  rl.on("close", () => {
    error.write("qirrel-mcp server stopped\n");
  });

  return {
    close: () => rl.close(),
  };
}
