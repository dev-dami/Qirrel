# Framework Comparison

[Docs Home](./README.md) | [Benchmarks](./benchmarks.md) | [Benchmark Report](./benchmark-report.md) | [Agent-Native](./agent-native.md) | [Ecosystem](./ecosystem-comparison.md)

This page compares Qirrel against framework-style tool wrappers in the specific context of local tool dispatch.

For broader package/documentation positioning, see [Ecosystem Comparison](./ecosystem-comparison.md).

## Scope

In this page:
- Qirrel `AgentBridge`
- Qirrel MCP request handler
- AI SDK `tool()` wrapper
- LangChain JS `tool()` wrapper

Out of scope:
- model quality,
- prompt engineering quality,
- external API latency.

## Local Performance Snapshot

Read current machine numbers in [Benchmark Report](./benchmark-report.md).

## Capability Comparison (Tool Runtime Focus)

| Capability | Qirrel | AI SDK tool() | LangChain JS tool() |
| --- | --- | --- | --- |
| Built-in deterministic extraction (email/phone/url/number) | Yes | No | No |
| Bundled MCP server path | Yes (`qirrel-mcp`) | No | Not bundled |
| Tool self-discovery helper | Yes (`qirrel.tool_help`) | Schema-oriented | Schema-oriented |
| API-to-tool adapter | Yes (`registerApiTool`) | Yes (tool wrappers) | Yes (tool wrappers) |
| Capability profile endpoint | Yes (`qirrel.capabilities`) | No | No |

## Choosing Between Them

Choose Qirrel when you need deterministic extraction + agent compatibility in one package.

Choose AI SDK/LangChain first when your primary need is broad LLM orchestration patterns and Qirrel-style deterministic extraction is not core.

## Sources

- AI SDK tools docs: <https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling>
- LangChain JS tools docs: <https://docs.langchain.com/oss/javascript/langchain/tools>
- MCP server tools spec: <https://modelcontextprotocol.io/specification/2025-11-05/server/tools>
