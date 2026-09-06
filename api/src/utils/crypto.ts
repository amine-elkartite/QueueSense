import { createHash, randomBytes } from 'node:crypto';
export const sha256 = (value:string) => createHash('sha256').update(value).digest('hex');
export const createApiKey = () => `qs_live_${randomBytes(24).toString('base64url')}`;
