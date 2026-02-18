import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { defaultConfig, type MiniparseConfig } from "./defaults";

export class ConfigLoader {
  private static readonly CONFIG_FILE_NAME = "miniparse.config.yaml";
  private static readonly DEFAULT_CONFIG_FILE_NAME = "default.yaml";
  private static readonly ENV_API_KEY_CANDIDATES = [
    "QIRREL_LLM_API_KEY",
    "MINIPARSE_LLM_API_KEY",
    "OPENAI_API_KEY",
    "GEMINI_API_KEY",
  ];

  public static loadConfig(customConfigPath?: string): MiniparseConfig {
    if (customConfigPath && fs.existsSync(customConfigPath)) {
      return this.loadConfigFromFile(customConfigPath);
    }

    const localConfigPath = path.join(process.cwd(), this.CONFIG_FILE_NAME);
    if (fs.existsSync(localConfigPath)) {
      return this.loadConfigFromFile(localConfigPath);
    }

    const defaultConfigPath = path.join(
      __dirname,
      "../..",
      this.DEFAULT_CONFIG_FILE_NAME,
    );
    if (fs.existsSync(defaultConfigPath)) {
      return this.loadConfigFromFile(defaultConfigPath);
    }
    return this.applyEnvDefaults(JSON.parse(JSON.stringify(defaultConfig)));
  }

  private static loadConfigFromFile(filePath: string): MiniparseConfig {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");

      const configObject = this.resolveEnvPlaceholders(
        yaml.load(fileContent) as Partial<MiniparseConfig>,
      );

      if (configObject === null || typeof configObject !== "object") {
        throw new Error("YAML file did not contain a valid object");
      }
      return this.applyEnvDefaults(this.mergeConfigWithDefaults(configObject));
    } catch (error) {
      console.warn(`Failed to load config from ${filePath}:`, error);
      console.warn("Falling back to default configuration");
      return JSON.parse(JSON.stringify(defaultConfig));
    }
  }

  private static mergeConfigWithDefaults(
    partialConfig: Partial<MiniparseConfig>,
  ): MiniparseConfig {
    const config: any = JSON.parse(JSON.stringify(defaultConfig));

    this.deepMerge(config, partialConfig);

    return config as MiniparseConfig;
  }

  private static deepMerge(target: any, source: any): void {
    for (const key in source) {
      if (source && Object.prototype.hasOwnProperty.call(source, key)) {
        if (
          source[key] &&
          typeof source[key] === "object" &&
          !Array.isArray(source[key])
        ) {
          if (!target[key]) target[key] = {};
          this.deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
  }

  private static resolveEnvPlaceholders<T>(value: T): T {
    if (Array.isArray(value)) {
      return value.map((item) => this.resolveEnvPlaceholders(item)) as T;
    }

    if (value && typeof value === "object") {
      const resolved: Record<string, unknown> = {};
      for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
        resolved[key] = this.resolveEnvPlaceholders(nestedValue);
      }
      return resolved as T;
    }

    if (typeof value === "string") {
      return this.resolveEnvString(value) as T;
    }

    return value;
  }

  private static resolveEnvString(value: string): string {
    return value.replace(
      /\$\{([A-Z0-9_]+)(?::-(.*?))?\}/g,
      (_match, variableName: string, fallbackValue: string | undefined) => {
        const envValue = process.env[variableName];
        if (envValue !== undefined) {
          return envValue;
        }
        return fallbackValue ?? "";
      },
    );
  }

  private static applyEnvDefaults(config: MiniparseConfig): MiniparseConfig {
    const resolvedConfig = JSON.parse(JSON.stringify(config)) as MiniparseConfig;
    const envApiKey = this.findEnvApiKey();
    if (resolvedConfig.llm?.enabled && !resolvedConfig.llm.apiKey && envApiKey) {
      resolvedConfig.llm.apiKey = envApiKey;
    }
    return resolvedConfig;
  }

  private static findEnvApiKey(): string | undefined {
    for (const key of this.ENV_API_KEY_CANDIDATES) {
      const value = process.env[key];
      if (value) {
        return value;
      }
    }
    return undefined;
  }
}
