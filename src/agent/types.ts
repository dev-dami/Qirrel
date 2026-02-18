export interface AgentToolAnnotations {
  title?: string;
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface AgentToolExample {
  title?: string;
  arguments: Record<string, unknown>;
}

export interface AgentToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  annotations?: AgentToolAnnotations;
  examples?: AgentToolExample[];
  tags?: string[];
}

export interface AgentToolContent {
  type: "text";
  text: string;
}

export interface AgentToolResult {
  content: AgentToolContent[];
  structuredContent?: unknown;
  isError?: boolean;
}

export type AgentToolHandler<TArgs = unknown> = (
  args: TArgs,
) => Promise<AgentToolResult> | AgentToolResult;

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
}

export interface JsonRpcSuccessResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result: unknown;
}

export interface JsonRpcErrorObject {
  code: number;
  message: string;
  data?: unknown;
}

export interface JsonRpcErrorResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  error: JsonRpcErrorObject;
}

export type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;
