import type { RequestHandler } from 'express';
import { logger } from '../config/logger.js';
export const requestLogger: RequestHandler=(req,res,next)=>{ req.startedAt=Date.now(); res.on('finish',()=>logger.info('request',{method:req.method,path:req.path,status:res.statusCode,responseTime:Date.now()-(req.startedAt??Date.now())})); next(); };
