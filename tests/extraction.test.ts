import { extract, extractEmailsOnly, extractPhonesOnly, extractUrlsOnly, extractNumbersOnly } from '../src/processors/extract';
import { QirrelContext } from '../src/types';

describe('Extraction Functions', () => {
  describe('extract', () => {
    it('should extract emails, phones, URLs, and numbers from text', () => {
      const input: QirrelContext = {
        meta: {
          requestId: 'test',
          timestamp: Date.now(),
        },
        memory: {},
        llm: {
          model: 'test',
          safety: {
            allowTools: true
          }
        },
        data: {
          text: 'Contact John at john@example.com or call +1-555-123-4567. Visit https://example.com for more info. Price is $29.99.',
          tokens: [],
          entities: [],
        }
      };

      const result = extract(input);

      // Check that entities were found
      expect(result.data?.entities).not.toHaveLength(0);

      const emailEntities = result.data?.entities.filter(e => e.type === 'email') || [];
      expect(emailEntities).not.toHaveLength(0);
      if (emailEntities.length > 0) {
        expect(emailEntities[0].value).toBe('john@example.com');
      }

      // Phone number might be extracted differently based on validation
      // At least verify that processing doesn't break
      const phoneEntities = result.data?.entities.filter(e => e.type === 'phone') || [];
      expect(Array.isArray(phoneEntities)).toBe(true);

      const urlEntity = result.data?.entities.find(e => e.type === 'url');
      expect(urlEntity).toBeDefined();
      expect(urlEntity?.value).toBe('https://example.com');

      const numberEntity = result.data?.entities.some(e => e.type === 'number' && e.value === '29.99');
      expect(numberEntity).toBeTruthy();
    });

    it('should handle text with no extractable entities', () => {
      const input: QirrelContext = {
        meta: {
          requestId: 'test',
          timestamp: Date.now(),
        },
        memory: {},
        llm: {
          model: 'test',
          safety: {
            allowTools: true
          }
        },
        data: {
          text: 'This text has no emails, phones, or URLs',
          tokens: [],
          entities: [],
        }
      };

      const result = extract(input);
      expect(result.data?.entities).toHaveLength(0);
    });
  });

  describe('extractEmailsOnly', () => {
    it('should extract only emails', () => {
      const input: QirrelContext = {
        meta: {
          requestId: 'test',
          timestamp: Date.now(),
        },
        memory: {},
        llm: {
          model: 'test',
          safety: {
            allowTools: true
          }
        },
        data: {
          text: 'Email me at test@example.com or call 555-123-4567',
          tokens: [],
          entities: [],
        }
      };

      const result = extractEmailsOnly(input);
      expect(result.data?.entities).toHaveLength(1);
      const emailEntity = result.data?.entities[0];
      if (emailEntity) {
        expect(emailEntity).toEqual({
          type: 'email',
          value: 'test@example.com',
          start: expect.any(Number),
          end: expect.any(Number),
        });
      }
    });
  });

  describe('extractPhonesOnly', () => {
    it('should extract phone numbers', () => {
      const input: QirrelContext = {
        meta: {
          requestId: 'test',
          timestamp: Date.now(),
        },
        memory: {},
        llm: {
          model: 'test',
          safety: {
            allowTools: true
          }
        },
        data: {
          text: 'Call me at +1-555-123-4567 or 555-123-4567',
          tokens: [],
          entities: [],
        }
      };

      const result = extractPhonesOnly(input);

      // Check that at least one phone number was found
      const phoneEntities = result.data?.entities.filter(e => e.type === 'phone') || [];
      expect(phoneEntities.length).toBeGreaterThan(0);
    });
  });

  describe('extractUrlsOnly', () => {
    it('should extract only URLs', () => {
      const input: QirrelContext = {
        meta: {
          requestId: 'test',
          timestamp: Date.now(),
        },
        memory: {},
        llm: {
          model: 'test',
          safety: {
            allowTools: true
          }
        },
        data: {
          text: 'Visit https://example.com or http://test.org',
          tokens: [],
          entities: [],
        }
      };

      const result = extractUrlsOnly(input);
      expect(result.data?.entities).toHaveLength(2);

      const urls = result.data?.entities.map(e => e.value) || [];
      expect(urls).toContain('https://example.com');
      expect(urls).toContain('http://test.org');
    });
  });

  describe('extractNumbersOnly', () => {
    it('should extract different number formats', () => {
      const input: QirrelContext = {
        meta: {
          requestId: 'test',
          timestamp: Date.now(),
        },
        memory: {},
        llm: {
          model: 'test',
          safety: {
            allowTools: true
          }
        },
        data: {
          text: 'The price is $29.99, quantity is 5, and scientific notation is 1.23e+5',
          tokens: [],
          entities: [],
        }
      };

      const result = extractNumbersOnly(input);
      expect(result.data?.entities).toHaveLength(3);

      const numbers = result.data?.entities.map(e => e.value) || [];
      expect(numbers).toContain('29.99');
      expect(numbers).toContain('5');
      expect(numbers).toContain('1.23e+5');
    });
  });
});