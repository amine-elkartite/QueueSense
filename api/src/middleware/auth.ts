import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
export const requireAuth:RequestHandler=asyncHandler(async(req,_res,next)=>{
  const token=req.headers.authorization?.replace(/^Bearer\s+/i,''); if(!token) throw new AppError(401,'AUTH_REQUIRED','Authentication required');
  try { const p=jwt.verify(token,env.JWT_ACCESS_SECRET) as {sub:string;role:any}; const user=await prisma.user.findUnique({where:{id:p.sub}}); if(!user||user.status!=='ACTIVE') throw new Error('inactive'); req.auth={userId:user.id,role:user.role,status:user.status}; next(); } catch { throw new AppError(401,'INVALID_TOKEN','Invalid or expired access token'); }
});
