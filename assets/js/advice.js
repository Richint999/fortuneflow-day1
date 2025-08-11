
// FortuneFlow Advice -> renders into #actions (replaces Action Tips) based on Five Elements
(function(){
  const GEN = { Wood:"Fire", Fire:"Earth", Earth:"Metal", Metal:"Water", Water:"Wood" };   // Generating cycle
  const KE  = { Wood:"Earth", Earth:"Water", Water:"Fire", Fire:"Metal", Metal:"Wood" };   // Controlling cycle
  const ORDER = ["Wood","Fire","Earth","Metal","Water"];

  const ORGANS = {
    Wood:  {en:"Liver & Gallbladder", tips:[
      "Keep a consistent sleep schedule (ideally sleep before 11pm).",
      "Daily mobility: neck/shoulder and hip flexor stretches to release tension.",
      "Favor dark-green vegetables and a bit of sour taste (lemon, hawthorn). Go easy on deep-fried food and hard liquor."
    ]},
    Fire:  {en:"Heart & Small Intestine", tips:[
      "Limit late-night caffeine and sugar to reduce cardiac load.",
      "10–20 minutes of daily cardio (walk, cycle, swim) + simple breath training.",
      "When emotions surge, pause first—cool down, then communicate."
    ]},
    Earth: {en:"Spleen & Stomach", tips:[
      "Prefer warm foods, less raw/cold. Regular meals; avoid heavy dinners.",
      "Core and leg strength 2–3×/week to stabilize posture and digestion.",
      "Cut refined sugar/snacking; watch for post‑meal sleepiness as a signal."
    ]},
    Metal: {en:"Lungs & Large Intestine", tips:[
      "Morning outdoor walk with deep breathing to improve lung qi.",
      "Hydrate well and eat fiber (fruits/veggies/whole grains) for gut motility.",
      "Moisturize skin/nasal passages; add protection during season changes."
    ]},
    Water: {en:"Kidneys & Bladder", tips:[
      "Target 7.5–9 hours of sleep; lights out before 11pm if possible.",
      "Adequate water and sensible salt; avoid long sitting—move hips/low back.",
      "Work–rest cycles: take a short break every 60–90 minutes."
    ]}
  };

  const LOVE = {
    Wood: {traits:["growth‑minded","proactive","planner"],
           dos:["Set long‑term goals and milestones together","Give space for growth; reduce pushing"],
           donts:["Avoid impatience or criticism","Avoid unilateral planning"]},
    Fire: {traits:["passionate","expressive","adventurous"],
           dos:["Plan fun, novel dates","Listen first; add a 'cool‑down' before responding"],
           donts:["Avoid impulsive words that hurt","Avoid turning debates into win/lose"]},
    Earth:{traits:["steady","caring","stable"],
           dos:["Show care with actions (pickups, cooking)","Leave room for spontaneity; take short trips"],
           donts:["Avoid over‑control or possessiveness","Avoid being so 'safe' that romance disappears"]},
    Metal:{traits:["standards","order","rational"],
           dos:["Clarify boundaries and expectations","Create a ritualized 'us time'"],
           donts:["Avoid nit‑picking/scorekeeping","Avoid legalistic, contract‑like talk"]},
    Water:{traits:["sensitive","insightful","accepting"],
           dos:["Schedule high‑quality deep‑talk time","Use small notes/cards to show care"],
           donts:["Avoid conflict avoidance","Avoid over‑sacrifice without stating needs"]}
  };

  const CAREER_STYLE = {
    Wood:["Great for strategy/product/education; oriented to growth and learning curves",
          "Break big goals into quarterly sprints; avoid too many parallel projects"],
    Fire:["Great for sales/marketing/PR/leadership; needs stage and speed",
          "Add decision 'cool‑off' and a review cadence to prevent impulsivity"],
    Earth:["Great for ops/project mgmt/finance/supply chain; steady progress",
           "Use weekly/monthly checklists; keep improving processes"],
    Metal:["Great for legal/audit/engineering/quality; values standards and precision",
           "Reserve time for innovation/experiments; avoid rigidity"],
    Water:["Great for research/data/design/consulting; cross‑disciplinary and integrative",
           "Do regular prioritization to prevent scattering and procrastination"]
  };

  const WEALTH = {
    Wood: {profile:"Growth‑oriented", tips:[
      "Keep quality growth names and education/tech themes in the mix",
      "Rebalance annually; avoid endless 'adding to expansion'",
      "Study fundamentals: cash flow, moats, compounding"
    ]},
    Fire: {profile:"Aggressive / momentum", tips:[
      "Define max position size and stop‑loss in writing",
      "Diversify across assets; avoid all‑in bets",
      "Review after each trade; no emotion‑driven adds"
    ]},
    Earth:{profile:"Steady / cash‑flow", tips:[
      "Fund emergency savings first; favor reliable cash‑flow assets",
      "Automate DCA to ride volatility for the long term",
      "Audit insurance and liabilities annually to cut costs"
    ]},
    Metal:{profile:"Rules‑based / quant", tips:[
      "Drive investing with a rules table (rebalance, valuation thresholds)",
      "Avoid over‑fitting to history; favor robustness",
      "Keep an investment log; check discipline execution regularly"
    ]},
    Water:{profile:"Flexible / hedged", tips:[
      "Good at cross‑market, multi‑strategy—curate information carefully",
      "Set an 'information diet' to reduce churn",
      "Build a budget and cash‑flow sheet to prevent drift"
    ]}
  };

  function topKey(counts){ return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0]; }
  function lowKey(counts){ return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(-1)[0][0]; }

  function renderIntoActions(counts){
    const host = document.getElementById('actions');
    if(!host) return;
    const most = topKey(counts), least = lowKey(counts);
    const weakenBy = KE[most], drainTo = GEN[most];
    const healthHeader = `Focus system: ${most} (${ORGANS[most].en}); balance with ${weakenBy} (brake) and ${drainTo} (vent)`;

    function liWithSub(title, arr){
      const li = document.createElement('li');
      const b = document.createElement('b'); b.textContent = title; li.appendChild(b);
      const sub = document.createElement('ul'); sub.className = 'bullets';
      arr.forEach(t=>{ const x=document.createElement('li'); x.textContent=t; sub.appendChild(x); });
      li.appendChild(sub); return li;
    }

    host.innerHTML='';
    // Health
    host.appendChild(liWithSub("Health", [healthHeader].concat(ORGANS[most].tips)));
    // Love
    const L = LOVE[most];
    const loveArr = [
      `Your dominant vibe: ${most} (${L.traits.join(" / ")})`,
      `What to complement: ${least}`
    ].concat(L.dos.map(x=>"✔ "+x)).concat(L.donts.map(x=>"✘ "+x));
    host.appendChild(liWithSub("Love", loveArr));
    // Career
    const careerArr = [
      `Work style: led by ${most}; watch the ${least} dimension`
    ].concat(CAREER_STYLE[most]||[]);
    host.appendChild(liWithSub("Career", careerArr));
    // Wealth
    const w = WEALTH[most];
    const wealthArr = [
      `Money profile: ${w.profile} (lead: ${most}; add: ${least})`
    ].concat(w.tips||[]);
    host.appendChild(liWithSub("Wealth", wealthArr));
  }

  function run(){
    try{
      const data = JSON.parse(localStorage.getItem('ff_result_en')||'null');
      if(!data || !data.counts) return;
      renderIntoActions(data.counts);
    }catch(e){ console.error("Advice render error:", e); }
  }

  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(run, 80);
  });
})();
