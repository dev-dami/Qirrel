import type { PipelineComponent } from "../core/types";
import { QirrelContext } from "../types";

export const normalize: PipelineComponent = (
  input: QirrelContext,
): QirrelContext => {
  if (input.data) {
    input.data.tokens.forEach((token) => {
      if (token.type === "word") {
        token.value = token.value.toLowerCase();
      } else if (token.type === "number") {
        token.value = parseFloat(token.value).toString();
      }
    });

    input.data.entities.forEach((entity) => {
      entity.value = entity.value.toLowerCase();
    });
  }

  return input;
};
