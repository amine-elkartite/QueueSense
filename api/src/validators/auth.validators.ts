import { z } from 'zod';
const password=z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/\d/);
export const registerSchema=z.object({body:z.object({firstName:z.string().min(1),lastName:z.string().min(1),email:z.string().email(),password,role:z.enum(['BUSINESS','DEVELOPER']).default('DEVELOPER')}),params:z.object({}),query:z.object({})});
export const loginSchema=z.object({body:z.object({email:z.string().email(),password:z.string().min(1)}),params:z.object({}),query:z.object({})});
export const refreshSchema=z.object({body:z.object({refreshToken:z.string().min(20)}),params:z.object({}),query:z.object({})});
