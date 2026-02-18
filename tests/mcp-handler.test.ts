import { createQirrelAgentBridge, createMcpRequestHandler } from "../src/agent";

describe("mcp request handler", () => {
  test("supports initialize and tools/list", async () => {
    const bridge = createQirrelAgentBridge();
    const handle = createMcpRequestHandler(bridge);

    const initResponse = await handle({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
      },
    });

    expect(initResponse.jsonrpc).toBe("2.0");
    expect(initResponse.id).toBe(1);
    expect(initResponse.result).toHaveProperty("capabilities");
    expect(initResponse.result).toHaveProperty("serverInfo");

    const toolsResponse = await handle({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
    });

    expect(toolsResponse.id).toBe(2);
    expect(Array.isArray(toolsResponse.result?.tools)).toBe(true);
    expect(
      toolsResponse.result?.tools.some((tool: { name: string }) => tool.name === "qirrel.parse_text"),
    ).toBe(true);
  });

  test("supports tools/call and returns MCP tool payload", async () => {
    const bridge = createQirrelAgentBridge();
    const handle = createMcpRequestHandler(bridge);

    const response = await handle({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "qirrel.parse_text",
        arguments: {
          text: "Call +1 415 555 2671",
        },
      },
    });

    expect(response.id).toBe(3);
    expect(Array.isArray(response.result?.content)).toBe(true);
    expect(response.result?.structuredContent).toHaveProperty("data");
  });
});
