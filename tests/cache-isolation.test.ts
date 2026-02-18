import { Pipeline } from '../src';

describe('Pipeline cache isolation', () => {
  test('should return an isolated cached context copy', async () => {
    const pipeline = new Pipeline();

    const first = await pipeline.process('Contact john@example.com');
    first.data?.entities.push({
      type: 'injected',
      value: 'manually-mutated',
      start: 0,
      end: 1,
    });

    const second = await pipeline.process('Contact john@example.com');
    const hasInjectedEntity = second.data?.entities.some(
      (entity) => entity.type === 'injected',
    );

    expect(hasInjectedEntity).toBe(false);
  });

  test('should not return a cached result for a different input that collides in hash', async () => {
    const pipeline = new Pipeline();

    const first = await pipeline.process('Aa');
    const second = await pipeline.process('BB');

    expect(first.data?.text).toBe('Aa');
    expect(second.data?.text).toBe('BB');
  });
});
