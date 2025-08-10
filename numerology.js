(function(){
  function paid(){
    try{ const s=JSON.parse(localStorage.getItem('ff_subs')||'[]'); if(Array.isArray(s)&&s.length>0) return true; }catch(e){}
    return !!localStorage.getItem('ff_last_plan');
  }
  function getBirth(){
    const keys=['ff_inputs','ff_birth','birth','ff_user','ff_calc'];
    for(const k of keys){
      try{
        const v=localStorage.getItem(k);
        if(!v) continue;
        const o=typeof v==='string'?JSON.parse(v):v;
        const y=o.y||o.year, m=o.m||o.month, d=o.d||o.day;
        if(y&&m&&d) return {y:+y,m:+m,d:+d};
      }catch(e){}
    }
    const el=document.querySelector('[data-birth-year][data-birth-month][data-birth-day]');
    if(el){ return { y:+el.getAttribute('data-birth-year'), m:+el.getAttribute('data-birth-month'), d:+el.getAttribute('data-birth-day') }; }
    return null;
  }
  function getName(){
    return (localStorage.getItem('ff_name')||'').trim();
  }
  const P_MAP = {A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8};
  const VOWELS = new Set(['A','E','I','O','U']);
  function sumDigits(n){ return String(n).split('').reduce((a,b)=>a+(+b||0),0); }
  function reduceKeepMaster(n){
    while(n>9 && n!==11 && n!==22 && n!==33){ n = sumDigits(n); }
    return n;
  }
  function numberFromDate(y,m,d){
    const raw = String(y).split('').concat(String(m).split(''), String(d).split('')).reduce((a,b)=>a+(+b||0),0);
    return reduceKeepMaster(raw);
  }
  function nameToNumbers(full){
    const letters = (full||'').toUpperCase().replace(/[^A-Z]/g,'');
    let all=0, vowels=0, consonants=0;
    for(const ch of letters){
      const v = P_MAP[ch]||0; all+=v;
      if(VOWELS.has(ch)) vowels+=v; else consonants+=v;
    }
    return {
      expression: reduceKeepMaster(all),
      soul: reduceKeepMaster(vowels),
      personality: reduceKeepMaster(consonants),
      letters
    };
  }
  function mk(tag, html){ const d=document.createElement(tag); d.innerHTML=html; return d; }
  function insertAfter(ref, el){ if(ref && ref.parentNode){ ref.parentNode.insertBefore(el, ref.nextSibling); } }
  function placeCard(){
    const h = document.querySelector('h1, h2');
    const parent = h ? h.parentNode : document.body;
    const host = document.createElement('div');
    host.id = 'numerology-host';
    host.className = 'card';
    host.style.cssText = 'border:1px solid #203052;border-radius:16px;padding:14px;background:#0f1a32;margin:16px 0';
    if(h) insertAfter(h, host); else parent.insertBefore(host, parent.firstChild);
    return host;
  }
  function paidCTA(){ return '<div style="margin-top:8px"><a class="button" href="pricing.html" style="text-decoration:none">Subscribe to see full numerology</a></div>'; }
  const lifeDesc = {1:'Leadership, independence, pioneering new paths.',2:'Cooperation, diplomacy, sensitivity.',3:'Creativity, expression, optimism.',4:'Stability, discipline, building foundations.',5:'Freedom, change, exploration.',6:'Responsibility, care, community.',7:'Analysis, introspection, wisdom.',8:'Ambition, power, material success.',9:'Compassion, service, humanitarian vision.',11:'Vision, intuition, inspirational teacher.',22:'Master builder, turning vision into reality.',33:'Compassionate master, healing through service.'};
  const exprDesc = {1:'Direct and driven; you lead by doing.',2:'Tactful and supportive; you harmonize groups.',3:'Expressive and charming; words and arts are your tools.',4:'Reliable and methodical; you make plans real.',5:'Versatile and bold; you thrive on change.',6:'Responsible and nurturing; people rely on you.',7:'Thoughtful and deep; you seek truth beneath the surface.',8:'Authoritative and strategic; you move resources wisely.',9:'Idealistic and broad‑minded; you uplift others.',11:'Magnetic and visionary; you inspire through insight.',22:'Architect of scale; systems, operations, and impact.',33:'High compassion; you elevate communities through care.'};
  const soulDesc = {1:'To lead and initiate.',2:'To connect and bring peace.',3:'To create and be seen.',4:'To secure and build.',5:'To explore and stay free.',6:'To serve and protect loved ones.',7:'To understand life’s patterns.',8:'To achieve and empower.',9:'To help and heal at scale.',11:'To awaken intuition and inspire.',22:'To realize big visions for the world.',33:'To heal through unconditional service.'};
  const persDesc = {1:'People see you as confident and proactive.',2:'People see you as gentle and considerate.',3:'People see you as lively and expressive.',4:'People see you as solid and dependable.',5:'People see you as adventurous and flexible.',6:'People see you as caring and trustworthy.',7:'People see you as insightful and reserved.',8:'People see you as capable and authoritative.',9:'People see you as compassionate and universal.',11:'An aura of inspiration and sensitivity.',22:'A presence of capability and scale.',33:'A warm presence of devotion and care.'};
  function render(){
    const host = placeCard();
    const birth = getBirth();
    const saved = getName();
    host.innerHTML = '';
    const input = document.createElement('div');
    input.innerHTML = '<label style="display:block;margin-bottom:6px;color:#d2e0ff;font-size:14px">Full Name (for Numerology)</label>' +
      '<div style="display:flex;gap:8px;align-items:center">' +
      '<input id="ff_fullname" type="text" placeholder="Enter your full birth name" style="flex:1;padding:10px;border-radius:10px;border:1px solid #203052;background:#0b1020;color:#e6eefc" />' +
      '<button id="ff_save_name" class="button" type="button">Save</button>' +
      '</div>' +
      '<div class="small" style="opacity:.85;margin-top:6px">Tip: No need to split first/middle/last—just enter your full name. Non‑letters will be ignored.</div>';
    host.appendChild(input);
    document.getElementById('ff_fullname').value = saved;
    input.querySelector('#ff_save_name').addEventListener('click', function(){
      const val = document.getElementById('ff_fullname').value.trim();
      localStorage.setItem('ff_name', val);
      computeAndRender();
    });
    const out = document.createElement('div');
    out.id = 'ff_num_results';
    out.style.marginTop = '12px';
    host.appendChild(out);
    function computeAndRender(){
      const full = getName();
      const isPaid = paid();
      out.innerHTML = '';
      if(!birth){
        out.innerHTML = '<div class="small" style="color:#a7b3c9">Enter your birth date first to calculate Life Path Number.</div>';
        return;
      }
      const life = numberFromDate(birth.y, birth.m, birth.d);
      const freeHtml = '<div class="card" style="border:1px solid #203052;border-radius:12px;padding:12px;background:#0e1830">' +
        '<h3 style="margin:0 0 6px 0">Numerology</h3>' +
        `<div><b>Life Path:</b> ${life} — ${lifeDesc[life]||''}</div>` +
        (!isPaid ? '<div style="margin-top:8px"><a class="button" href="pricing.html" style="text-decoration:none">Subscribe to unlock full numerology</a></div>' : '') +
      '</div>';
      out.insertAdjacentHTML('beforeend', freeHtml);
      if(isPaid){
        if(!full){
          out.insertAdjacentHTML('beforeend','<div class="small" style="color:#f3d28e;margin-top:6px">Enter your full name to compute Expression / Soul Urge / Personality.</div>');
          return;
        }
        const nums = nameToNumbers(full);
        const block = '<div class="card" style="border:1px solid #203052;border-radius:12px;padding:12px;background:#0e1830;margin-top:10px">' +
          '<h4 style="margin:0 0 6px 0">Full Numerology</h4>' +
          `<div><b>Expression (Destiny):</b> ${nums.expression} — ${ (exprDesc[nums.expression]||'') }</div>` +
          `<div><b>Soul Urge (Heart's Desire):</b> ${nums.soul} — ${ (soulDesc[nums.soul]||'') }</div>` +
          `<div><b>Personality:</b> ${nums.personality} — ${ (persDesc[nums.personality]||'') }</div>` +
          `<div class="small" style="opacity:.8;margin-top:6px">Calculated from name letters: <code>${nums.letters}</code></div>` +
        '</div>';
        out.insertAdjacentHTML('beforeend', block);
      }
    }
    computeAndRender();
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', render); } else { render(); }
})();