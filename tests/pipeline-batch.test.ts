import { Pipeline } from '../src';

describe('Pipeline batch processing', () => {
  test('should process a batch of texts and preserve order', async () => {
    const pipeline = new Pipeline();
    const inputs = ['alpha@example.com', 'Visit https://example.com', 'Plain text'];

    const results = await pipeline.processBatch(inputs);

    expect(results).toHaveLength(inputs.length);
    expect(results[0].data?.text).toBe('alpha@example.com');
    expect(results[1].data?.text).toBe('Visit https://example.com');
    expect(results[2].data?.text).toBe('Plain text');
  });

  test('should return empty array for empty batch input', async () => {
    const pipeline = new Pipeline();
    const results = await pipeline.processBatch([]);
    expect(results).toEqual([]);
  });

  test('should throw for invalid concurrency values', async () => {
    const pipeline = new Pipeline();

    await expect(
      pipeline.processBatch(['hello'], { concurrency: 0 }),
    ).rejects.toThrow('concurrency');
  });
});
