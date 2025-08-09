

// ===== Simplified date -> pillars helpers (added) =====
function mod(n,m){return ((n%m)+m)%m;}
function julianDayNumber(y,m,d){const a=Math.floor((14-m)/12);const y2=y+4800-a;const m2=m+12*a-3;
  return d+Math.floor((153*m2+2)/5)+365*y2+Math.floor(y2/4)-Math.floor(y2/100)+Math.floor(y2/400)-32045;}
function sexagenaryDay(y,m,d){const j=julianDayNumber(y,m,d);const idx=mod(j+49,60);return [idx%10, idx%12];}
function lichunAdjustedYear(dateUTC){const y=dateUTC.getUTCFullYear(),m=dateUTC.getUTCMonth(),d=dateUTC.getUTCDate();
  if(m<1) return y-1; if(m===1 && d<4) return y-1; return y;}
function sexagenaryYear(y){return [mod((y-4),10), mod((y-4),12)];}
function monthPillar(yStem,dateUTC){
  const m=dateUTC.getUTCMonth(), d=dateUTC.getUTCDate();
  const S={1:4,2:6,3:5,4:6,5:6,6:7,7:8,8:8,9:8,10:7,11:7,12:6};
  let k=0;
  if(m===1)k=(d>=S[1])?1:12; else if(m===2)k=(d>=S[2])?2:1; else if(m===3)k=(d>=S[3])?3:2; else if(m===4)k=(d>=S[4])?4:3;
  else if(m===5)k=(d>=S[5])?5:4; else if(m===6)k=(d>=S[6])?6:5; else if(m===7)k=(d>=S[7])?7:6; else if(m===8)k=(d>=S[8])?8:7;
  else if(m===9)k=(d>=S[9])?9:8; else if(m===10)k=(d>=S[10])?10:9; else if(m===11)k=(d>=S[11])?11:10; else if(m===0)k=(d>=S[12])?12:11;
  const branchIdx=mod(2+(k-1),12);
  const start={0:2,5:2,1:4,6:4,2:6,7:6,3:8,8:8,4:0,9:0}[yStem];
  const stemIdx=mod(start+(k-1),10);
  return [stemIdx,branchIdx];
}
function hourBranchIndex(h){ return Math.floor(mod(h,24)/2); } // 子(0: 23:00-00:59)... simplified: 0..11
function hourPillar(dayStemIdx,h){ const hb = hourBranchIndex(h); const stemStart=[0,2,4,6,8,0,2,4,6,8][dayStemIdx]; const hs=mod(stemStart+hb,10); return [hs,hb]; }
// ===== end helpers =====
