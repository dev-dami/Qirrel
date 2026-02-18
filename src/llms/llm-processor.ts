import type { PipelineComponent } from "../core/types";
import type { QirrelContext } from "../types";
import type { LLMProcessorOptions, LLMAdapter } from "./types";

function ensureEntityArray(data: NonNullable<QirrelContext["data"]>): void {
  if (!Array.isArray(data.entities)) {
    (data as { entities?: unknown }).entities = [];
  }
}

function isValidRange(start: number, end: number, maxLength: number): boolean {
  return Number.isFinite(start) && Number.isFinite(end) && start >= 0 && end >= start && end <= maxLength;
}

export const createLLMProcessor = (
  options: LLMProcessorOptions,
): PipelineComponent => {
  return {
    name: "llm-processor",
    version: "1.0.0",
    cacheable: true,
    run: async (input: QirrelContext): Promise<QirrelContext> => {
      try {
        // Use the adapter to process the full context
        const result = await options.adapter.generateWithContext(
          input,
          options.promptTemplate,
          options.config,
        );

        if (!result || typeof result !== "object") {
          return input;
        }

        // Return the result as is (should be QirrelContext)
        return result;
      } catch (error) {
        console.warn("LLM processor failed:", error);
        return input;
      }
    }
  };
};

export const createLLMEntityExtractor = (
  promptTemplate: string,
  adapter: LLMAdapter,
  config?: Partial<LLMProcessorOptions["config"]>,
): PipelineComponent => {
  return {
    name: "llm-entity-extractor",
    version: "1.0.0",
    cacheable: true,
    run: async (input: QirrelContext): Promise<QirrelContext> => {
      try {
        if (!input.data) {
          return input;
        }
        ensureEntityArray(input.data);

        const enhancedPrompt = `${promptTemplate}\n\nText: ${JSON.stringify(input.data.text)}\n\nPlease extract entities in JSON format with structure: {entities: [{type: string, value: string, start: number, end: number}]}`;

        const response = await adapter.generate(enhancedPrompt, config);

        // Attempt to parse the response for entities
        try {
          const jsonResponse = response.content.trim();
          let jsonString = jsonResponse;

          if (jsonResponse.startsWith("```")) {
            const lines = jsonResponse.split("\n");
            let startLine = 0;
            let endLine = lines.length - 1;

            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              if (line && line.trim().startsWith("```")) {
                startLine = i + 1;
                const trimmedLine = line.trim();
                if (trimmedLine !== "```" && trimmedLine.startsWith("```json")) {
                  startLine = i + 1;
                }
                break;
              }
            }

            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i];
              if (line && line.trim() === "```") {
                endLine = i - 1;
                break;
              }
            }

            if (startLine <= endLine && startLine < lines.length) {
              jsonString = lines
                .slice(startLine, endLine + 1)
                .join("\n")
                .trim();
            }
          }

          const parsed = JSON.parse(jsonString);

          if (parsed.entities && Array.isArray(parsed.entities)) {
            const textLength = input.data.text.length;
            for (const entity of parsed.entities) {
              if (
                entity &&
                typeof entity.type === "string" &&
                typeof entity.value === "string" &&
                typeof entity.start === "number" &&
                typeof entity.end === "number" &&
                isValidRange(entity.start, entity.end, textLength)
              ) {
                input.data.entities.push({
                  type: entity.type,
                  value: entity.value,
                  start: entity.start,
                  end: entity.end,
                });
              }
            }
          }
        } catch (parseError) {
          console.warn(
            "Failed to parse LLM entity extraction response:",
            parseError,
          );
        }

        return input;
      } catch (error) {
        console.warn("LLM entity extraction failed:", error);
        return input;
      }
    }
  };
};
