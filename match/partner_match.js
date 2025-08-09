// Partner Match self-contained script (no external deps)
const E=['Wood','Fire','Earth','Metal','Water'];
const STEMS=[{zh:'甲',e:'Wood'},{zh:'乙',e:'Wood'},{zh:'丙',e:'Fire'},{zh:'丁',e:'Fire'},{zh:'戊',e:'Earth'},{zh:'己',e:'Earth'},{zh:'庚',e:'Metal'},{zh:'辛',e:'Metal'},{zh:'壬',e:'Water'},{zh:'癸',e:'Water'}];
const BR=[{zh:'子',e:['Water']},{zh:'丑',e:['Earth','Water','Metal']},{zh:'寅',e:['Wood','Fire','Earth']},{zh:'卯',e:['Wood']},{zh:'辰',e:['Earth','Wood','Water']},{zh:'巳',e:['Fire','Metal','Earth']},{zh:'午',e:['Fire','Earth']},{zh:'未',e:['Earth','Wood','Fire']},{zh:'申',e:['Metal','Water','Earth']},{zh:'酉',e:['Metal']},{zh:'戌',e:['Earth','Fire','Metal']},{zh:'亥',e:['Water','Wood']}];
const mod=(n,m)=>((n%m)+m)%m;
function tally(s,b){const c={Wood:0,Fire:0,Earth:0,Metal:0,Water:0};c[STEMS[s].e]++;BR[b].e.forEach(x=>c[x]++);return c}
function total(arr){const t={Wood:0,Fire:0,Earth:0,Metal:0,Water:0};arr.forEach(c=>E.forEach(k=>t[k]+=c[k]||0));return t}
function dom(counts){const a=Object.entries(counts).sort((x,y)=>y[1]-x[1]);const most=a[0][0],least=a[a.length-1][0];const avg=a.reduce((s,v)=>s+v[1],0)/a.length;const v=a.reduce((s,v)=>s+Math.pow(v[1]-avg,2),0)/a.length;return{most,least,balanced:v<1.2}}
function julianDayNumber(y,m,d){const a=Math.floor((14-m)/12);const y2=y+4800-a;const m2=m+12*a-3;return d+Math.floor((153*m2+2)/5)+365*y2+Math.floor(y2/4)-Math.floor(y2/100)+Math.floor(y2/400)-32045;}
function sexagenaryDay(y,m,d){const j=julianDayNumber(y,m,d);const idx=mod(j+49,60);return [idx%10, idx%12];}
function lichunAdjustedYear(dateUTC){const y=dateUTC.getUTCFullYear(),m=dateUTC.getUTCMonth(),d=dateUTC.getUTCDate();if(m<1)return y-1;if(m===1&&d<4)return y-1;return y;}
function sexagenaryYear(y){return [mod((y-4),10), mod((y-4),12)];}
function monthPillar(yStem,dateUTC){const m=dateUTC.getUTCMonth(),d=dateUTC.getUTCDate();const S={1:4,2:6,3:5,4:6,5:6,6:7,7:8,8:8,9:8,10:7,11:7,12:6};let k=0;
  if(m===1)k=(d>=S[1])?1:12; else if(m===2)k=(d>=S[2])?2:1; else if(m===3)k=(d>=S[3])?3:2; else if(m===4)k=(d>=S[4])?4:3; else if(m===5)k=(d>=S[5])?5:4; else if(m===6)k=(d>=S[6])?6:5; else if(m===7)k=(d>=S[7])?7:6; else if(m===8)k=(d>=S[8])?8:7; else if(m===9)k=(d>=S[9])?9:8; else if(m===10)k=(d>=S[10])?10:9; else if(m===11)k=(d>=S[11])?11:10; else if(m===0)k=(d>=S[12])?12:11;
  const branchIdx=mod(2+(k-1),12); const start={0:2,5:2,1:4,6:4,2:6,7:6,3:8,8:8,4:0,9:0}[yStem]; const stemIdx=mod(start+(k-1),10); return [stemIdx,branchIdx];}
function hourBranchIndex(h){ return Math.floor(mod(h,24)/2); } function hourPillar(dayStemIdx,h){ const hb = hourBranchIndex(h); const stemStart=[0,2,4,6,8,0,2,4,6,8][dayStemIdx]; const hs=mod(stemStart+hb,10); return [hs,hb]; }
const SIX_HARM=new Set(['子午','丑未','寅申','卯酉','辰戌','巳亥']),SIX_COMB=new Set(['子丑','寅亥','卯戌','辰酉','巳申','午未']);
const TR=[new Set(['申','子','辰']),new Set(['寅','午','戌']),new Set(['亥','卯','未']),new Set(['巳','酉','丑'])];
const eStem=i=>STEMS[i].e, brZh=i=>BR[i].zh;
function cycleRel(a,b){const o=['Wood','Fire','Earth','Metal','Water'];const ai=o.indexOf(a),bi=o.indexOf(b);if((ai+1)%5===bi)return 1;if((ai+4)%5===bi)return -1;return 0;}
function buildPillars(y,m,d,hrOpt){const dP=sexagenaryDay(y,m,d);const dt=new Date(Date.UTC(y,m-1,d));const yAdj=lichunAdjustedYear(dt);const yP=sexagenaryYear(yAdj);const mP=monthPillar(yP[0],dt);let hP=null;if(hrOpt!=='' && hrOpt!=null){const hr=parseInt(hrOpt,10); if(Number.isFinite(hr)) hP=hourPillar(dP[0],hr);}return { y:yP, m:mP, d:dP, h:hP };}
function countsFromPillars(P){const packs=[{s:P.y[0],b:P.y[1]},{s:P.m[0],b:P.m[1]},{s:P.d[0],b:P.d[1]}];if(P.h)packs.push({s:P.h[0],b:P.h[1]});return total(packs.map(x=>tally(x.s,x.b)));}
function score(A,B,det){
  const da=dom(A),db=dom(B);let comp=0;
  if(da.least===db.most)comp+=22;
  if(db.least===da.most)comp+=10;
  if((B[da.least]||0)-(A[da.least]||0)>=2)comp+=8;
  const union={};E.forEach(k=>union[k]=(A[k]||0)+(B[k]||0));
  const vals=E.map(k=>union[k]||0),avg=vals.reduce((a,b)=>a+b,0)/vals.length;
  const v=vals.reduce((s,x)=>s+Math.pow(x-avg,2),0)/vals.length;
  const balance=Math.max(0,25*(1/(1+v)));
  let pair=brZh(det.a.db)+brZh(det.b.db),rev=pair.split('').reverse().join(''); let rel=0;
  if(SIX_COMB.has(pair)||SIX_COMB.has(rev)) rel+=12;
  if(SIX_HARM.has(pair)||SIX_HARM.has(rev)) rel+=6;
  TR.forEach(s=>{ if(s.has(brZh(det.a.db)) && s.has(brZh(det.b.db))) rel+=5; });
  const stemRel=cycleRel(eStem(det.a.ds),eStem(det.b.ds));
  const stemScore=stemRel===1?8:stemRel===-1?-6:2;
  const totalScore=Math.round(Math.max(0,Math.min(100,comp+balance+rel+stemScore)));
  return { total: totalScore, detail:{comp, balance:Math.round(balance), rel, stemScore}, domA:da, domB:db };
}
