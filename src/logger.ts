type Level = "debug" | "info" | "warn" | "error";

const LEVELS: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const threshold = resolveThreshold();

function resolveThreshold(): number {
  const configured = process.env.LOG_LEVEL?.trim().toLowerCase();

  if (configured && configured in LEVELS) {
    return LEVELS[configured as Level];
  }

  return LEVELS.info;
}

function serializeError(value: unknown): Record<string, unknown> {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }

  return { name: "NonError", message: String(value) };
}

function normalize(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      value instanceof Error ? serializeError(value) : value,
    ]),
  );
}

export function log(level: Level, event: string, fields: Record<string, unknown> = {}): void {
  if (LEVELS[level] < threshold) return;

  const time = new Date().toISOString();
  let line: string;

  try {
    line = JSON.stringify({ level, time, event, ...normalize(fields) });
  } catch {
    line = JSON.stringify({ level, time, event, logError: "fields not serializable" });
  }

  process.stderr.write(`${line}\n`);
}
