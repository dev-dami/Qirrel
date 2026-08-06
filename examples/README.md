# Qirrel Pre-LLM Sanitizer & Preprocessor Examples

This directory contains real-world, production-focused examples demonstrating how **Qirrel** functions as a zero-token local pre-processor for LLM pipelines and AI Agents.

---

## Example Guide

| File | Scenario | Key Benefit |
| --- | --- | --- |
| [`1-voice-transcript-sanitizer.ts`](./1-voice-transcript-sanitizer.ts) | Preprocessing real-time Speech-To-Text (STT) audio outputs | Removes spoken fillers ("um", "uh", "you know"), stutters, and repetitions in <1ms before sending to LLM. |
| [`2-zero-cost-entity-prefilter.ts`](./2-zero-cost-entity-prefilter.ts) | High-volume support ticket & email lead pre-filtering | Extracts emails, phone numbers, URLs locally at 0ms and $0 cost to bypass LLM API calls on simple queries. |
| [`3-token-saving-prellm-pipeline.ts`](./3-token-saving-prellm-pipeline.ts) | Prompt token reduction & HTML payload cleaning | Compresses web payloads and strips junk text to cut downstream LLM input token costs by 30-50%. |
| [`4-agent-mcp-offloaded-parsing.ts`](./4-agent-mcp-offloaded-parsing.ts) | AI Agent tool offloading via Qirrel Agent Bridge | Offloads entity extraction and transcript cleaning to local deterministic tools so agents don't hallucinate. |

---

## How to Run the Examples

### Using Bun (Recommended)

```bash
bun run examples/1-voice-transcript-sanitizer.ts
bun run examples/2-zero-cost-entity-prefilter.ts
bun run examples/3-token-saving-prellm-pipeline.ts
bun run examples/4-agent-mcp-offloaded-parsing.ts
```

### Using Node & ts-node

```bash
npx ts-node examples/1-voice-transcript-sanitizer.ts
npx ts-node examples/2-zero-cost-entity-prefilter.ts
npx ts-node examples/3-token-saving-prellm-pipeline.ts
npx ts-node examples/4-agent-mcp-offloaded-parsing.ts
```
