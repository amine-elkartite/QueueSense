import type {Request,Response} from 'express';
import {analyticsService} from '../services/analytics.service.js';
import {ok} from '../utils/response.js';
import {prisma} from '../config/prisma.js';
import {queueService} from '../services/queue.service.js';

export const dashboardController={
  stats:async(req:Request,res:Response)=>ok(res,await analyticsService.dashboard(req.auth!.userId,req.auth!.role)),
  live:async(req:Request,res:Response)=>{
    const where:any=req.auth!.role==='BUSINESS'?{business:{ownerId:req.auth!.userId}}:{};
    const locs=await prisma.location.findMany({where,include:{business:true,category:true,snapshots:{orderBy:{recordedAt:'desc'},take:1}}});
    return ok(res,locs.map(l=>({id:l.id,name:l.name,business:l.business.name,city:l.city,current:l.snapshots[0]??null,status:l.active?'OPEN':'INACTIVE'})));
  },
  predictions:async(req:Request,res:Response)=>{
    const where:any=req.auth!.role==='BUSINESS'?{business:{ownerId:req.auth!.userId}}:{};
    const locs=await prisma.location.findMany({where,select:{id:true,name:true,city:true},take:30});
    const rows=await Promise.all(locs.map(async l=>{const [now,m30,h1]=await Promise.all([queueService.engine.predictCurrentWait(l.id),queueService.engine.predictWaitIn30Minutes(l.id),queueService.engine.predictWaitIn1Hour(l.id)]);return {...l,current:now.waitTime,in30Minutes:m30.waitTime,in1Hour:h1.waitTime,confidence:now.confidence,crowdLevel:now.crowdLevel}}));
    return ok(res,rows);
  },
  usage:async(req:Request,res:Response)=>{
    const where:any=req.auth!.role==='DEVELOPER'?{apiKey:{userId:req.auth!.userId}}:{};
    const month=new Date();month.setDate(1);month.setHours(0,0,0,0);
    const rows=await prisma.apiUsage.findMany({where:{...where,createdAt:{gte:month}},orderBy:{createdAt:'asc'}});
    const successful=rows.filter(r=>r.statusCode<400).length;
    const errors=rows.length-successful;
    const averageResponseTime=rows.length?Math.round(rows.reduce((s,r)=>s+r.responseTime,0)/rows.length):0;
    const hourly=new Map<string,number>();for(const r of rows){const k=r.createdAt.toISOString().slice(0,13)+':00';hourly.set(k,(hourly.get(k)??0)+1)}
    return ok(res,{requestsMonth:rows.length,successful,errors,averageResponseTime,requestsByHour:[...hourly].map(([time,count])=>({time,count}))});
  }
};
