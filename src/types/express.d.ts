declare global {
  namespace Express {
    interface Request {
      userId?: string;
      scopes?: string[];
      apiKeyId?: string;
    }
  }
}

export {};
