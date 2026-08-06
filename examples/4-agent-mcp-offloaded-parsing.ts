/**
 * Example 4: Agent Tool Offloading via Qirrel Agent Bridge / MCP
 *
 * Scenario: Building an AI Agent (LangChain / Vercel AI SDK / Custom).
 * Asking the LLM agent to manually write regex or extract contact info from raw text
 * wastes expensive generation output tokens and is prone to hallucination.
 *
 * Instead, register Qirrel as an Agent Tool (or run via MCP). The agent calls
 * `qirrel.parse_text` or `qirrel.speech_clean` as a local tool call.
 */

import { createQirrelAgentBridge } from '../src';

async function main() {
  // Initialize Qirrel Agent Bridge (exposes Qirrel as standardized agent tools)
  const bridge = createQirrelAgentBridge();

  console.log("=== EXPOSED QIRREL AGENT TOOLS ===");
  const tools = bridge.listTools();
  tools.forEach(t => console.log(` - Tool: ${t.name} -> ${t.description}`));
  console.log("\n----------------------------------------\n");

  // Simulate an Agent invoking `qirrel.parse_text` tool
  console.log("Simulating Agent invocation: qirrel.parse_text...");
  const parseResult = await bridge.callTool("qirrel.parse_text", {
    text: "Urgent: contact CEO at dev-lead@acme.org or call +1 202 555 0188. Details: https://acme.org/alert"
  });

  console.log("\n=== AGENT TOOL RESPONSE (STRUCTURED JSON) ===");
  console.log(JSON.stringify(parseResult.structuredContent, null, 2));

  // Simulate an Agent invoking `qirrel.speech_clean` tool
  console.log("\nSimulating Agent invocation: qirrel.speech_clean...");
  const speechResult = await bridge.callTool("qirrel.speech_clean", {
    text: "Um, I mean, uh, please cancel order 4022, you know."
  });

  console.log("\n=== AGENT TOOL SPEECH CLEAN RESPONSE ===");
  console.log(JSON.stringify(speechResult.structuredContent, null, 2));
}

main().catch(console.error);
