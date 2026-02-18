import { PassThrough } from "node:stream";
import { createQirrelAgentBridge, createMcpRequestHandler, startMcpStdioServer } from "../src/agent";

describe("mcp hardening", () => {
  test("returns invalid params when tools/call arguments is not an object", async () => {
    const bridge = createQirrelAgentBridge();
    const handle = createMcpRequestHandler(bridge);

    const response = await handle({
      jsonrpc: "2.0",
      id: 101,
      method: "tools/call",
      params: {
        name: "qirrel.parse_text",
        arguments: "not-an-object",
      },
    } as any);

    expect(response).toMatchObject({
      id: 101,
      error: {
        code: -32602,
      },
    });
  });

  test("writes parse errors for malformed JSON lines", async () => {
    const bridge = createQirrelAgentBridge();
    const input = new PassThrough();
    const output = new PassThrough();
    const error = new PassThrough();

    const chunks: string[] = [];
    output.on("data", (chunk) => chunks.push(chunk.toString("utf8")));

    const server = startMcpStdioServer(bridge, { input, output, error });

    input.write("{\"jsonrpc\": \"2.0\",\n");
    await new Promise((resolve) => setTimeout(resolve, 20));

    server.close();

    const combined = chunks.join("");
    expect(combined).toContain('"code":-32700');
    expect(combined).toContain('"message":"Parse error"');
  });

  test("does not emit output for notifications without id", async () => {
    const bridge = createQirrelAgentBridge();
    const input = new PassThrough();
    const output = new PassThrough();
    const error = new PassThrough();

    const chunks: string[] = [];
    output.on("data", (chunk) => chunks.push(chunk.toString("utf8")));

    const server = startMcpStdioServer(bridge, { input, output, error });

    input.write(
      `${JSON.stringify({ jsonrpc: "2.0", method: "ping" })}\n`,
    );
    await new Promise((resolve) => setTimeout(resolve, 20));

    server.close();

    expect(chunks.join("").trim()).toBe("");
  });
});
