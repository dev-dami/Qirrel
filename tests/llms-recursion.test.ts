import { GenericLLMAdapter } from '../src/llms/generic';
import { GeminiLLMAdapter } from '../src/llms/gemini';
import type { LLMConfig } from '../src/llms/types';

describe('LLM adapters', () => {
  const config: LLMConfig = {
    apiKey: 'test-key',
    model: 'test-model',
  };

  test('generic adapter should delegate generate to API call path', async () => {
    const adapter = new GenericLLMAdapter(config) as unknown as {
      generate: (prompt: string) => Promise<{ content: string }>;
      makeAPICall: jest.Mock;
    };

    adapter.makeAPICall = jest.fn().mockResolvedValue({ content: 'ok' });
    const result = await adapter.generate('hello');

    expect(result.content).toBe('ok');
    expect(adapter.makeAPICall).toHaveBeenCalledTimes(1);
  });

  test('gemini adapter should delegate generate to API call path', async () => {
    const adapter = new GeminiLLMAdapter(config) as unknown as {
      generate: (prompt: string) => Promise<{ content: string }>;
      makeAPICall: jest.Mock;
    };

    adapter.makeAPICall = jest.fn().mockResolvedValue({ content: 'ok' });
    const result = await adapter.generate('hello');

    expect(result.content).toBe('ok');
    expect(adapter.makeAPICall).toHaveBeenCalledTimes(1);
  });
});
