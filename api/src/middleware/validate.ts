import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError.js';
export const validate=(schema:ZodTypeAny):RequestHandler=>(req,_res,next)=>{ const r=schema.safeParse({body:req.body,params:req.params,query:req.query}); if(!r.success) return next(new AppError(400,'VALIDATION_ERROR','Invalid request',r.error.flatten())); Object.assign(req,r.data); next(); };
