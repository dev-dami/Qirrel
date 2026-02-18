# API Reference

[Docs Home](./README.md) | [Configuration](./configuration.md) | [Examples](./examples.md) | [Basic](./usage/basic.md) | [Caching](./usage/caching.md) | [Events](./events.md) | [LLM](./integrations/llm.md) | [Architecture](./walkthrough.md) | [Agent-Native](./agent-native.md) | [Benchmarks](./benchmarks.md) | [Ecosystem](./ecosystem-comparison.md)

This page documents the public runtime API and the behavior that matters in production.

## Top-Level Functions

### `processText(text, configPath?)`

```ts
function processText(text: string, configPath?: string): Promise<QirrelContext>
```

- Creates a fresh `Pipeline` per call.
- Loads config using `ConfigLoader` precedence (see [Configuration](./configuration.md)).
- Returns one `QirrelContext`.

Use this for one-off parsing. For repeated calls, reuse `Pipeline` to retain cache and event handlers.

### `processTexts(texts, configPath?, options?)`

```ts
function processTexts(
  texts: string[],
  configPath?: string,
  options?: { concurrency?: number },
): Promise<QirrelContext[]>
```

- Creates a fresh `Pipeline` per call.
- Preserves input order in output.
- Uses bounded worker concurrency.

## `Pipeline`

### Constructor

```ts
new Pipeline(configPath?: string)
```

Construction does the following:
- loads config,
- builds tokenizer,
- assembles built-in processors based on config flags,
- initializes caches,
- starts async LLM adapter initialization when enabled.

### Lifecycle Methods

- `init(): Promise<void>`
  - waits for async adapter initialization.
- `process(text: string): Promise<QirrelContext>`
  - processes one input,
  - emits events (`RunStart`, processor events, `RunEnd`, `Error`),
  - caches result when caching is enabled.
- `processBatch(texts: string[], options?: { concurrency?: number }): Promise<QirrelContext[]>`
  - validates inputs,
  - parallelizes work up to `concurrency`,
  - throws on invalid input types or invalid concurrency.

### Composition and Extension

- `use(component: PipelineComponent): this`
- `addCustomProcessor(component: PipelineComponent): this`
- `addLLMProcessor(component: PipelineComponent): this`

### Events

- `on(event: PipelineEvent, handler: EventHandler): this`
- `off(event: PipelineEvent, handler: EventHandler): this`

See [Events](./events.md) for payload contracts and error behavior.

### Cache and Config Access

- `getConfig(): MiniparseConfig`
- `getLLMAdapter(): LLMAdapter | undefined`
- `getCacheManager(): LruCacheManager`
- `isCached(text: string): boolean`
- `getCached(text: string): QirrelContext | undefined`
- `setCached(text: string, result: QirrelContext, ttl?: number): void`

## `PipelineComponent`

```ts
interface PipelineComponent {
  name: string;
  version?: string;
  cacheable?: boolean;
  run(input: QirrelContext): Promise<QirrelContext>;
}
```

Notes:
- Components are expected to mutate and return `QirrelContext`.
- If `cacheable: true`, Qirrel may wrap the component with cache logic when cache is enabled.

## Core Types

### `QirrelContext`

```ts
interface QirrelContext {
  meta?: {
    requestId?: string;
    timestamp?: number;
    source?: 'http' | 'cli' | 'worker';
    trace?: Record<string, string>;
  };
  memory?: {
    shortTerm?: unknown;
    longTerm?: unknown;
    cache?: Record<string, unknown>;
  };
  llm?: {
    model?: string;
    temperature?: number;
    safety?: {
      allowTools: boolean;
      redactions?: string[];
    };
  };
  data?: {
    text: string;
    tokens: Token[];
    entities: Entity[];
    llmResponse?: LLMResponse;
  };
}
```

### `Entity`

```ts
interface Entity {
  type: string;
  value: string;
  start: number;
  end: number;
}
```

### `PipelineEvent`

- `RunStart` (`run.start`)
- `RunEnd` (`run.end`)
- `ProcessorStart` (`processor.start`)
- `ProcessorEnd` (`processor.end`)
- `LLMCall` (`llm.call`, reserved)
- `Error` (`error`)

## Agent-Native Exports (High-Level)

Qirrel also exports agent-native APIs:
- `AgentBridge`
- `createQirrelAgentBridge`
- `createMcpRequestHandler`
- `startMcpStdioServer`

For full behavior and protocol notes, see [Agent-Native Integration](./agent-native.md).

## Common Pitfalls

- `processText` and `processTexts` do not share cache between calls because they instantiate a new `Pipeline` each time.
- `PipelineEvent.LLMCall` exists in enum but is currently reserved and not emitted by the default pipeline path.
- Cached contexts are cloned on read/write; do not rely on object identity across calls.
