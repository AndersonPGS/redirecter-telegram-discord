import * as fs from "fs";
import * as path from "path";

export interface Config {
  discord: {
    defaultUsername: string;
    messageFormat: string;
  };
  telegram: {
    connectionRetries: number;
    defaultSenderName: string;
    systemSenderName: string;
    groupId: string;
  };
  app: {
    name: string;
    version: string;
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
