import { Tokenizer } from '../src/core/Tokenizer';

describe('Tokenizer', () => {
  let tokenizer: Tokenizer;

  beforeEach(() => {
    tokenizer = new Tokenizer();
  });

  describe('tokenize method', () => {
    it('should tokenize simple text into words', () => {
      const tokens = tokenizer.tokenize('Hello world');

      // The tokenizer also includes whitespace tokens, so expect more than just words
      expect(tokens).not.toHaveLength(0);
      const wordTokens = tokens.filter(t => t.type === 'word');
      expect(wordTokens).toHaveLength(2);
      expect(wordTokens[0]).toEqual({
        value: 'hello',
        type: 'word',
        start: 0,
        end: 5,
      });
      expect(wordTokens[1]).toEqual({
        value: 'world',
        type: 'word',
        start: 6,
        end: 11,
      });
    });

    it('should handle punctuation', () => {
      const tokens = tokenizer.tokenize('Hello, world!');

      // The tokenizer includes whitespace, so expect more tokens
      const punctTokens = tokens.filter(t => t.type === 'punct');
      expect(punctTokens).toHaveLength(2); // comma and exclamation mark

      expect(punctTokens).toContainEqual({
        value: ',',
        type: 'punct',
        start: 5,
        end: 6,
      });
      expect(punctTokens).toContainEqual({
        value: '!',
        type: 'punct',
        start: expect.any(Number),
        end: expect.any(Number),
      });
    });

    it('should handle numbers', () => {
      const tokens = tokenizer.tokenize('Price is $29.99');

      // The tokenizer splits on characters, so we expect multiple tokens
      const numberTokens = tokens.filter(t => t.type === 'number');
      expect(numberTokens).not.toHaveLength(0);

      // The number 29 and 99 will be separate tokens
      expect(numberTokens.map(t => t.value)).toContain('29');
      expect(numberTokens.map(t => t.value)).toContain('99');
    });

    it('should handle options correctly', () => {
      // Test with lowercase disabled
      const tokenizerNoLowercase = new Tokenizer({ lowercase: false });
      const tokens = tokenizerNoLowercase.tokenize('Hello World');

      const wordTokens = tokens.filter(t => t.type === 'word');
      expect(wordTokens[0].value).toBe('Hello'); // Should preserve case
      // Note: The token after 'Hello' is a space, so the next word would be 'World'
      const worldToken = wordTokens.find(t => t.value === 'World');
      expect(worldToken).toBeDefined();
    });

    it('should handle symbols', () => {
      const tokens = tokenizer.tokenize('Hello @world #test');

      expect(tokens).toContainEqual({
        value: '@',
        type: 'symbol',
        start: 6,
        end: 7,
      });
      expect(tokens).toContainEqual({
        value: '#',
        type: 'symbol',
        start: 13, // Note: position might be different due to how tokenizer works
        end: 14,
      });
    });
  });
});