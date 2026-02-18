import fs from 'fs';
import os from 'os';
import path from 'path';
import { ConfigLoader } from '../src/config/loader';

describe('ConfigLoader', () => {
  const originalEnvApiKey = process.env.QIRREL_LLM_API_KEY;

  afterEach(() => {
    if (originalEnvApiKey === undefined) {
      delete process.env.QIRREL_LLM_API_KEY;
    } else {
      process.env.QIRREL_LLM_API_KEY = originalEnvApiKey;
    }
  });

  test('should resolve environment variable placeholders in YAML values', () => {
    process.env.QIRREL_LLM_API_KEY = 'env-secret-key';
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qirrel-config-'));
    const configPath = path.join(tempDir, 'config.yaml');

    fs.writeFileSync(
      configPath,
      [
        'llm:',
        '  enabled: true',
        '  provider: openai',
        '  apiKey: ${QIRREL_LLM_API_KEY}',
      ].join('\n'),
      'utf-8',
    );

    const config = ConfigLoader.loadConfig(configPath);
    expect(config.llm?.apiKey).toBe('env-secret-key');
  });

  test('should use env api key when llm is enabled but apiKey is omitted', () => {
    process.env.QIRREL_LLM_API_KEY = 'env-fallback-key';
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qirrel-config-'));
    const configPath = path.join(tempDir, 'config.yaml');

    fs.writeFileSync(
      configPath,
      [
        'llm:',
        '  enabled: true',
        '  provider: openai',
      ].join('\n'),
      'utf-8',
    );

    const config = ConfigLoader.loadConfig(configPath);
    expect(config.llm?.apiKey).toBe('env-fallback-key');
  });

  test('should support env placeholders with inline default values', () => {
    delete process.env.QIRREL_UNSET_KEY;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'qirrel-config-'));
    const configPath = path.join(tempDir, 'config.yaml');

    fs.writeFileSync(
      configPath,
      [
        'llm:',
        '  enabled: true',
        '  provider: openai',
        '  apiKey: ${QIRREL_UNSET_KEY:-fallback-key}',
      ].join('\n'),
      'utf-8',
    );

    const config = ConfigLoader.loadConfig(configPath);
    expect(config.llm?.apiKey).toBe('fallback-key');
  });
});
