import { Tokenizer } from "./Tokenizer";
import {
  clean,
  extract,
  normalize,
  segment,
  extractEmailsOnly,
  extractPhonesOnly,
  extractUrlsOnly,
  extractNumbersOnly,
  advClean,
} from "../processors";
import { LLMAdapterFactory } from "../llms";
import type { LLMAdapter } from "../llms";
import type { Entity, QirrelContext } from "../types";
import type { PipelineComponent } from "./types";
import { ConfigLoader } from "../config/loader";
import type { MiniparseConfig } from "../config/defaults";

export class Pipeline {
  private readonly components: PipelineComponent[] = [];
  private readonly tokenizer: Tokenizer;
  private readonly config: MiniparseConfig;
  private llmAdapter?: LLMAdapter;

  constructor(configPath?: string) {
    this.config = ConfigLoader.loadConfig(configPath);

    this.tokenizer = new Tokenizer({
      lowercase: this.config.tokenizer.lowercase,
      mergeSymbols: this.config.tokenizer.mergeSymbols,
    });

    if (this.config.pipeline.enableNormalization) this.use(normalize);
    if (this.config.pipeline.enableCleaning) this.use(clean);
    if (this.config.pipeline.enableAdvCleaning) this.use(advClean);

    if (this.config.pipeline.enableExtraction) {
      if (this.config.extraction.extractEmails) this.use(extractEmailsOnly);
      if (this.config.extraction.extractPhones) this.use(extractPhonesOnly);
      if (this.config.extraction.extractUrls) this.use(extractUrlsOnly);
      if (this.config.extraction.extractNumbers) this.use(extractNumbersOnly);
    }

    if (this.config.pipeline.enableSegmentation) this.use(segment);

    // Initialize LLM adapter if LLM functionality is enabled
    if (this.config.llm?.enabled && this.config.llm.apiKey) {
      // Initialize LLM adapter asynchronously
      LLMAdapterFactory.create(
        {
          apiKey: this.config.llm.apiKey, // This is guaranteed to exist due to the condition above
          model: this.config.llm.model || "gemini-2.5-flash", // Provide default model
          baseUrl: this.config.llm.baseUrl,
          temperature: this.config.llm.temperature,
          maxTokens: this.config.llm.maxTokens,
          timeout: this.config.llm.timeout,
        },
        this.config.llm.provider,
      ).then(adapter => {
        this.llmAdapter = adapter;
      }).catch(error => {
        console.warn("Failed to initialize LLM adapter:", error);
      });
    }
  }

  public use(component: PipelineComponent): this {
    this.components.push(component);
    return this;
  }

  public async process(text: string): Promise<QirrelContext> {
    // Create initial context with empty data
    const initialContext: QirrelContext = {
      meta: {
        requestId: 'req_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        timestamp: Date.now(),
        source: 'cli'
      },
      memory: {
        cache: {}
      },
      llm: {
        model: this.config.llm?.model || 'gemini-2.5-flash',
        safety: {
          allowTools: true
        }
      }
    };

    // Tokenize and add to context
    const tokens = this.tokenizer.tokenize(text);
    const contextWithText: QirrelContext = {
      ...initialContext,
      data: {
        text,
        tokens,
        entities: []
      }
    };

    let resultContext: QirrelContext = contextWithText;

    for (const component of this.components) {
      resultContext = await component(resultContext);
    }

    return resultContext;
  }

  public getConfig(): MiniparseConfig {
    return this.config;
  }

  public addCustomProcessor(component: PipelineComponent): this {
    this.components.push(component);
    return this;
  }

  public getLLMAdapter(): LLMAdapter | undefined {
    return this.llmAdapter;
  }

  public addLLMProcessor(processor: PipelineComponent): this {
    this.components.push(processor);
    return this;
  }
}
