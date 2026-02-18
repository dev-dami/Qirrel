# API Reference

[Docs Home](./README.md) | [Configuration](./configuration.md) | [Examples](./examples.md) | [Basic](./usage/basic.md) | [Caching](./usage/caching.md) | [Events](./events.md) | [LLM](./integrations/llm.md) | [Architecture](./walkthrough.md) | [Agent-Native](./agent-native.md)

## Top-Level Functions

### `processText(text, configPath?)`
Processes one input string and returns `Promise<QirrelContext>`.

### `processTexts(texts, configPath?, options?)`
Processes multiple input strings and returns `Promise<QirrelContext[]>` in the same order.

- `options.concurrency?: number` controls parallel processing.

## `Pipeline`

### Constructor

```ts
new Pipeline(configPath?: string)
```

### Core methods

- `process(text: string): Promise<QirrelContext>`
- `processBatch(texts: string[], options?: { concurrency?: number }): Promise<QirrelContext[]>`
- `init(): Promise<void>` (waits for async LLM adapter initialization)

### Composition and extension

- `use(component: PipelineComponent): this`
- `addCustomProcessor(component: PipelineComponent): this`
- `addLLMProcessor(component: PipelineComponent): this`

### Events

- `on(event: PipelineEvent, handler: EventHandler): this`
- `off(event: PipelineEvent, handler: EventHandler): this`

### Config and cache helpers

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

- `RunStart`
- `RunEnd`
- `ProcessorStart`
- `ProcessorEnd`
- `LLMCall`
- `Error`
