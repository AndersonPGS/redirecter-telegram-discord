import * as fs from "fs";
import * as path from "path";

export interface Config {
  discord: {
    defaultTitle: string;
  };
  telegram: {
    connectionRetries: number;
    groupIds: string[];
  };
}

let cachedConfig: Config | null = null;

export function loadConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  const configPath = path.join(process.cwd(), "config.json");

  try {
    const configFile = fs.readFileSync(configPath, "utf-8");
    cachedConfig = JSON.parse(configFile) as Config;
    return cachedConfig;
  } catch (error) {
    console.error("❌ Erro ao carregar config.json:", error);
    throw new Error("❌ Não foi possível carregar o arquivo config.json");
  }
}

export const config = loadConfig();
