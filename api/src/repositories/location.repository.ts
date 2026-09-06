import { prisma } from '../config/prisma.js';
export class LocationRepository {
  getById(id:string){return prisma.location.findUnique({where:{id},include:{business:true,category:true,openingHours:true,snapshots:{orderBy:{recordedAt:'desc'},take:1}}});}
  latestSnapshots(ids:string[]){return prisma.queueSnapshot.findMany({where:{locationId:{in:ids}},orderBy:{recordedAt:'desc'}});}
}
