import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

export function loadYamlConfig() {
  const configPath = join(__dirname, './yml/application.yml');
  const fileContents = fs.readFileSync(configPath, 'utf8');
  const config = yaml.load(fileContents) as Record<string, any>;

  function parseValue(value: string): any {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (!isNaN(Number(value)) && value.trim() !== '') return Number(value);
    return value;
  }

  function replaceEnv(obj: unknown): unknown {
    if (typeof obj === 'string') {
      const envRegex = /^\$\{([A-Z0-9_]+)(?::([^}]*))?\}$/i;
      const match = obj.match(envRegex);

      if (match) {
        const [, varName, defaultValue] = match;

        const envValue = process.env[varName];

        if (envValue !== undefined) {
          return parseValue(envValue);
        }

        if (defaultValue !== undefined) {
          return parseValue(defaultValue);
        }

        throw new Error(`Environment variable "${varName}" is not set`);
      }

      return parseValue(obj);
    } else if (Array.isArray(obj)) {
      return obj.map((item) => replaceEnv(item));
    } else if (typeof obj === 'object' && obj !== null) {
      const newObj: Record<string, unknown> = {};
      for (const key of Object.keys(obj)) {
        newObj[key] = replaceEnv((obj as Record<string, unknown>)[key]);
      }
      return newObj;
    }
    return obj;
  }

  return replaceEnv(config) as Record<string, any>;
}
