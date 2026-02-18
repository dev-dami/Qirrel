import { advClean } from "../src/processors/advclean";
import type { QirrelContext } from "../src/types";

describe("advClean processor", () => {
  test("removes emoji from text", async () => {
    const input: QirrelContext = {
      data: {
        text: "hello 😀 world",
        tokens: [],
        entities: [],
      },
    };

    const result = await advClean.run(input);

    expect(result.data?.text).toBe("hello  world");
  });

  test("returns input unchanged when data is missing", async () => {
    const input: QirrelContext = {};

    const result = await advClean.run(input);

    expect(result).toBe(input);
  });
});
