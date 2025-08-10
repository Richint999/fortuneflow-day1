(function(){
  const E=['Wood','Fire','Earth','Metal','Water'];
  const STEMS=[{zh:'甲',e:'Wood'},{zh:'乙',e:'Wood'},{zh:'丙',e:'Fire'},{zh:'丁',e:'Fire'},{zh:'戊',e:'Earth'},{zh:'己',e:'Earth'},{zh:'庚',e:'Metal'},{zh:'辛',e:'Metal'},{zh:'壬',e:'Water'},{zh:'癸',e:'Water'}];
  const BR=[{zh:'子',e:['Water']},{zh:'丑',e:['Earth','Water','Metal']},{zh:'寅',e:['Wood','Fire','Earth']},{zh:'卯',e:['Wood']},{zh:'辰',e:['Earth','Wood','Water']},{zh:'巳',e:['Fire','Metal','Earth']},{zh:'午',e:['Fire','Earth']},{zh:'未',e:['Earth','Wood','Fire']},{zh:'申',e:['Metal','Water','Earth']},{zh:'酉',e:['Metal']},{zh:'戌',e:['Earth','Fire','Metal']},{zh:'亥',e:['Water','Wood']}];
  const mod=(n,m)=>((n%m)+m)%m;
  function tally(s,b){const c={Wood:0,Fire:0,Earth:0,Metal:0,Water:0};c[STEMS[s].e]++;BR[b].e.forEach(x=>c[x]++);return c}
  function total(arr){const t={Wood:0,Fire:0,Earth:0,Metal:0,Water:0};arr.forEach(c=>E.forEach(k=>t[k]+=c[k]||0));return t}
  function julianDayNumber(y,m,d){const a=Math.floor((14-m)/12);const y2=y+4800-a, m2=m+12*a-3;return d+Math.floor((153*m2+2)/5)+365*y2+Math.floor(y2/4)-Math.floor(y2/100)+Math.floor(y2/400)-32045;}
  function sexagenaryDay(y,m,d){ const j=julianDayNumber(y,m,d); const idx=mod(j+49,60); return [idx%10, idx%12]; }
  function lichunAdjustedYear(dateUTC){const y=dateUTC.getUTCFullYear(),m=dateUTC.getUTCMonth(),d=dateUTC.getUTCDate();if(m<1)return y-1;if(m===1&&d<4)return y-1;return y;}
  function sexagenaryYear(y){return [mod((y-4),10), mod((y-4),12)];}
  function monthPillar(yStem,dateUTC){const m=dateUTC.getUTCMonth(),d=dateUTC.getUTCDate();const S={1:4,2:6,3:5,4:6,5:6,6:7,7:8,8:8,9:8,10:7,11:7,12:6};let k=0;
    if(m===1)k=(d>=S[1])?1:12; else if(m===2)k=(d>=S[2])?2:1; else if(m===3)k=(d>=S[3])?3:2; else if(m===4)k=(d>=S[4])?4:3;
    else if(m===5)k=(d>=S[5])?5:4; else if(m===6)k=(d>=S[6])?6:5; else if(m===7)k=(d>=S[7])?7:6; else if(m===8)k=(d>=S[8])?8:7;
    else if(m===9)k=(d>=S[9])?9:8; else if(m===10)k=(d>=S[10])?10:9; else if(m===11)k=(d>=S[11])?11:10; else if(m===0)k=(d>=S[12])?12:11;
    const branchIdx=mod(2+(k-1),12); const start={0:2,5:2,1:4,6:4,2:6,7:6,3:8,8:8,4:0,9:0}[yStem]; const stemIdx=mod(start+(k-1),10); return [stemIdx,branchIdx];}
  function buildPillars(y,m,d,hrOpt){
    const dP=sexagenaryDay(y,m,d); const dt=new Date(Date.UTC(y,m-1,d));
    const yAdj=lichunAdjustedYear(dt); const yP=sexagenaryYear(yAdj); const mP=monthPillar(yP[0],dt);
    let hP=null; if(hrOpt!=='' && hrOpt!=null){const hr=parseInt(hrOpt,10); if(Number.isFinite(hr)){ const hb=Math.floor(((hr%24)+24)%24/2); const hs=[0,2,4,6,8,0,2,4,6,8][dP[0]]; hP=[(hs+hb)%10, hb]; } }
    return { y:yP, m:mP, d:dP, h:hP };
  }
  function countsFromPillars(P){const packs=[{s:P.y[0],b:P.y[1]},{s:P.m[0],b:P.m[1]},{s:P.d[0],b:P.d[1]}]; if(P.h) packs.push({s:P.h[0],b:P.h[1]}); return total(packs.map(x=>tally(x.s,x.b)));}

  function getBirth(){
    const keys=['ff_inputs','ff_birth','birth','ff_user','ff_calc'];
    for(const k of keys){
      try{
        const v=localStorage.getItem(k);
        if(!v) continue;
        const o=typeof v==='string'?JSON.parse(v):v;
        const y=o.y||o.year, m=o.m||o.month, d=o.d||o.day, h=o.h||o.hour||'';
        if(y&&m&&d) return {y:+y,m:+m,d:+d,h:h};
      }catch(e){}
    }
    const el=document.querySelector('[data-birth-year][data-birth-month][data-birth-day]');
    if(el){
      return { y:+el.getAttribute('data-birth-year'), m:+el.getAttribute('data-birth-month'), d:+el.getAttribute('data-birth-day'), h:el.getAttribute('data-birth-hour')||'' };
    }
    return null;
  }

  function paid(){
    try{
      const s = JSON.parse(localStorage.getItem('ff_subs')||'[]');
      if(Array.isArray(s) && s.length>0) return true;
    }catch(e){}
    return !!localStorage.getItem('ff_last_plan');
  }

  const colorAdvice = {
    Wood:  {colors:'green / teal', why:'Wood boosts growth and flexibility.'},
    Fire:  {colors:'red / orange',  why:'Fire enhances vitality and visibility.'},
    Earth: {colors:'yellow / beige / brown', why:'Earth stabilizes and centers you.'},
    Metal: {colors:'white / silver / gold',  why:'Metal sharpens focus and order.'},
    Water: {colors:'black / navy / blue',    why:'Water supports wisdom and flow.'},
  };

  function mk(n, html){ const d=document.createElement(n); d.innerHTML=html; return d; }
  function sectionCard(title, html, locked){
    const cls = 'border:1px solid #203052;border-radius:16px;padding:14px;background:#0f1a32;margin:12px 0';
    const lock = locked ? '<div style="font-size:13px;opacity:.85;margin-top:8px"><a class="button" href="pricing.html" style="text-decoration:none">Subscribe to read more</a></div>' : '';
    return mk('div', `<div class="card" style="${cls}">
      <h3 style="margin:0 0 6px 0">${title}</h3>
      <div>${html}</div>
      ${lock}
    </div>`);
  }
  function bullet(items){ return '<ul style="margin:6px 0 0 18px">'+items.map(x=>`<li>${x}</li>`).join('')+'</ul>'; }

  function buildAdvice(counts, dayStemIndex){
    const entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]);
    const most = entries[0][0], least = entries[entries.length-1][0];
    const healthMap = {
      Wood:  ['Liver & tendons; keep regular sleep.','Light stretching; green vegetables.'],
      Fire:  ['Heart & circulation; manage stress.','Hydration and moderate cardio.'],
      Earth: ['Spleen & digestion; avoid late snacks.','Balanced carbs; mindful eating.'],
      Metal: ['Lungs & skin; clean air & routine.','Breathwork; keep environment tidy.'],
      Water: ['Kidneys & lower back; keep warm.','Steady sleep; avoid overwork at night.'],
    };
    const wealthHints = {
      Wood:  ['Leverage growth sectors (education, agriculture, design).','Invest steadily; avoid over-expansion.'],
      Fire:  ['Exposure-driven gains (media, branding, sales).','Beware impulsive trades; set stop-loss.'],
      Earth: ['Real assets & operations excel (real estate, supply chain).','Budget discipline compounds safely.'],
      Metal: ['Financial, legal, analytics shine; value precision.','Diversify; don’t over-optimize fees.'],
      Water: ['Logistics, trade, data flow are favorable.','Keep liquidity buffer; avoid rigidity.'],
    };
    const careerBySupport = {
      Wood:  ['Creative/education/product roles that grow systems.','Teamwork & mentorship raise ceiling.'],
      Fire:  ['Marketing/public speaking/ops where visibility matters.','Use momentum; ship iteratively.'],
      Earth: ['PM/operations/HR—stability and trust are edge.','Take ownership; build reliable routines.'],
      Metal: ['Finance/legal/QA where exactness wins.','Document decisions; version your work.'],
      Water: ['Data/engineering/logistics—information flows.','Automate repetitive tasks.'],
    };
    const marriage = [
      `Best complements: someone strong in <b>${least}</b> to balance you.`,
      `Watch out: prolonged excess of <b>${most}</b> may cause friction—schedule cool‑down time.`
    ];
    const colorAdviceLine = (function(){ const c={Wood:'green / teal',Fire:'red / orange',Earth:'yellow / beige / brown',Metal:'white / silver / gold',Water:'black / navy / blue'}; return `Lucky colors: <b>${c[least]}</b>.`; })();
    const stemElem = STEMS[dayStemIndex||0].e;
    return {
      most, least,
      health: {summary: bullet([healthMap[least]?.[0] || 'Protect your weaker organ systems.']), full: bullet(healthMap[least]||[]) },
      wealth: {summary: bullet([wealthHints[most]?.[0] || 'Build in your strongest element’s domains.']), full: bullet(wealthHints[most]||[]) },
      career: {summary: bullet([careerBySupport[most]?.[0] || 'Choose roles that amplify your natural element.']), full: bullet(careerBySupport[most]||[]) },
      marriage:{summary: bullet([marriage[0]]), full: bullet(marriage) },
      header: `Profile: strongest <b>${most}</b>, weakest <b>${least}</b>. ${colorAdviceLine} Day Stem: <b>${stemElem}</b>.`
    };
  }

  function render(profile){
    const isPaid = paid();
    const adv = buildAdvice(profile.counts, profile.dayStem);
    const mountTitle = document.querySelector('h1, h2');
    const mountAt = mountTitle ? mountTitle.parentNode : document.body;

    const sum = document.createElement('div');
    sum.className='card';
    sum.style.cssText='border:1px solid #203052;border-radius:16px;padding:14px;background:#0e1830;margin:12px 0';
    sum.innerHTML = `<div>${adv.header}</div>`;
    mountAt.insertBefore(sum, mountTitle ? mountTitle.nextSibling : mountAt.firstChild);

    const wrap = document.createElement('div');
    wrap.appendChild(sectionCard('Health',  isPaid ? adv.health.full  : adv.health.summary,  !isPaid));
    wrap.appendChild(sectionCard('Wealth',  isPaid ? adv.wealth.full  : adv.wealth.summary,  !isPaid));
    wrap.appendChild(sectionCard('Career',  isPaid ? adv.career.full  : adv.career.summary,  !isPaid));
    wrap.appendChild(sectionCard('Marriage',isPaid ? adv.marriage.full: adv.marriage.summary,!isPaid));
    mountAt.insertBefore(wrap, sum.nextSibling);
  }

  function init(){
    const b = getBirth();
    if(!b) return;
    const P = buildPillars(b.y,b.m,b.d,b.h);
    const counts = countsFromPillars(P);
    render({counts, dayStem:P.d[0]});
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); }
  else{ init(); }
})();