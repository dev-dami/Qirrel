import type { Token } from "./Tokenizer";
import type { QirrelContext } from "../index";
export type { PipelineEvent, EventHandler } from "./Events";

export interface PipelineComponent {
  name: string;
  version?: string;
  cacheable?: boolean;
  run(ctx: QirrelContext): Promise<QirrelContext>;
}
