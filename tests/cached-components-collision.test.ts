import type { PipelineComponent } from "../src/core/types";
import { createQirrelContext, type QirrelContext } from "../src/types";
import { createCachedComponent } from "../src/utils/cache/cached-components";

function contextFromText(text: string): QirrelContext {
  return createQirrelContext({
    text,
    tokens: [],
    entities: [],
  });
}

describe("createCachedComponent collision safety", () => {
  test("should not return cached output for different inputs with colliding legacy hashes", async () => {
    const baseComponent: PipelineComponent = {
      name: "cached-echo",
      cacheable: true,
      async run(ctx) {
        const text = ctx.data?.text ?? "";
        return {
          ...ctx,
          data: {
            ...(ctx.data ?? { text: "", tokens: [], entities: [] }),
            text: `processed:${text}`,
          },
        };
      },
    };

    const cachedComponent = createCachedComponent(baseComponent);

    // These two values collide with the previous 32-bit rolling hash strategy.
    const firstInput = "MjS16Lc";
    const secondInput = "ZuCY65R";

    const first = await cachedComponent.run(contextFromText(firstInput));
    const second = await cachedComponent.run(contextFromText(secondInput));

    expect(first.data?.text).toBe(`processed:${firstInput}`);
    expect(second.data?.text).toBe(`processed:${secondInput}`);
  });
});
