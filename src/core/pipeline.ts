import type { Token } from "./Tokenizer";
import { Tokenizer } from "./Tokenizer";
import { clean, extract, normalize, segment } from "../processors";
import type { Entity, IntentResult } from "../types";
import type { PipelineComponent } from "./types";

export class Pipeline {
  private readonly components: PipelineComponent[] = [];
  private readonly tokenizer: Tokenizer;

  constructor() {
    this.tokenizer = new Tokenizer();
    // Add default processors
    this.use(normalize);
    this.use(clean);
    this.use(extract);
    this.use(segment);
  }

  public use(component: PipelineComponent): this {
    this.components.push(component);
    return this;
  }

  public async process(text: string): Promise<IntentResult> {
    const tokens = this.tokenizer.tokenize(text);
    let result: IntentResult = {
      text,
      tokens,
      entities: [],
    };

    for (const component of this.components) {
      result = await component(result);
    }

    return result;
  }
}
