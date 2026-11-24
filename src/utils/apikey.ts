import crypto from "crypto";
import bcrypt from "bcrypt";

const API_KEY_BYTES = 32; // 256-bit entropy
const BCRYPT_ROUNDS = 12;
const DEFAULT_PREFIX = "sk"; // change to "sk_live", "sk_test", etc.

export function generateApiKey(prefix: string = DEFAULT_PREFIX): string {
  const random = crypto.randomBytes(API_KEY_BYTES).toString("hex");
  return `${prefix}_${random}`;
}

export function getKeyPrefix(apiKey: string, length = 12): string {
  return apiKey.slice(0, length);
}

export async function createApiKey(
  options: {
    prefix?: string;
  } = {},
): Promise<{ plainKey: string; hashedKey: string }> {
  const { prefix = DEFAULT_PREFIX } = options;

  const plainKey = generateApiKey(prefix);
  const hashedKey = await bcrypt.hash(plainKey, BCRYPT_ROUNDS);

  return { plainKey, hashedKey };
}

export async function isValidAPIKey(
  plainKey: string,
  hashKey: string,
): Promise<boolean> {
  return await bcrypt.compare(plainKey, hashKey);
}
