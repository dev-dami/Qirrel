import { extractPhonesOnly } from '../src/processors/extract';
import type { QirrelContext } from '../src/types';

function runPhoneExtraction(text: string): Promise<QirrelContext> {
  const input: QirrelContext = {
    data: {
      text,
      tokens: [],
      entities: [],
    },
  };
  return extractPhonesOnly.run(input);
}

describe('Phone extraction hardening', () => {
  test('extracts UK international format', async () => {
    const result = await runPhoneExtraction('Reach support at +44 20 7946 0958 today.');
    const phones = result.data?.entities.filter((e) => e.type === 'phone') ?? [];
    expect(phones.map((p) => p.value)).toContain('+44 20 7946 0958');
  });

  test('extracts Nigerian international format', async () => {
    const result = await runPhoneExtraction('Emergency line: +234 803 123 4567.');
    const phones = result.data?.entities.filter((e) => e.type === 'phone') ?? [];
    expect(phones.map((p) => p.value)).toContain('+234 803 123 4567');
  });

  test('keeps full German formatted number and avoids truncated partial match', async () => {
    const result = await runPhoneExtraction('Berlin office: +49 (30) 1234 5678.');
    const phones = result.data?.entities.filter((e) => e.type === 'phone') ?? [];
    const values = phones.map((p) => p.value);

    expect(values).toContain('+49 (30) 1234 5678');
    expect(values).not.toContain('1234 5678');
  });

  test('extracts phone number with extension', async () => {
    const result = await runPhoneExtraction('Call +1 (212) 555-0199 ext. 42 for billing.');
    const phones = result.data?.entities.filter((e) => e.type === 'phone') ?? [];
    expect(phones.map((p) => p.value)).toContain('+1 (212) 555-0199 ext. 42');
  });

  test('extracts local number with leading zero when valid for default region', async () => {
    const result = await runPhoneExtraction('Local branch: 0803 123 4567.');
    const phones = result.data?.entities.filter((e) => e.type === 'phone') ?? [];
    expect(phones.map((p) => p.value)).toContain('0803 123 4567');
  });

  test('does not treat short reference numbers as phones', async () => {
    const result = await runPhoneExtraction('Order ref is 1234 5678 and pin is 4444.');
    const phones = result.data?.entities.filter((e) => e.type === 'phone') ?? [];
    expect(phones).toHaveLength(0);
  });

  test.each([
    '+1 415 555 2671',
    '+33 1 42 68 53 00',
    '+61 2 9374 4000',
    '(415) 555-2671',
    '415.555.2671',
    '+1-202-555-0188',
  ])('extracts valid format: %s', async (phoneInput) => {
    const result = await runPhoneExtraction(`Reach us at ${phoneInput}.`);
    const phones = result.data?.entities.filter((e) => e.type === 'phone') ?? [];
    expect(phones.map((p) => p.value)).toContain(phoneInput);
  });

  test.each([
    '12-34-56',
    '0000 0000',
    '999-999-999',
    '111111',
    '1234 5678',
  ])('ignores invalid-like numeric pattern: %s', async (invalidInput) => {
    const result = await runPhoneExtraction(`Ignore this ${invalidInput} code.`);
    const phones = result.data?.entities.filter((e) => e.type === 'phone') ?? [];
    expect(phones).toHaveLength(0);
  });

  test('handles valid phone numbers embedded in noisy text patterns', async () => {
    const noisyInputs = [
      '### hotline => +1 415 555 2671 !!!',
      '[contact:+44 20 7946 0958]',
      'tel:+234 803 123 4567; backup email: ops@example.com',
      'Please dial (+49 (30) 1234 5678), thanks.',
    ];

    for (const text of noisyInputs) {
      const result = await runPhoneExtraction(text);
      const phones = result.data?.entities.filter((e) => e.type === 'phone') ?? [];
      expect(phones.length).toBeGreaterThan(0);
    }
  });
});
