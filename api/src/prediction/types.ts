import type { CrowdLevel } from '@prisma/client';
export interface HistoricalPoint { recordedAt:Date; estimatedWaitTime:number; peopleWaiting:number }
export interface PredictionInput { now:Date; target:Date; peopleWaiting:number; peopleBeingServed:number; averageServiceTime:number; capacity:number; history:HistoricalPoint[]; incidentActive:boolean; openingHours:{dayOfWeek:number;openTime:string;closeTime:string;closed:boolean}[] }
export interface PredictionResult { waitTime:number; confidence:number; crowdLevel:CrowdLevel }
export interface WaitTimePredictor { predict(input:PredictionInput):Promise<PredictionResult> }
