import type { Response } from 'express';
export const ok = (res: Response, data: unknown, meta: Record<string, unknown> = {}, status=200) => res.status(status).json({ success:true, data, meta });
