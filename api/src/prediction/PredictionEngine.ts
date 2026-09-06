import type { PrismaClient } from '@prisma/client';
import { StatisticalWaitTimePredictor } from './StatisticalWaitTimePredictor.js';
import type { WaitTimePredictor } from './types.js';
import { AppError } from '../utils/AppError.js';
export class PredictionEngine {
  constructor(private db:PrismaClient,private predictor:WaitTimePredictor=new StatisticalWaitTimePredictor()){}
  private async input(locationId:string,target:Date){ const l=await this.db.location.findUnique({where:{id:locationId},include:{snapshots:{orderBy:{recordedAt:'desc'},take:200},openingHours:true,incidents:{where:{active:true}}}}); if(!l)throw new AppError(404,'LOCATION_NOT_FOUND','Location not found'); const current=l.snapshots[0]; return {now:new Date(),target,peopleWaiting:current?.peopleWaiting??0,peopleBeingServed:current?.peopleBeingServed??1,averageServiceTime:current?.averageServiceTime??l.averageServiceTime,capacity:l.capacity,history:[...l.snapshots].reverse(),incidentActive:l.incidents.length>0,openingHours:l.openingHours}; }
  async predictCurrentWait(id:string){return this.predictor.predict(await this.input(id,new Date()));}
  async predictWaitIn30Minutes(id:string){return this.predictor.predict(await this.input(id,new Date(Date.now()+30*60000)));}
  async predictWaitIn1Hour(id:string){return this.predictor.predict(await this.input(id,new Date(Date.now()+60*60000)));}
  async predictWaitAtTime(id:string,target:Date){return this.predictor.predict(await this.input(id,target));}
  async calculateConfidence(id:string){return (await this.predictCurrentWait(id)).confidence;}
  async findBestVisitTimes(id:string,date:Date){ const l=await this.db.location.findUnique({where:{id},include:{openingHours:true}}); if(!l)throw new AppError(404,'LOCATION_NOT_FOUND','Location not found'); const day=date.getDay(); const oh=l.openingHours.find(x=>x.dayOfWeek===day); if(!oh||oh.closed)return {bestTimes:[],avoid:[]}; const [sh,sm]=oh.openTime.split(':').map(Number),[eh,em]=oh.closeTime.split(':').map(Number); const points=[] as {time:string;estimatedWait:number}[]; for(let m=sh!*60+sm!;m<=eh!*60+em!;m+=30){ const t=new Date(date); t.setHours(Math.floor(m/60),m%60,0,0); const p=await this.predictWaitAtTime(id,t); points.push({time:t.toTimeString().slice(0,5),estimatedWait:p.waitTime}); } const sorted=[...points].sort((a,b)=>a.estimatedWait-b.estimatedWait); return {bestTimes:sorted.slice(0,3),avoid:sorted.slice(-3).reverse()}; }
}
