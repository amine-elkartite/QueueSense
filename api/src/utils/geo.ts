const R=6371;
export function haversineKm(aLat:number,aLon:number,bLat:number,bLon:number){
  const toRad=(d:number)=>d*Math.PI/180; const dLat=toRad(bLat-aLat), dLon=toRad(bLon-aLon);
  const x=Math.sin(dLat/2)**2 + Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
