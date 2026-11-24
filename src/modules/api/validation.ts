import { z } from "zod";

export const APIKeySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(3).max(30),
  hashed_key: z.string().min(8),
  revoked: z.boolean().default(false),
  scopes: z.array(z.string()).default([]),
  expires_at: z.coerce.date().nullable().optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().optional(),
});

export type APIKey = z.infer<typeof APIKeySchema>;

export type SafeAPIKey = Omit<APIKey, "hashed_key">;

export interface CreateAPIKeyInput {
  userId: string;
  title: string;
  expiresInMs?: number | null;
  scopes?: string[];
}

export interface CreateAPIKeyResponse {
  apiKey: SafeAPIKey;
  plainKey: string;
}
