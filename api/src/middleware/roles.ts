import type { RequestHandler } from 'express';
import type { Role } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
export const allowRoles=(...roles:Role[]):RequestHandler=>(req,_res,next)=> req.auth&&roles.includes(req.auth.role)?next():next(new AppError(403,'FORBIDDEN','Insufficient permissions'));
