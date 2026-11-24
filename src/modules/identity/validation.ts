import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
  email: z.string().email(),
  created_at: z.coerce.date(),
  scopes: z.array(z.string()).default([]),
  updated_at: z.coerce.date().optional(),
  is_active: z.boolean().default(true),
});

export type User = z.infer<typeof UserSchema>;

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, "password">;
  sessionId: string;
}
