const E=['Wood','Fire','Earth','Metal','Water'];
const STEMS=[{zh:'甲',e:'Wood'},{zh:'乙',e:'Wood'},{zh:'丙',e:'Fire'},{zh:'丁',e:'Fire'},{zh:'戊',e:'Earth'},{zh:'己',e:'Earth'},{zh:'庚',e:'Metal'},{zh:'辛',e:'Metal'},{zh:'壬',e:'Water'},{zh:'癸',e:'Water'}];
const BR=[{zh:'子',e:['Water']},{zh:'丑',e:['Earth','Water','Metal']},{zh:'寅',e:['Wood','Fire','Earth']},{zh:'卯',e:['Wood']},{zh:'辰',e:['Earth','Wood','Water']},{zh:'巳',e:['Fire','Metal','Earth']},{zh:'午',e:['Fire','Earth']},{zh:'未',e:['Earth','Wood','Fire']},{zh:'申',e:['Metal','Water','Earth']},{zh:'酉',e:['Metal']},{zh:'戌',e:['Earth','Fire','Metal']},{zh:'亥',e:['Water','Wood']}];
function tally(s,b){const c={Wood:0,Fire:0,Earth:0,Metal:0,Water:0};c[STEMS[s].e]++;BR[b].e.forEach(x=>c[x]++);return c}
function total(arr){const t={Wood:0,Fire:0,Earth:0,Metal:0,Water:0};arr.forEach(c=>E.forEach(k=>t[k]+=c[k]||0));return t}
function dom(counts){const a=Object.entries(counts).sort((x,y)=>y[1]-x[1]);const most=a[0][0],least=a[a.length-1][0];const avg=a.reduce((s,v)=>s+v[1],0)/a.length;const v=a.reduce((s,v)=>s+Math.pow(v[1]-avg,2),0)/a.length;return{most,least,balanced:v<1.2}}
function luckyBy(k){return{Wood:['green','cyan'],Fire:['red','orange'],Earth:['yellow','brown'],Metal:['white','silver','gold'],Water:['black','blue','navy']}[k]||[]}
