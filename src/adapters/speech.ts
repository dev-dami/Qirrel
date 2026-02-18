function removePunctuation(word: string): string {
  let result = '';
  for (let i = 0; i < word.length; i++) {
    const char = word[i]!;
    if (char !== '.' && char !== ',' && char !== '!' && char !== '?' && char !== ';' && char !== ':') {
      result += char;
    }
  }
  return result;
}

function splitByWhitespace(text: string): string[] {
  const words: string[] = [];
  let currentWord = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i]!;

    // Check if character is whitespace (space, tab, newline, carriage return)
    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      if (currentWord.length > 0) {
        words.push(currentWord);
        currentWord = '';
      }
    } else {
      currentWord += char;
    }
  }

  // Don't forget the last word if text doesn't end with whitespace
  if (currentWord.length > 0) {
    words.push(currentWord);
  }

  return words;
}

export interface SpeechPatternOptions {
  removeFillerWords?: boolean;
  detectRepetitions?: boolean;
  findStutters?: boolean;
}

export function preprocessSpeechInput(
  text: string,
  options?: SpeechPatternOptions
): string {
  const opts = {
    removeFillerWords: options?.removeFillerWords ?? true,
    detectRepetitions: options?.detectRepetitions ?? false,
    findStutters: options?.findStutters ?? false,
  };

  // Split text to words using our function without regex
  const words = splitByWhitespace(text);
  const singleWordFillers = new Set(['um', 'umm', 'uh', 'uhh', 'like', 'so', 'well', 'actually', 'basically', 'literally']);
  const processedWords: string[] = [];

  // Variables for tracking patterns during single pass
  let prevCleanWord: string | null = null;

  for (let i = 0; i < words.length; i++) {
    const word = words[i]!;
    if (!word) continue;

    const cleanWord = removePunctuation(word).toLowerCase();
    const nextWord = words[i + 1];
    const nextCleanWord = nextWord ? removePunctuation(nextWord).toLowerCase() : null;

    // Check for single-word and multi-word filler phrases.
    if (opts.removeFillerWords) {
      if (singleWordFillers.has(cleanWord)) {
        continue;
      }
      if (cleanWord === 'you' && nextCleanWord === 'know') {
        i += 1;
        continue;
      }
    }

    let shouldIncludeWord = true;

    // Check for repetitions
    if (opts.detectRepetitions && prevCleanWord === cleanWord) {
      shouldIncludeWord = false;  // Skip the current word if it's a repetition
    }

    // Check for stutters (for inclusion, we'll handle separately)
    let finalWord = word;
    if (opts.findStutters) {
      const parts = cleanWord.split('-');
      if (parts.length > 1 && parts[0] && parts[1] && (parts[1].startsWith(parts[0]) || parts[0].startsWith(parts[1]))) {
        // Replace stuttered word with the complete part
        finalWord = word.replace(cleanWord, parts[1]);
      }
    }

    if (shouldIncludeWord) {
      processedWords.push(finalWord);
    }

    // Update previous word for repetition detection
    prevCleanWord = cleanWord;
  }

  return processedWords.join(' ');
}

export function analyzeSpeechPatterns(text: string): {
  fillerWords: string[];
  repetitions: string[];
  stutters: string[];
} {
  const words = splitByWhitespace(text);
  const singleWordFillers = new Set(['um', 'umm', 'uh', 'uhh', 'like', 'so', 'well', 'actually', 'basically', 'literally']);
  const detectedFillers: string[] = [];
  const detectedRepetitions: string[] = [];
  const detectedStutters: string[] = [];

  let prevCleanWord: string | null = null;

  // Single pass to detect all patterns
  for (let i = 0; i < words.length; i++) {
    const word = words[i]!;
    if (!word) continue;

    const cleanWord = removePunctuation(word).toLowerCase();
    const nextWord = words[i + 1];
    const nextCleanWord = nextWord ? removePunctuation(nextWord).toLowerCase() : null;

    // Find filler words
    if (singleWordFillers.has(cleanWord)) {
      detectedFillers.push(word);
    }
    if (cleanWord === 'you' && nextCleanWord === 'know') {
      detectedFillers.push('you know');
      i += 1;
      prevCleanWord = 'know';
      continue;
    }

    // Find repetitions
    if (prevCleanWord === cleanWord) {
      detectedRepetitions.push(word);
    }

    // Find stutters
    const parts = cleanWord.split('-');
    if (parts.length > 1 && parts[0] && parts[1] && (parts[1].startsWith(parts[0]) || parts[0].startsWith(parts[1]))) {
      detectedStutters.push(word);
    }

    // Update for next iteration
    prevCleanWord = cleanWord;
  }

  return {
    fillerWords: detectedFillers,
    repetitions: Array.from(new Set(detectedRepetitions)), // Remove duplicates
    stutters: detectedStutters
  };
}
