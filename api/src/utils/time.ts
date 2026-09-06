export function durationMs(value:string): number {
  const m = value.match(/^(\d+)([smhd])$/); if (!m) return 7*86400000;
  const n=Number(m[1]); return n*({s:1000,m:60000,h:3600000,d:86400000}[m[2] as 's'|'m'|'h'|'d']);
}
