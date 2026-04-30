type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMetadata {
  [key: string]: unknown;
}

interface LogRecord {
  ts: string;
  level: LogLevel;
  service: string;
  env: string;
  msg: string;
  [key: string]: unknown;
}

const SERVICE_NAME = process.env.SERVICE_NAME ?? "volara-backend";
const APP_ENV = process.env.NODE_ENV ?? "development";

function normalizeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { message: String(error) };
}

function emit(level: LogLevel, msg: string, metadata?: LogMetadata): void {
  const record: LogRecord = {
    ts: new Date().toISOString(),
    level,
    service: SERVICE_NAME,
    env: APP_ENV,
    msg,
  };

  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      record[key] = value;
    }
  }

  const payload = JSON.stringify(record);
  if (level === "error") {
    console.error(payload);
    return;
  }

  if (level === "warn") {
    console.warn(payload);
    return;
  }

  console.log(payload);
}

export const logger = {
  debug: (msg: string, metadata?: LogMetadata) => emit("debug", msg, metadata),
  info: (msg: string, metadata?: LogMetadata) => emit("info", msg, metadata),
  warn: (msg: string, metadata?: LogMetadata) => emit("warn", msg, metadata),
  error: (msg: string, metadata?: LogMetadata) => emit("error", msg, metadata),
  withError: (msg: string, error: unknown, metadata?: LogMetadata) =>
    emit("error", msg, { ...metadata, error: normalizeError(error) }),
};
