import type { PipelineComponent } from "../core/types";
import { preprocessSpeechInput, type SpeechPatternOptions } from "../adapters/speech";

/**
 * Pipeline component for cleaning speech-to-text transcripts.
 * Removes filler words ("um", "uh", "you know"), stutters, and repetitions.
 */
export function speechClean(options?: SpeechPatternOptions): PipelineComponent {
  return {
    name: "speechClean",
    cacheable: true,
    run: async (context) => {
      if (!context.data) return context;
      const cleanedText = preprocessSpeechInput(context.data.text, options);
      return {
        ...context,
        data: {
          ...context.data,
          text: cleanedText,
        },
      };
    },
  };
}
