import type { Role, UserStatus } from '@prisma/client';
declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; role: Role; status: UserStatus };
      apiKey?: { id: string; userId: string; plan: string; limit: number };
      startedAt?: number;
    }
  }
}
export {};
