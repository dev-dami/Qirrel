import type { QirrelContext } from "../types";
import type { PipelineComponent } from "../core/types";
import emojiRegex from 'emoji-regex';

function removeEmojis(text: string): string {
  const regex = emojiRegex();
  return text.replace(regex, '');
}

export const advClean: PipelineComponent = async (result: QirrelContext) => {
  if (result.data) {
    const cleanedText = removeEmojis(result.data.text);
    result.data.text = cleanedText;
  }
  return result;
};
