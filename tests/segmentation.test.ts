import { segment } from '../src/processors/segment';
import { QirrelContext } from '../src/types';

function createContext(text: string): QirrelContext {
  return {
    meta: {
      requestId: 'test',
      timestamp: Date.now(),
    },
    memory: {},
    llm: {
      model: 'test',
      safety: {
        allowTools: true,
      },
    },
    data: {
      text,
      tokens: [],
      entities: [],
    },
  };
}

describe('Segmentation processor', () => {
  test('should avoid standalone punctuation sentence entities for ellipsis', async () => {
    const result = await segment.run(createContext('Wait...what?Yes.'));
    const sentences = result.data?.entities.filter((e) => e.type === 'sentence').map((e) => e.value);

    expect(sentences).toEqual(['Wait...what?', 'Yes.']);
  });

  test('should not split decimal numbers into separate sentences', async () => {
    const result = await segment.run(createContext('Pi is 3.14 and growing.'));
    const sentences = result.data?.entities.filter((e) => e.type === 'sentence').map((e) => e.value);

    expect(sentences).toEqual(['Pi is 3.14 and growing.']);
  });
});
