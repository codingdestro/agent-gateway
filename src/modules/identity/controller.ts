import type { Request, Response } from "express";
import type { UserService } from "./service";
import { setSessionCookie } from "../../utils/cookies";

export class UserController {
  constructor(private service: UserService) {}

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.service.login({ email, password });

    setSessionCookie(res, result.sessionId);
    return res.status(200).json({
      message: "user logged in",
      user: result.user.username,
    });
  };

  register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const result = await this.service.register({ username, email, password });
    setSessionCookie(res, result.sessionId);

    return res.status(201).json({
      message: "Registration successful",
      user: result.username,
    });
  };
}
