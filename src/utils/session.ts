import crypto from "crypto";

export interface SessionData {
  userId: string | number;
  createdAt: number;
  expiresAt: number;
  [key: string]: any; // allow extra data (role, email, etc.)
}

export interface SessionStore {
  get(sessionId: string): Promise<SessionData | null>;
  set(sessionId: string, data: SessionData): Promise<void>;
  delete(sessionId: string): Promise<void>;
}
const memoryStore = new Map<string, SessionData>();

export const inMemoryStore: SessionStore = {
  async get(sessionId) {
    return memoryStore.get(sessionId) ?? null;
  },
  async set(sessionId, data) {
    memoryStore.set(sessionId, data);
  },
  async delete(sessionId) {
    memoryStore.delete(sessionId);
  },
};

const SESSION_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days (in ms)
const SESSION_ID_BYTES = 32;

export function generateSessionId(): string {
  return crypto.randomBytes(SESSION_ID_BYTES).toString("hex");
}

export async function createSession(
  userId: string | number,
  extraData: Record<string, any> = {},
  store: SessionStore = inMemoryStore,
  ttlMs: number = SESSION_TTL,
): Promise<{ sessionId: string; data: SessionData }> {
  const sessionId = generateSessionId();
  const now = Date.now();

  const data: SessionData = {
    userId,
    createdAt: now,
    expiresAt: now + ttlMs,
    ...extraData,
  };

  await store.set(sessionId, data);

  return { sessionId, data };
}

export async function getSession(
  sessionId: string,
  store: SessionStore = inMemoryStore,
): Promise<SessionData | null> {
  if (!sessionId) return null;

  const data = await store.get(sessionId);
  if (!data) return null;

  // Auto-expire if past expiry
  if (Date.now() > data.expiresAt) {
    await store.delete(sessionId);
    return null;
  }

  return data;
}

export async function verifySession(
  sessionId: string,
  store: SessionStore = inMemoryStore,
): Promise<boolean> {
  const session = await getSession(sessionId, store);
  return session !== null;
}

export async function refreshSession(
  sessionId: string,
  store: SessionStore = inMemoryStore,
  ttlMs: number = SESSION_TTL,
): Promise<SessionData | null> {
  const data = await getSession(sessionId, store);
  if (!data) return null;

  data.expiresAt = Date.now() + ttlMs;
  await store.set(sessionId, data);

  return data;
}

export async function destroySession(
  sessionId: string,
  store: SessionStore = inMemoryStore,
): Promise<void> {
  if (!sessionId) return;
  await store.delete(sessionId);
}

export async function destroyAllUserSessions(
  userId: string | number,
  store: SessionStore = inMemoryStore,
): Promise<void> {
  // Note: In-memory Map is not efficient for this.
  // With Redis you would use a secondary index (e.g. user:{userId}:sessions)
  for (const [sessionId, data] of memoryStore.entries()) {
    if (data.userId === userId) {
      await store.delete(sessionId);
    }
  }
}
