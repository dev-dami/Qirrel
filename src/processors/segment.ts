import type { PipelineComponent } from "../core/types";
import { QirrelContext } from "../types";

function isWhitespace(code: number): boolean {
  return code === 32 || code === 9 || code === 10 || code === 13; // space, tab, newline, carriage return
}

export const segment: PipelineComponent = (
  input: QirrelContext,
): QirrelContext => {
  if (input.data) {
    const text = input.data.text;
    const sentences: string[] = [];
    const sentencePositions: Array<{ start: number; end: number }> = [];

    let sentenceStart = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      // Check if this character is a sentence-ending punctuation
      if (char === '.' || char === '!' || char === '?') {
        // Look ahead to see if followed by whitespace
        let j = i + 1;
        while (j < text.length && isWhitespace(text.charCodeAt(j))) {
          j++;
        }

        // If there's whitespace after punctuation, consider it a sentence boundary
        if (j < text.length || i === text.length - 1) {
          const sentence = text.substring(sentenceStart, j).trim();
          if (sentence.length > 0) {
            sentences.push(sentence);
            sentencePositions.push({
              start: sentenceStart,
              end: j
            });
          }
          sentenceStart = j;
          i = j - 1; // Continue from after the whitespace
        }
      }
    }

    // Handle the last part if it doesn't end with punctuation
    if (sentenceStart < text.length) {
      const remaining = text.substring(sentenceStart).trim();
      if (remaining.length > 0) {
        sentences.push(remaining);
        sentencePositions.push({
          start: sentenceStart,
          end: text.length
        });
      }
    }

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]!;
      const pos = sentencePositions[i]!;

      input.data.entities.push({
        type: "sentence",
        value: sentence.trim(),
        start: pos.start,
        end: pos.end,
      });
    }
  }

  return input;
};
