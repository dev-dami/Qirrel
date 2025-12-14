import type { Token } from "./Tokenizer";
import type { QirrelContext } from "../index";

export type PipelineComponent = (
  input: QirrelContext,
) => QirrelContext | Promise<QirrelContext>;
