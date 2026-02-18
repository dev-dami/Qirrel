import { processTexts } from '../src';

describe('processTexts API', () => {
  test('should process multiple texts through convenience API', async () => {
    const results = await processTexts(['one', 'two']);
    expect(results).toHaveLength(2);
    expect(results[0].data?.text).toBe('one');
    expect(results[1].data?.text).toBe('two');
  });
});
