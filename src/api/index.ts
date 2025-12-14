import { Pipeline } from "../core/pipeline";
import type { QirrelContext } from "../types";

export async function processText(
  text: string,
  configPath?: string
): Promise<QirrelContext> {
  const pipeline = new Pipeline(configPath);
  return pipeline.process(text);
}
