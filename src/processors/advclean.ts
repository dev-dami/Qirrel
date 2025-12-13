import type { IntentResult } from "../types";
import type { PipelineComponent } from "../core/types";
import emojiRegex from 'emoji-regex';

function removeEmojis(text: string): string {
  const regex = emojiRegex();
  return text.replace(regex, '');
}

export const advClean: PipelineComponent = async (result: IntentResult) => {
  const cleanedText = removeEmojis(result.text);
  return {
    ...result,
    text: cleanedText,
  };
};
