export type TokenType =
  | "word"
  | "number"
  | "punct"
  | "symbol"
  | "whitespace"
  | "unknown";

export interface Token {
  value: string;
  type: TokenType;
  start: number;
  end: number;
}

export interface TokenizerOptions {
  lowercase?: boolean;
  mergeSymbols?: boolean;
}

export class Tokenizer {
  private options: Required<TokenizerOptions>;

  constructor(options?: TokenizerOptions) {
    this.options = {
      lowercase: options?.lowercase ?? true,
      mergeSymbols: options?.mergeSymbols ?? false,
    };
  }

  tokenize(text: string): Token[] {
    const tokens: Token[] = [];
    const len = text.length;
    let start = 0;
    let current = "";
    let currentType: TokenType = "unknown";

    for (let i = 0; i < len; i++) {
      const ch = text[i]!;
      const code = ch.codePointAt(0)!;
      const type = this.classifyOptimized(code, ch);

      if (type !== currentType || this.isBoundaryOptimized(type, currentType)) {
        if (current.length > 0) {
          tokens.push({
            value:
              this.options.lowercase && currentType === "word"
                ? current.toLowerCase()
                : current,
            type: currentType,
            start,
            end: i,
          });
        }
        current = ch;
        currentType = type;
        start = i;
      } else {
        current += ch;
      }
    }

    if (current.length > 0) {
      tokens.push({
        value:
          this.options.lowercase && currentType === "word"
            ? current.toLowerCase()
            : current,
        type: currentType,
        start,
        end: len,
      });
    }

    return tokens;
  }

  private classifyOptimized(code: number, ch: string): TokenType {
    if (
      (code >= 65 && code <= 90) ||  // A-Z
      (code >= 97 && code <= 122) || // a-z
      (code >= 128 && code <= 591)   // Extended Latin
    ) {
      return "word";
    }
    if (code >= 48 && code <= 57) { // 0-9
      return "number";
    }
    if (code === 32 || code === 9 || code === 10 || code === 13) { // whitespace
      return "whitespace";
    }
    if (",.!?;:()[]{}\"'`".includes(ch)) {
      return "punct";
    }
    if (
      (code >= 33 && code <= 47) ||  // !"#$%&'()*+,-./
      (code >= 58 && code <= 64) ||  // :;<=>?@
      (code >= 91 && code <= 96) ||  // [\]^_`
      (code >= 123 && code <= 126) || // {|}~
      (code >= 8200 && code <= 129999) // Extended symbols
    ) {
      return "symbol";
    }
    return "unknown";
  }

  private isBoundaryOptimized(next: TokenType, prev: TokenType): boolean {
    return next !== prev || (next === "symbol" && !this.options.mergeSymbols);
  }
}
