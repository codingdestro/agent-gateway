import { hashPassword, verifyPassword } from "../../utils/password";
import { createSession } from "../../utils/session";
import type { AuthRepository } from "./repository";
import type { AuthResponse, LoginInput, RegisterInput } from "./validation";

export class UserService {
  constructor(private repo: AuthRepository) {}

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await this.repo.findByEmail(input.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValidPassword = verifyPassword(input.password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    const { sessionId } = await createSession(user.id, {
      email: user.email,
      username: user.username,
    });

    const { password, ...safeUser } = user;

    return {
      sessionId,
      user: safeUser,
    };
  }

  async register(input: RegisterInput): Promise<any> {
    const user = await this.repo.findByEmail(input.email);
    if (user) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(input.password);
    const { password, ...newUser } = await this.repo.createUser({
      ...input,
      password: hashedPassword,
    });

    if (!newUser) {
      throw new Error("Failed to register user");
    }

    const { sessionId } = await createSession(newUser.id);

    return {
      sessionId,
      user: newUser,
    };
  }
}
