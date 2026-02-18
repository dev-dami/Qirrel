import type { PipelineComponent } from "../core/types";
import { QirrelContext } from "../types";

function isWhitespace(code: number): boolean {
  return code === 32 || code === 9 || code === 10 || code === 13; // space, tab, newline, carriage return
}

function isSentencePunctuation(char: string): boolean {
  return char === "." || char === "!" || char === "?";
}

function isDigitChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 48 && code <= 57;
}

function isLikelySentenceStarter(char: string | undefined): boolean {
  if (!char) {
    return false;
  }
  return /[A-Z"'([{]/.test(char);
}

export const segment: PipelineComponent = {
  name: "segment",
  version: "1.0.0",
  cacheable: true,
  run: (input: QirrelContext): Promise<QirrelContext> => {
    if (input.data) {
      const text = input.data.text;
      const sentences: string[] = [];
      const sentencePositions: Array<{ start: number; end: number }> = [];

      let sentenceStart = 0;

      for (let i = 0; i < text.length; i++) {
        const char = text[i]!;

        if (!isSentencePunctuation(char)) {
          continue;
        }

        // Do not split decimals like 3.14.
        if (
          char === "." &&
          i > 0 &&
          i + 1 < text.length &&
          isDigitChar(text[i - 1]!) &&
          isDigitChar(text[i + 1]!)
        ) {
          continue;
        }

        // Collapse punctuation runs such as "..." or "?!"
        let punctEnd = i;
        while (punctEnd + 1 < text.length && isSentencePunctuation(text[punctEnd + 1]!)) {
          punctEnd++;
        }

        let j = punctEnd + 1;
        let sawWhitespace = false;
        while (j < text.length && isWhitespace(text.charCodeAt(j))) {
          sawWhitespace = true;
          j++;
        }

        const nextChar = j < text.length ? text[j] : undefined;
        const isBoundary =
          j >= text.length || sawWhitespace || isLikelySentenceStarter(nextChar);

        if (!isBoundary) {
          i = punctEnd;
          continue;
        }

        const sentence = text.substring(sentenceStart, j).trim();
        if (sentence.length > 0) {
          sentences.push(sentence);
          sentencePositions.push({
            start: sentenceStart,
            end: j
          });
        }

        sentenceStart = j;
        i = j - 1;
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

    return Promise.resolve(input);
  }
};
