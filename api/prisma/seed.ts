import { PrismaClient, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma=new PrismaClient();
const cities=[
  ['Taza',34.2167,-4.0167],['Fès',34.0331,-5.0003],['Rabat',34.0209,-6.8416],['Casablanca',33.5731,-7.5898],['Marrakech',31.6295,-7.9811],['Tangier',35.7595,-5.8340]
] as const;
const businesses=[
  ['Café Atlas','Restaurant'],['Barber House','Hair Salon'],['AutoFix Garage','Garage'],['Clinique Al Amal','Clinic'],['Bank Center','Bank'],['FitZone Gym','Gym'],['Medina Bites','Restaurant'],['Urban Coffee','Cafe'],['QuickCare','Clinic'],['Maroc Services','Administration']
] as const;
const categories=[['Restaurant','restaurant','utensils'],['Cafe','cafe','coffee'],['Bank','bank','landmark'],['Hospital','hospital','hospital'],['Administration','administration','building-2'],['Garage','garage','wrench'],['Hair Salon','hair-salon','scissors'],['Gym','gym','dumbbell'],['Clinic','clinic','stethoscope'],['Store','store','store']];
async function main(){
  const passwordHash=await bcrypt.hash('Password123!',12);
  const users={
    admin:await prisma.user.upsert({where:{email:'admin@queuesense.dev'},update:{},create:{firstName:'Amine',lastName:'ELKARTITE',email:'admin@queuesense.dev',passwordHash,role:Role.ADMIN,status:UserStatus.ACTIVE}}),
    business:await prisma.user.upsert({where:{email:'business@queuesense.dev'},update:{},create:{firstName:'Demo',lastName:'Business',email:'business@queuesense.dev',passwordHash,role:Role.BUSINESS}}),
    developer:await prisma.user.upsert({where:{email:'developer@queuesense.dev'},update:{},create:{firstName:'Demo',lastName:'Developer',email:'developer@queuesense.dev',passwordHash,role:Role.DEVELOPER}})
  };
  const catMap=new Map<string,string>();for(const [name,slug,icon] of categories){const c=await prisma.category.upsert({where:{slug},update:{name,icon},create:{name,slug,icon}});catMap.set(name,c.id)}
  const plans=[['FREE',100,0],['STARTER',10000,99],['PRO',100000,299],['BUSINESS',1000000,999]] as const;
  const planMap=new Map<string,string>();for(const [name,limit,price] of plans){const p=await prisma.subscriptionPlan.upsert({where:{name},update:{monthlyRequestLimit:limit,price,features:{realtime:true,history:name!=='FREE'}},create:{name,monthlyRequestLimit:limit,price,features:{realtime:true,history:name!=='FREE'}}});planMap.set(name,p.id)}
  const existingSub=await prisma.subscription.findFirst({where:{userId:users.developer.id,status:'ACTIVE'}});if(!existingSub)await prisma.subscription.create({data:{userId:users.developer.id,planId:planMap.get('STARTER')!}});
  const created=[] as {id:string;city:string}[];
  for(let i=0;i<businesses.length;i++){
    const [name,categoryName]=businesses[i]!;const b=await prisma.business.upsert({where:{id:`demo-business-${i+1}`},update:{},create:{id:`demo-business-${i+1}`,ownerId:users.business.id,name,description:`${name} demo business for QueueSense`,verified:i<6,phone:`+212 6 00 00 00 ${String(i+1).padStart(2,'0')}`}});
    const count=i<5?2:1;for(let j=0;j<count;j++){
      const [city,lat,lon]=cities[(i+j)%cities.length]!;const id=`demo-location-${i+1}-${j+1}`;const l=await prisma.location.upsert({where:{id},update:{},create:{id,businessId:b.id,categoryId:catMap.get(categoryName)!,name:j?`${name} ${city}`:name,address:`${10+i*3+j} Avenue Hassan II`,city,country:'Morocco',latitude:lat+(j*.003),longitude:lon+(j*.003),capacity:25+(i%4)*10,averageServiceTime:3+(i%5),active:true}});created.push({id:l.id,city});
      for(let d=0;d<7;d++)await prisma.openingHour.upsert({where:{locationId_dayOfWeek:{locationId:l.id,dayOfWeek:d}},update:{},create:{locationId:l.id,dayOfWeek:d,openTime:d===0?'09:00':'08:00',closeTime:d===0?'20:00':'22:00',closed:false}});
    }
  }
  for(const [idx,l] of created.entries()){
    const existing=await prisma.queueSnapshot.count({where:{locationId:l.id}});if(existing<8){for(let h=0;h<8;h++){for(let d=0;d<2;d++){const recordedAt=new Date(Date.now()-((d*8+h)*60*60*1000));const hour=recordedAt.getHours();const wave=Math.max(0,Math.sin((hour-8)/14*Math.PI));const people=Math.max(0,Math.round(2+wave*(10+(idx%6))*1.8+((h+idx)%3)));const service=3+(idx%5);const serving=1+(idx%4);const wait=Math.round(people/serving*service);const level=wait<8?'LOW':wait<16?'MODERATE':wait<28?'HIGH':'VERY_HIGH';await prisma.queueSnapshot.create({data:{locationId:l.id,peopleWaiting:people,peopleBeingServed:serving,averageServiceTime:service,estimatedWaitTime:wait,crowdLevel:level,source:'SYSTEM',recordedAt}})}}}
  }
  console.log(`Seed complete: ${created.length} locations, ${await prisma.queueSnapshot.count()} queue snapshots`);
}
main().finally(()=>prisma.$disconnect());
