import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { sha256 } from '../utils/crypto.js';
import { durationMs } from '../utils/time.js';
import { randomBytes } from 'node:crypto';

function accessToken(user:{id:string;role:string}){ return jwt.sign({role:user.role},env.JWT_ACCESS_SECRET,{subject:user.id,expiresIn:env.JWT_ACCESS_EXPIRES_IN as any}); }
function rawRefresh(){ return randomBytes(48).toString('base64url'); }
async function issue(user:{id:string;role:string}){ const refresh=rawRefresh(); await prisma.refreshToken.create({data:{userId:user.id,tokenHash:sha256(refresh),expiresAt:new Date(Date.now()+durationMs(env.JWT_REFRESH_EXPIRES_IN))}}); return {accessToken:accessToken(user),refreshToken:refresh}; }
export const authService={
  async register(data:{firstName:string;lastName:string;email:string;password:string;role:'BUSINESS'|'DEVELOPER'}){ if(await prisma.user.findUnique({where:{email:data.email.toLowerCase()}}))throw new AppError(409,'EMAIL_EXISTS','Email already registered'); const user=await prisma.user.create({data:{firstName:data.firstName,lastName:data.lastName,email:data.email.toLowerCase(),passwordHash:await bcrypt.hash(data.password,12),role:data.role}}); return {user:{id:user.id,firstName:user.firstName,lastName:user.lastName,email:user.email,role:user.role},tokens:await issue(user)}; },
  async login(email:string,password:string){ const user=await prisma.user.findUnique({where:{email:email.toLowerCase()}}); if(!user||user.status!=='ACTIVE'||!(await bcrypt.compare(password,user.passwordHash)))throw new AppError(401,'INVALID_CREDENTIALS','Invalid email or password'); return {user:{id:user.id,firstName:user.firstName,lastName:user.lastName,email:user.email,role:user.role},tokens:await issue(user)}; },
  async refresh(raw:string){ const record=await prisma.refreshToken.findUnique({where:{tokenHash:sha256(raw)},include:{user:true}}); if(!record||record.revokedAt||record.expiresAt<new Date()||record.user.status!=='ACTIVE')throw new AppError(401,'INVALID_REFRESH_TOKEN','Invalid refresh token'); const newRaw=rawRefresh(); const replacement=await prisma.refreshToken.create({data:{userId:record.userId,tokenHash:sha256(newRaw),expiresAt:new Date(Date.now()+durationMs(env.JWT_REFRESH_EXPIRES_IN))}}); await prisma.refreshToken.update({where:{id:record.id},data:{revokedAt:new Date(),replacedById:replacement.id}}); return {accessToken:accessToken(record.user),refreshToken:newRaw}; },
  async logout(raw:string){ await prisma.refreshToken.updateMany({where:{tokenHash:sha256(raw),revokedAt:null},data:{revokedAt:new Date()}}); }
};
