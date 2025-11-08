import type { PipelineComponent } from "../core/types";
import { IntentResult } from "../types";

export const clean: PipelineComponent = (input: IntentResult): IntentResult => {
  // Filter out punctuation and whitespace tokens
  input.tokens = input.tokens.filter((token) => 
    token.type !== "punct" && token.type !== "whitespace"
  );
  
  // Clean up entities if needed
  input.entities = input.entities.filter(entity => 
    entity.value.trim().length > 0
  );
  
  return input;
};
