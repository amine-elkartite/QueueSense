import type { CrowdLevel } from '@prisma/client';
import type { PredictionInput, PredictionResult, WaitTimePredictor } from './types.js';
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function crowdLevel(people:number,capacity:number,wait:number,historicalAvg:number):CrowdLevel{
  const load=people/Math.max(capacity,1); const waitRatio=wait/Math.max(historicalAvg||wait||1,1); const score=load*0.65+clamp(waitRatio/2,0,1)*0.35;
  if(score<0.25)return 'LOW'; if(score<0.5)return 'MODERATE'; if(score<0.75)return 'HIGH'; return 'VERY_HIGH';
}
export class StatisticalWaitTimePredictor implements WaitTimePredictor {
  async predict(input:PredictionInput):Promise<PredictionResult>{
    const base=input.peopleWaiting/Math.max(input.peopleBeingServed,1)*input.averageServiceTime;
    const targetHour=input.target.getHours(), targetDay=input.target.getDay();
    const same=input.history.filter(h=>h.recordedAt.getDay()===targetDay&&Math.abs(h.recordedAt.getHours()-targetHour)<=1);
    const histAvg=(same.length?same:input.history).reduce((s,h)=>s+h.estimatedWaitTime,0)/Math.max((same.length?same:input.history).length,1);
    const recent=input.history.slice(-8); const trend=recent.length>1?(recent.at(-1)!.estimatedWaitTime-recent[0]!.estimatedWaitTime)/(recent.length-1):0;
    const minutes=(input.target.getTime()-input.now.getTime())/60000; const trendProjection=trend*Math.min(Math.max(minutes/10,0),6);
    const historicalWeight=clamp(input.history.length/80,0.15,0.65); let predicted=base*(1-historicalWeight)+histAvg*historicalWeight+trendProjection;
    if(input.incidentActive) predicted*=1.3; predicted=clamp(predicted,0,240);
    const confidence=clamp(0.35+Math.min(input.history.length,120)/240+(same.length>=6?0.12:0)+(recent.length>=6?0.08:0)-(input.incidentActive?0.1:0),0,1);
    return {waitTime:Math.round(predicted),confidence:Number(confidence.toFixed(2)),crowdLevel:crowdLevel(input.peopleWaiting,input.capacity,predicted,histAvg)};
  }
}
