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
    expect(
      toolsResponse.result?.tools.some((tool: { name: string }) => tool.name === "qirrel.tool_help"),
    ).toBe(true);
    expect(
      toolsResponse.result?.tools.some((tool: { name: string }) => tool.name === "qirrel.capabilities"),
    ).toBe(true);
    expect(
      toolsResponse.result?.tools.some(
        (tool: { name: string; examples?: unknown[]; annotations?: object }) =>
          tool.name === "qirrel.parse_text" &&
          Array.isArray(tool.examples) &&
          typeof tool.annotations === "object",
      ),
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

  test("tool_help is callable through MCP and returns explainable metadata", async () => {
    const bridge = createQirrelAgentBridge();
    const handle = createMcpRequestHandler(bridge);

    const response = await handle({
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "qirrel.tool_help",
        arguments: {
          name: "qirrel.parse_batch",
        },
      },
    });

    expect(response.id).toBe(4);
    expect(response.result?.structuredContent).toMatchObject({
      tool: expect.objectContaining({
        name: "qirrel.parse_batch",
      }),
    });
  });

  test("capabilities is callable through MCP and returns feature profile", async () => {
    const bridge = createQirrelAgentBridge();
    const handle = createMcpRequestHandler(bridge);

    const response = await handle({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: {
        name: "qirrel.capabilities",
      },
    });

    expect(response.id).toBe(5);
    expect(response.result?.structuredContent).toMatchObject({
      name: "qirrel",
      capabilities: expect.arrayContaining(["mcp_server"]),
    });
  });
});
