import type { PipelineComponent } from "../core/types";
import { QirrelContext } from "../types";

export const clean: PipelineComponent = (input: QirrelContext): QirrelContext => {
  if (input.data) {
    input.data.tokens = input.data.tokens.filter(
      (token) => token.type !== "punct" && token.type !== "whitespace",
    );

    input.data.entities = input.data.entities.filter(
      (entity) => entity.value.trim().length > 0,
    );
  }

  return input;
};
