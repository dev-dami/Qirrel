import { createQirrelAgentBridge, AgentBridge } from "../src/agent";

describe("agent native bridge", () => {
  test("registerApiTool wraps regular handlers into agent-native output", async () => {
    const bridge = new AgentBridge();

    bridge.registerApiTool(
      {
        name: "math.add",
        description: "Adds two numbers",
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number" },
            b: { type: "number" },
          },
          required: ["a", "b"],
        },
      },
      ({ a, b }: { a: number; b: number }) => ({ sum: a + b }),
    );

    const result = await bridge.callTool("math.add", { a: 2, b: 5 });

    expect(result.structuredContent).toEqual({ sum: 7 });
    expect(result.content[0]?.type).toBe("text");
    expect(result.content[0]?.text).toContain("\"sum\": 7");
  });

  test("createQirrelAgentBridge exposes parse tools", async () => {
    const bridge = createQirrelAgentBridge();
    const tools = bridge.listTools();

    expect(tools.some((tool) => tool.name === "qirrel.parse_text")).toBe(true);
    expect(tools.some((tool) => tool.name === "qirrel.parse_batch")).toBe(true);
    expect(tools.some((tool) => tool.name === "qirrel.tool_help")).toBe(true);
    expect(tools.some((tool) => tool.name === "qirrel.capabilities")).toBe(true);

    const parsed = await bridge.callTool("qirrel.parse_text", {
      text: "Email hello@example.com",
    });

    expect(parsed.structuredContent).toHaveProperty("data");
    expect(parsed.structuredContent).toHaveProperty("meta");
  });

  test("tool_help explains tool usage for model-driven discovery", async () => {
    const bridge = createQirrelAgentBridge();

    const help = await bridge.callTool("qirrel.tool_help", {
      name: "qirrel.parse_text",
    });

    expect(help.structuredContent).toMatchObject({
      tool: expect.objectContaining({
        name: "qirrel.parse_text",
        description: expect.any(String),
        inputSchema: expect.any(Object),
      }),
    });

    expect(help.content[0]?.text).toContain("qirrel.parse_text");
    expect(help.content[0]?.text).toContain("Usage");

    const catalog = await bridge.callTool("qirrel.tool_help", {});
    const tools = (catalog.structuredContent as { tools?: Array<{ name: string }> }).tools ?? [];
    expect(tools.some((tool) => tool.name === "qirrel.capabilities")).toBe(true);
  });

  test("capabilities tool returns feature profile for agents", async () => {
    const bridge = createQirrelAgentBridge();

    const result = await bridge.callTool("qirrel.capabilities", {});

    expect(result.structuredContent).toMatchObject({
      name: "qirrel",
      capabilities: expect.arrayContaining([
        "entity_extraction",
        "phone_detection",
        "mcp_server",
      ]),
    });
  });
});
