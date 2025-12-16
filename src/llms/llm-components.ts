import type { PipelineComponent } from "../core/types";
import type { QirrelContext } from "../types";
import type { LLMAdapter, LLMConfig } from "./types";

/**
 * Creates an LLM-based text summarizer component
 */
export const createLLMSummarizer = (
  adapter: LLMAdapter,
  config?: Partial<LLMConfig>,
  maxSummaryLength: number = 100,
): PipelineComponent => {
  return {
    name: "llm-summarizer",
    version: "1.0.0",
    cacheable: true,
    run: async (input: QirrelContext): Promise<QirrelContext> => {
      try {
        if (!input.data) {
          return input;
        }

        const prompt = `Summarize the following text in ${maxSummaryLength} words or fewer: "${input.data.text}"`;

        const response = await adapter.generate(prompt, config);

        input.data.entities.push({
          type: "summary",
          value: response.content,
          start: 0,
          end: response.content.length,
        });

        return input;
      } catch (error) {
        console.warn("LLM summarization failed:", error);
        return input;
      }
    }
  };
};

export const createLLMSentimentAnalyzer = (
  adapter: LLMAdapter,
  config?: Partial<LLMConfig>,
): PipelineComponent => {
  return {
    name: "llm-sentiment-analyzer",
    version: "1.0.0",
    cacheable: true,
    run: async (input: QirrelContext): Promise<QirrelContext> => {
      try {
        if (!input.data) {
          return input;
        }

        const prompt = `Analyze the sentiment of the following text. Respond with only one of these values: positive, negative, or neutral.\n\nText: "${input.data.text}"`;

        const response = await adapter.generate(prompt, config);
        const sentiment = response.content.trim().toLowerCase();
        if (["positive", "negative", "neutral"].includes(sentiment)) {
          input.data.entities.push({
            type: "sentiment",
            value: sentiment,
            start: 0,
            end: input.data.text.length,
          });
        }

        return input;
      } catch (error) {
        console.warn("LLM sentiment analysis failed:", error);
        return input;
      }
    }
  };
};

export const createLLMIntentClassifier = (
  adapter: LLMAdapter,
  possibleIntents: string[],
  config?: Partial<LLMConfig>,
): PipelineComponent => {
  return {
    name: "llm-intent-classifier",
    version: "1.0.0",
    cacheable: true,
    run: async (input: QirrelContext): Promise<QirrelContext> => {
      try {
        if (!input.data) {
          return input;
        }

        const prompt = `Classify the intent of the following text. Respond with only one of these intents: ${possibleIntents.join(", ")}.\n\nText: "${input.data.text}"`;

        const response = await adapter.generate(prompt, config);
        const intent = response.content.trim();

        if (
          possibleIntents.some(
            (possibleIntent) =>
              possibleIntent.toLowerCase().includes(intent.toLowerCase()) ||
              intent.toLowerCase().includes(possibleIntent.toLowerCase()),
          )
        ) {
          input.data.entities.push({
            type: "intent",
            value: intent,
            start: 0,
            end: input.data.text.length,
          });
        }

        return input;
      } catch (error) {
        console.warn("LLM intent classification failed:", error);
        return input;
      }
    }
  };
};

export const createLLMTopicClassifier = (
  adapter: LLMAdapter,
  config?: Partial<LLMConfig>,
): PipelineComponent => {
  return {
    name: "llm-topic-classifier",
    version: "1.0.0",
    cacheable: true,
    run: async (input: QirrelContext): Promise<QirrelContext> => {
      try {
        if (!input.data) {
          return input;
        }

        const prompt = `Identify the main topic(s) of the following text. Respond with a comma-separated list of topics.\n\nText: "${input.data.text}"`;

        const response = await adapter.generate(prompt, config);
        const topics = response.content.split(",").map((topic) => topic.trim());

        for (const topic of topics) {
          if (topic) {
            input.data.entities.push({
              type: "topic",
              value: topic,
              start: 0,
              end: input.data.text.length,
            });
          }
        }

        return input;
      } catch (error) {
        console.warn("LLM topic classification failed:", error);
        return input;
      }
    }
  };
};

export const createLLMTextEnhancer = (
  adapter: LLMAdapter,
  config?: Partial<LLMConfig>,
): PipelineComponent => {
  return {
    name: "llm-text-enhancer",
    version: "1.0.0",
    cacheable: true,
    run: async (input: QirrelContext): Promise<QirrelContext> => {
      try {
        if (!input.data) {
          return input;
        }

        const prompt = `Improve and enhance the following text while preserving its meaning: "${input.data.text}"`;

        const response = await adapter.generate(prompt, config);

        input.data.text = response.content;

        return input;
      } catch (error) {
        console.warn("LLM text enhancement failed:", error);
        return input;
      }
    }
  };
};
