
// Pro-only Personalized Guidance: replace Action Tips after unlock
(function(){
  const GEN = { Wood:"Fire", Fire:"Earth", Earth:"Metal", Metal:"Water", Water:"Wood" }; // generating
  const KE  = { Wood:"Earth", Earth:"Water", Water:"Fire", Fire:"Metal", Metal:"Wood" }; // controlling

  const ORGANS = {
    Wood:{en:"Liver & Gallbladder", tips:[
      "Keep a consistent sleep schedule (ideally before 11pm).",
      "Daily neck/shoulder & hip-flexor mobility.",
      "Favor dark-green vegetables; a little sour; go easy on deep-fried & hard liquor."
    ]},
    Fire:{en:"Heart & Small Intestine", tips:[
      "Limit late-night caffeine/sugar.",
      "10–20 minutes of daily cardio + breath training.",
      "When emotions surge: pause → cool-down → communicate."
    ]},
    Earth:{en:"Spleen & Stomach", tips:[
      "Prefer warm foods, less raw/cold; regular meals; light dinners.",
      "Core & leg strength 2–3×/week.",
      "Cut refined sugar/snacks; watch post-meal sleepiness."
    ]},
    Metal:{en:"Lungs & Large Intestine", tips:[
      "Morning outdoor walk with deep breathing.",
      "Hydrate + fiber for gut motility.",
      "Moisturize skin/nasal passages; extra protection in season changes."
    ]},
    Water:{en:"Kidneys & Bladder", tips:[
      "Sleep 7.5–9h; lights out before 11pm if possible.",
      "Adequate water; avoid long sitting—move hips/low back.",
      "Work–rest cycles: short break every 60–90 minutes."
    ]}
  };

  const LOVE = {
    Wood:{traits:["growth-minded","proactive","planner"], dos:["Set long-term goals together","Give space for growth"], donts:["Avoid impatience/criticism","Avoid unilateral planning"]},
    Fire:{traits:["passionate","expressive","adventurous"], dos:["Plan fun, novel dates","Listen first; add a cool-down"], donts:["Avoid impulsive words","Avoid win/lose fights"]},
    Earth:{traits:["steady","caring","stable"],           dos:["Show care with actions","Leave room for spontaneity/trips"], donts:["Avoid over-control/possessiveness","Don’t be so ‘safe’ that romance dies"]},
    Metal:{traits:["standards","order","rational"],       dos:["Clarify boundaries/expectations","Create ritualized ‘us time’"], donts:["Avoid nit-picking/scorekeeping","Avoid legalistic talk"]},
    Water:{traits:["sensitive","insightful","accepting"], dos:["Schedule deep-talk time","Use small notes/cards"], donts:["Don’t avoid conflict","Don’t over-sacrifice without stating needs"]}
  };

  const CAREER = {
    Wood:["Great for strategy/product/education; growth focus","Quarterly sprints; avoid too many parallel tracks"],
    Fire:["Great for sales/marketing/PR/leadership; speed","Add cool-off & review cadence to curb impulsivity"],
    Earth:["Great for ops/PM/finance/supply chain; steady","Weekly/monthly checklists; process improvement"],
    Metal:["Great for legal/audit/engineering/quality; precision","Reserve time for innovation; avoid rigidity"],
    Water:["Great for research/data/design/consulting; integrative","Regular prioritization to prevent scattering"]
  };

  const WEALTH = {
    Wood:{profile:"Growth-oriented", tips:["Keep quality growth/education/tech in mix","Annual rebalance; avoid endless expansion","Study fundamentals: cash flow, moats, compounding"]},
    Fire:{profile:"Aggressive / momentum", tips:["Define max position size & stop-loss in writing","Diversify; avoid all-in","Review after trades; no emotion-driven adds"]},
    Earth:{profile:"Steady / cash-flow", tips:["Fund emergency savings first","Automate DCA for the long term","Audit insurance/liabilities yearly"]},
    Metal:{profile:"Rules-based / quant", tips:["Invest by rules table (rebalance/valuation)","Avoid over-fitting; favor robustness","Keep an investment log; check discipline"]},
    Water:{profile:"Flexible / hedged", tips:["Curate information across markets/strategies","Set an information diet","Build a budget & cash-flow sheet"]}
  };

  const topKey = c => Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0];
  const lowKey = c => Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(-1)[0][0];

  function liGroup(title, items){
    const li = document.createElement('li');
    const b = document.createElement('b'); b.textContent = title;
    li.appendChild(b);
    const sub = document.createElement('ul'); sub.className = 'bullets';
    items.forEach(t=>{ const x=document.createElement('li'); x.textContent=t; sub.appendChild(x); });
    li.appendChild(sub);
    return li;
  }

  function renderAdviceIntoActions(counts){
    const host = document.getElementById('actions');
    if(!host) return;
    const most = topKey(counts), least = lowKey(counts);
    const healthHdr = `Focus system: ${most} (${ORGANS[most].en}); balance with ${KE[most]} (brake) and ${GEN[most]} (vent)`;
    const L = LOVE[most]; const W = WEALTH[most];

    // Replace Action Tips heading text
    const h3 = host.closest('.subsec')?.querySelector('h3');
    if(h3) h3.textContent = 'Personalized Guidance';

    host.innerHTML = '';
    host.appendChild(liGroup('Health', [healthHdr, ...ORGANS[most].tips]));
    host.appendChild(liGroup('Love', [
      `Your dominant vibe: ${most} (${L.traits.join(' / ')})`,
      `What to complement: ${least}`,
      ...L.dos.map(x=>'✔ '+x),
      ...L.donts.map(x=>'✘ '+x)
    ]));
    host.appendChild(liGroup('Career', [
      `Work style: led by ${most}; watch the ${least} dimension`,
      ...(CAREER[most]||[])
    ]));
    host.appendChild(liGroup('Wealth', [
      `Money profile: ${W.profile} (lead: ${most}; add: ${least})`,
      ...(W.tips||[])
    ]));
  }

  function getCounts(){
    try{
      const d = JSON.parse(localStorage.getItem('ff_result_en') || 'null');
      return d && d.counts ? d.counts : null;
    }catch(e){ return null; }
  }

  function isProUnlocked(){
    const pro = document.getElementById('pro-sections');
    if(!pro) return false;
    if(!pro.classList.contains('lock')) return true;          // main signal
    if(document.body.classList.contains('pro')) return true;  // optional body flag
    if(localStorage.getItem('ff_pro') === '1') return true;   // optional localStorage flag
    if(/(?:^|;)\s*ff_pro=1\b/.test(document.cookie||'')) return true; // optional cookie
    return false;
  }

  function tryRender(){
    if(!isProUnlocked()) return;
    const counts = getCounts();
    if(!counts) return;
    if(document.getElementById('actions')?.dataset?.advDone === '1') return;
    renderAdviceIntoActions(counts);
    const host = document.getElementById('actions'); if(host) host.dataset.advDone = '1';
  }

  // Try once after DOM ready (wait a bit for base scripts to build sections)
  document.addEventListener('DOMContentLoaded', ()=> setTimeout(tryRender, 150));

  // Watch for unlock (class change on #pro-sections)
  const pro = document.getElementById('pro-sections');
  if(pro){
    new MutationObserver(()=>tryRender()).observe(pro, {attributes:true, attributeFilter:['class']});
  }
})();
