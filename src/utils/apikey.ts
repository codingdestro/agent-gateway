import crypto from "crypto";
import bcrypt from "bcrypt";

export interface ApiKeyData {
  id: string; // unique id of the key record
  userId: string | number;
  name?: string; // optional label (e.g. "Production", "CI")
  hashedKey: string; // bcrypt hash of the actual key
  prefix: string; // first few chars for identification (e.g. "sk_live_ab12")
  createdAt: number;
  expiresAt: number | null; // null = never expires
  lastUsedAt?: number;
  revokedAt?: number | null;
  scopes?: string[]; // optional permissions
  [key: string]: any;
}

// ======================
// Config
// ======================

const API_KEY_BYTES = 32; // 256-bit entropy
const BCRYPT_ROUNDS = 12;
const DEFAULT_PREFIX = "sk"; // change to "sk_live", "sk_test", etc.

// ======================
// Core Utils
// ======================

export function generateApiKey(prefix: string = DEFAULT_PREFIX): string {
  const random = crypto.randomBytes(API_KEY_BYTES).toString("hex");
  return `${prefix}_${random}`;
}

export function getKeyPrefix(apiKey: string, length = 12): string {
  return apiKey.slice(0, length);
}

export async function createApiKey(
  userId: string | number,
  options: {
    name?: string;
    expiresInMs?: number | null; // null = never expires
    scopes?: string[];
    prefix?: string;
  } = {},
): Promise<{ plainKey: string; record: ApiKeyData }> {
  const {
    name,
    expiresInMs = null,
    scopes = [],
    prefix = DEFAULT_PREFIX,
  } = options;

  const plainKey = generateApiKey(prefix);
  const hashedKey = await bcrypt.hash(plainKey, BCRYPT_ROUNDS);
  const now = Date.now();

  const record: ApiKeyData = {
    id: crypto.randomUUID(),
    userId,
    name,
    hashedKey,
    prefix: getKeyPrefix(plainKey),
    createdAt: now,
    expiresAt: expiresInMs ? now + expiresInMs : null,
    revokedAt: null,
    scopes,
  };

  return { plainKey, record };
}

export async function isValidAPIKey(
  plainKey: string,
  hashKey: string,
): Promise<boolean> {
  return await bcrypt.compare(plainKey, hashKey);
}
