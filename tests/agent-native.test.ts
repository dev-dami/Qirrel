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

    const parsed = await bridge.callTool("qirrel.parse_text", {
      text: "Email hello@example.com",
    });

    expect(parsed.structuredContent).toHaveProperty("data");
    expect(parsed.structuredContent).toHaveProperty("meta");
  });
});
