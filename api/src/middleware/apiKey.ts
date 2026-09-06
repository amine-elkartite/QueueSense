import type { RequestHandler } from 'express';
import { prisma } from '../config/prisma.js';
import { safeRedis, redis } from '../config/redis.js';
import { sha256 } from '../utils/crypto.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { PLAN_LIMITS, planWindow } from '../utils/planLimits.js';

export const requireApiKey:RequestHandler=asyncHandler(async(req,res,next)=>{
  const raw=req.header('X-API-Key'); if(!raw) throw new AppError(401,'API_KEY_REQUIRED','X-API-Key header is required');
  const apiKey=await prisma.apiKey.findUnique({where:{keyHash:sha256(raw)},include:{user:{include:{subscriptions:{where:{status:'ACTIVE'},include:{plan:true},take:1,orderBy:{startedAt:'desc'}}}}}});
  if(!apiKey||!apiKey.active||(apiKey.expiresAt&&apiKey.expiresAt<new Date())) throw new AppError(401,'INVALID_API_KEY','Invalid, revoked or expired API key');
  const sub=apiKey.user.subscriptions[0]; const plan=sub?.plan.name ?? 'FREE'; const limit=sub?.plan.monthlyRequestLimit ?? PLAN_LIMITS.FREE; const now=new Date();
  const suffix=planWindow(plan)==='day'?now.toISOString().slice(0,10):now.toISOString().slice(0,7); const key=`rate:${apiKey.id}:${suffix}`;
  let count=await safeRedis(()=>redis.incr(key),-1); if(count>0) await safeRedis(()=>redis.expire(key,plan==='FREE'?86400:2678400),0);
  if(count<0){ const start=plan==='FREE'?new Date(now.getFullYear(),now.getMonth(),now.getDate()):new Date(now.getFullYear(),now.getMonth(),1); count=await prisma.apiUsage.count({where:{apiKeyId:apiKey.id,createdAt:{gte:start}}})+1; }
  if(count>limit) throw new AppError(429,'RATE_LIMIT_EXCEEDED','API request limit reached');
  req.apiKey={id:apiKey.id,userId:apiKey.userId,plan,limit};
  res.on('finish',()=>{ prisma.apiUsage.create({data:{apiKeyId:apiKey.id,endpoint:req.route?.path??req.path,method:req.method,statusCode:res.statusCode,responseTime:Date.now()-(req.startedAt??Date.now())}}).catch(()=>undefined); prisma.apiKey.update({where:{id:apiKey.id},data:{lastUsedAt:new Date()}}).catch(()=>undefined); });
  next();
});
