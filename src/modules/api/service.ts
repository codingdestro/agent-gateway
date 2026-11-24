import { createApiKey } from "../../utils/apikey";
import type { APIRepository } from "./repository";
import type {
  APIKey,
  CreateAPIKeyInput,
  CreateAPIKeyResponse,
  SafeAPIKey,
} from "./validation";

function toSafeKey(apiKey: APIKey): SafeAPIKey {
  const { hashed_key, ...safeKey } = apiKey;
  return safeKey;
}

export class APIService {
  constructor(private repo: APIRepository) {}

  async create(input: CreateAPIKeyInput): Promise<CreateAPIKeyResponse> {
    const { plainKey, hashedKey } = await createApiKey();

    const expiresAt =
      input.expiresInMs == null
        ? null
        : new Date(Date.now() + input.expiresInMs);

    const created = await this.repo.create({
      user_id: input.userId,
      title: input.title,
      hashed_key: hashedKey,
      scopes: input.scopes ?? [],
      expires_at: expiresAt,
    });

    return { apiKey: toSafeKey(created), plainKey };
  }

  async list(userId: string): Promise<SafeAPIKey[]> {
    const keys = await this.repo.findByUserId(userId);
    return keys.map(toSafeKey);
  }

  async revoke(id: string): Promise<SafeAPIKey | null> {
    const revoked = await this.repo.revoke(id);
    return revoked ? toSafeKey(revoked) : null;
  }
}
