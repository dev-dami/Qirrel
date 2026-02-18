# Qirrel

<div align="center">

**TypeScript NLP pipeline for fast, structured text understanding**

[![CI](https://github.com/dev-dami/Qirrel/actions/workflows/ci.yml/badge.svg)](https://github.com/dev-dami/Qirrel/actions/workflows/ci.yml)
[![CD](https://github.com/dev-dami/Qirrel/actions/workflows/release.yml/badge.svg)](https://github.com/dev-dami/Qirrel/actions/workflows/release.yml)
[![NPM Version](https://img.shields.io/npm/v/qirrel.svg)](https://www.npmjs.com/package/qirrel)
[![NPM Downloads](https://img.shields.io/npm/dm/qirrel.svg)](https://www.npmjs.com/package/qirrel)
[![License](https://img.shields.io/npm/l/qirrel.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

[GitHub](https://github.com/dev-dami/Qirrel) · [NPM](https://www.npmjs.com/package/qirrel) · Author: [Damilare Osibanjo](https://github.com/dev-dami)

</div>

## Why Qirrel

Qirrel gives you a production-ready pipeline for extracting structure from raw text:

- Tokenization with positional metadata.
- Rule-based extraction for email, phone, URL, and number entities.
- Optional LLM enrichment via adapter pattern.
- Built-in caching and lifecycle events.
- Batch processing with controllable concurrency.

## Install

```bash
bun add qirrel
```

## 30-Second Start

```ts
import { processText } from 'qirrel';

const result = await processText(
  'Contact Jane at jane@example.com or +44 20 7946 0958',
);

console.log(result.data?.entities);
```

## Core Features

| Feature | API | Notes |
| --- | --- | --- |
| Single-text processing | `processText(text)` | Returns `QirrelContext` |
| Batch processing | `processTexts(texts, configPath?, { concurrency })` | Keeps input order |
| Custom pipeline | `new Pipeline(configPath?)` | Add processors and hooks |
| Events | `pipeline.on(PipelineEvent.*, handler)` | Run/processor/error telemetry |
| Caching | `pipeline.isCached/getCached/setCached` | LRU + TTL |
| LLM adapter | `pipeline.getLLMAdapter()` | `gemini`, `openai`, `generic` |

## Batch Example

```ts
import { processTexts } from 'qirrel';

const inputs = [
  'US: +1 415 555 2671',
  'URL: https://example.com',
  'Email: team@example.com',
];

const outputs = await processTexts(inputs, undefined, { concurrency: 2 });
console.log(outputs.map((o) => o.data?.entities));
```

## LLM Example

```ts
import { Pipeline } from 'qirrel';

const pipeline = new Pipeline('./config-with-llm.yaml');
await pipeline.init();

const adapter = pipeline.getLLMAdapter();
if (adapter) {
  const response = await adapter.generate('Summarize: Qirrel is an NLP pipeline.');
  console.log(response.content);
}
```

## Minimal LLM Config

```yaml
llm:
  enabled: true
  provider: openai
  apiKey: ${QIRREL_LLM_API_KEY}
  model: gpt-4o-mini
  timeout: 30000
  cacheTtl: 300000
```

## Quality Gates (CI/CD)

This repository includes GitHub Actions workflows:

- `ci.yml`: runs install, build, tests, and coverage on push/PR.
- `release.yml`: runs release checks and can publish to npm on version tags (`v*`) when `NPM_TOKEN` is configured.

## Agent-Native Mode

Qirrel ships with an agent-native bridge plus an MCP server so the same parsing core works for API code and agent toolchains.

```ts
import { createQirrelAgentBridge } from "qirrel";

const bridge = createQirrelAgentBridge();
const result = await bridge.callTool("qirrel.parse_text", { text: "Email me@example.com" });
console.log(result.structuredContent);
```

Run MCP server:

```bash
bun run mcp:start
```

Run benchmark:

```bash
bun run bench:agent
```

Framework comparison benchmark:

```bash
bun run bench:frameworks
```

Generate local markdown benchmark report:

```bash
bun run bench:report
```

## Documentation

- [Docs Home](./docs/README.md)
- [API Reference](./docs/api.md)
- [Configuration Guide](./docs/configuration.md)
- [Usage Examples](./docs/examples.md)
- [Basic Usage](./docs/usage/basic.md)
- [Caching](./docs/usage/caching.md)
- [Pipeline Events](./docs/events.md)
- [LLM Integration](./docs/integrations/llm.md)
- [Architecture Walkthrough](./docs/walkthrough.md)
- [Agent-Native Integration](./docs/agent-native.md)
- [Benchmarks](./docs/benchmarks.md)
- [Benchmark Report (Local Machine)](./docs/benchmark-report.md)
- [Framework Comparison](./docs/framework-comparison.md)
- [Ecosystem Comparison](./docs/ecosystem-comparison.md)
- [Agent Feature Roadmap](./docs/agent-roadmap.md)

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT. See [LICENSE](./LICENSE).
