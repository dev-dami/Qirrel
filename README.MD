# Qirrel

<div align="center">

**Deterministic NLP Pipeline, Speech Preprocessor & Agent-Native Tooling for TypeScript**

[![CI](https://github.com/dev-dami/Qirrel/actions/workflows/ci.yml/badge.svg)](https://github.com/dev-dami/Qirrel/actions/workflows/ci.yml)
[![CD](https://github.com/dev-dami/Qirrel/actions/workflows/release.yml/badge.svg)](https://github.com/dev-dami/Qirrel/actions/workflows/release.yml)
[![NPM Version](https://img.shields.io/npm/v/qirrel.svg)](https://www.npmjs.com/package/qirrel)
[![License](https://img.shields.io/npm/l/qirrel.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

[GitHub](https://github.com/dev-dami/Qirrel) · [NPM](https://www.npmjs.com/package/qirrel) · [Documentation](./docs/README.md)

</div>

---

## What is Qirrel?

**Qirrel** is a high-speed, deterministic text-processing framework designed for modern AI applications, speech interfaces, and LLM agent toolchains.

Instead of routing every string manipulation through expensive, high-latency LLM calls, Qirrel provides a **hybrid local-first pipeline**:

1. **Zero-Token Local Extraction**: High-speed, deterministic entity parsing for emails, phone numbers, URLs, and numeric data with 0ms LLM latency.
2. **Speech & Audio Transcript Preprocessing**: Strip verbal filler words ("um", "uh", "you know"), stutter patterns, and duplicates from STT output before feeding downstream AI.
3. **Model Context Protocol (MCP) Server**: Native `qirrel-mcp` binary exposing parsing tools over STDIO for AI Assistants (Cursor, Claude Desktop, Gemini CLI).
4. **LLM Enrichment & Fallbacks**: Adapter layer for Gemini, OpenAI, or generic REST models when deterministic rules require semantic reasoning.

---

## Quickstart

### Installation

```bash
bun add qirrel
# or
npm install qirrel
```

### 1. Simple Entity Extraction (0ms Latency, 0 Tokens)

```ts
import { processText } from 'qirrel';

const result = await processText(
  'Reach out to Jane at jane@example.com or call +44 20 7946 0958'
);

console.log(result.data?.entities);
/*
[
  { type: 'email', value: 'jane@example.com', startIndex: 21, endIndex: 37 },
  { type: 'phone', value: '+44 20 7946 0958', startIndex: 46, endIndex: 61 }
]
*/
```

### 2. Speech & Transcript Preprocessing

```ts
import { preprocessSpeechInput } from 'qirrel';

const clean = preprocessSpeechInput(
  'Um, I think, you know, we should t-t-talk today about the project.'
);

console.log(clean);
// "I think we should talk today about the project."
```

### 3. Pipeline with Custom Config & Events

```ts
import { Pipeline, PipelineEvent } from 'qirrel';

const pipeline = new Pipeline('./qirrel.config.yaml');

pipeline.on(PipelineEvent.ProcessorEnd, ({ processorName, duration }) => {
  console.log(`[Telemetry] ${processorName} took ${duration}ms`);
});

const context = await pipeline.process('Meeting at 3PM. Details: https://meet.example.com/xyz');
console.log(context.data?.entities);
```

---

## Core Capabilities Matrix

| Feature | Function / API | Description |
| --- | --- | --- |
| **Entity Extraction** | `extract(context)` | Rule-based extraction of email, phone, URL, and numbers |
| **Speech Preprocessor** | `preprocessSpeechInput(text)` / `speechClean()` | Removes filler words, stutters, and word repetitions |
| **Sentence Segmentation** | `segment(context)` | Positional sentence boundary parsing |
| **Text Normalization** | `normalize(context)` / `clean(context)` | Strips HTML, trims whitespace, standardizes punctuation |
| **LRU Cache** | `pipeline.getCached(text)` | In-memory result caching with configurable TTL |
| **Batch Processing** | `processTexts(texts, config?, { concurrency })` | Parallel batch parsing preserving input order |
| **MCP Tool Server** | `bun run mcp:start` / `qirrel-mcp` | STDIO Model Context Protocol server for AI agent desktop integrations |
| **LLM Adapter** | `pipeline.getLLMAdapter()` | Fallback adapter layer for Gemini, OpenAI, or custom APIs |

---

## Model Context Protocol (MCP) Server for AI Agents

Qirrel includes built-in MCP server capabilities so AI agents can parse text deterministically via tool calling.

### Running the MCP Server

```bash
# Start MCP server over STDIO
bun run mcp:start
```

### Configuring with Claude Desktop or Cursor

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "qirrel": {
      "command": "bunx",
      "args": ["qirrel-mcp"]
    }
  }
}
```

Exposed MCP Tools:
- `qirrel.parse_text`: Complete pipeline parsing (tokens, entities, metadata).
- `qirrel.parse_batch`: Parallel batch text processing.
- `qirrel.speech_clean`: Voice-to-text transcript cleanup (strips filler words, stutters, repetitions).
- `qirrel.capabilities`: Feature profile and tool self-discovery.
- `qirrel.tool_help`: Interactive tool discovery for LLM planners.

### Copy-Paste System Prompt for AI Agents

Paste this prompt into your agent's system instructions (e.g. `.cursorrules`, Claude Custom Instructions, or System Prompt):

```text
You have access to Qirrel MCP tools for fast, zero-token local text processing, entity extraction, and transcript cleaning.

When processing user input, raw text, customer messages, or voice transcripts:
1. BEFORE calling an LLM for simple extraction, use `qirrel.parse_text` to extract emails, phone numbers, URLs, and numbers deterministically with 0ms latency and 0 token cost.
2. For audio/voice transcripts with spoken fillers ("um", "uh", "you know"), stutters, or duplicate words, call `qirrel.speech_clean` to sanitize the transcript before generating responses.
3. For multiple text inputs, use `qirrel.parse_batch` with optional concurrency.
4. If you need details on available tool arguments or schemas, call `qirrel.tool_help` or `qirrel.capabilities`.
```


---

## Configuration (`qirrel.config.yaml`)

```yaml
pipeline:
  enableNormalization: true
  enableCleaning: true
  enableExtraction: true
  enableSegmentation: true
  enableSpeechClean: false

tokenizer:
  lowercase: true
  mergeSymbols: false

cache:
  maxEntries: 1000
  ttl: 300000 # 5 minutes

speech:
  removeFillerWords: true
  detectRepetitions: false
  findStutters: false

extraction:
  extractEmails: true
  extractPhones: true
  extractUrls: true
  extractNumbers: true

llm:
  enabled: false
  provider: gemini
  apiKey: ${QIRREL_LLM_API_KEY}
  model: gemini-2.5-flash
  timeout: 30000
  cacheTtl: 300000
```

---

## Benchmarks & Framework Comparisons

Run built-in benchmarks comparing native local parsing vs LLM wrappers:

```bash
# Benchmark Agent Bridge
bun run bench:agent

# Framework Comparison
bun run bench:frameworks

# Generate Local Benchmark Report
bun run bench:report
```

See the full [Framework Comparison](./docs/framework-comparison.md) and [Ecosystem Comparison](./docs/ecosystem-comparison.md).

---

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
- [Agent Feature Roadmap](./docs/agent-roadmap.md)
- [Benchmarks](./docs/benchmarks.md)
- [Benchmark Report (Local Machine)](./docs/benchmark-report.md)
- [Framework Comparison](./docs/framework-comparison.md)
- [Ecosystem Comparison](./docs/ecosystem-comparison.md)


---

## Contributing & License

Contributions are welcome! Please check out [CONTRIBUTING.md](./CONTRIBUTING.md) before getting started.

Licensed under [MIT](./LICENSE).
