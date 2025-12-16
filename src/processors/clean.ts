import type { PipelineComponent } from "../core/types";
import { QirrelContext } from "../types";

export const clean: PipelineComponent = {
  name: "clean",
  version: "1.0.0",
  cacheable: true,
  run: (input: QirrelContext): Promise<QirrelContext> => {
    if (input.data) {
      input.data.tokens = input.data.tokens.filter(
        (token) => token.type !== "punct" && token.type !== "whitespace",
      );

      input.data.entities = input.data.entities.filter(
        (entity) => entity.value.trim().length > 0,
      );
    }

    return Promise.resolve(input);
  }
};
