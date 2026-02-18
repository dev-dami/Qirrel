import { Pipeline } from "../core/pipeline";
import type { QirrelContext } from "../types";

export async function processText(
  text: string,
  configPath?: string
): Promise<QirrelContext> {
  const pipeline = new Pipeline(configPath);
  return pipeline.process(text);
}

export async function processTexts(
  texts: string[],
  configPath?: string,
  options?: { concurrency?: number },
): Promise<QirrelContext[]> {
  const pipeline = new Pipeline(configPath);
  return pipeline.processBatch(texts, options);
}
