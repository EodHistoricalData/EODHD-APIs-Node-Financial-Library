export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export const NO_OP_LOGGER: Logger = { debug() {}, warn() {}, error() {} };

export function createConsoleLogger(): Logger {
  return {
    debug: (msg, ...args) => console.debug(`[eodhd] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[eodhd] ${msg}`, ...args),
    error: (msg, ...args) => console.error(`[eodhd] ${msg}`, ...args),
  };
}

export function resolveLogger(logger?: Logger): Logger {
  if (logger) return logger;
  if (typeof process !== "undefined" && process.env?.EODHD_LOG === "debug") return createConsoleLogger();
  return NO_OP_LOGGER;
}

export function redactUrl(url: string): string {
  return url.replace(/api_token=[^&]+/, "api_token=***");
}
