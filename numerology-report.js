(function(){
  function paid(){ try{ const s=JSON.parse(localStorage.getItem('ff_subs')||'[]'); if(Array.isArray(s)&&s.length>0) return true; }catch(e){} return !!localStorage.getItem('ff_last_plan'); }
  const lifeDesc={1:'Leadership, independence, pioneering new paths.',2:'Cooperation, diplomacy, sensitivity.',3:'Creativity, expression, optimism.',4:'Stability, discipline, building foundations.',5:'Freedom, change, exploration.',6:'Responsibility, care, community.',7:'Analysis, introspection, wisdom.',8:'Ambition, power, material success.',9:'Compassion, service, humanitarian vision.',11:'Vision, intuition, inspirational teacher.',22:'Master builder, turning vision into reality.',33:'Compassionate master, healing through service.'};
  const exprDesc={1:'Direct and driven; you lead by doing.',2:'Tactful and supportive; you harmonize groups.',3:'Expressive and charming; words and arts are your tools.',4:'Reliable and methodical; you make plans real.',5:'Versatile and bold; you thrive on change.',6:'Responsible and nurturing; people rely on you.',7:'Thoughtful and deep; you seek truth beneath the surface.',8:'Authoritative and strategic; you move resources wisely.',9:'Idealistic and broad‑minded; you uplift others.',11:'Magnetic and visionary; you inspire through insight.',22:'Architect of scale; systems, operations, and impact.',33:'High compassion; you elevate communities through care.'};
  const soulDesc={1:'To lead and initiate.',2:'To connect and bring peace.',3:'To create and be seen.',4:'To secure and build.',5:'To explore and stay free.',6:'To serve and protect loved ones.',7:'To understand life’s patterns.',8:'To achieve and empower.',9:'To help and heal at scale.',11:'To awaken intuition and inspire.',22:'To realize big visions for the world.',33:'To heal through unconditional service.'};
  function mount(){ const h=document.querySelector('h1, h2'); const parent=h?h.parentNode:document.body; const box=document.createElement('div'); box.id='num-report-host'; box.className='card'; box.style.cssText='border:1px solid #203052;border-radius:16px;padding:14px;background:#0f1a32;margin:16px 0'; if(h){ h.after(box);} else { parent.insertBefore(box, parent.firstChild); } return box; }
  function render(){
    const host=mount();
    let summary={}; try{ summary=JSON.parse(localStorage.getItem('ff_num_summary')||'{}'); }catch(e){}
    const isPaid=paid();
    const items=[
      {label:'Life Path', val:summary.life, text: lifeDesc[summary.life]},
      {label:'Expression (Destiny)', val:summary.expression, text: exprDesc[summary.expression]},
      {label:'Soul Urge', val:summary.soul, text: soulDesc[summary.soul]}
    ];
    let html='<div style="display:flex;justify-content:space-between;align-items:center"><h3 style="margin:0">Numerology</h3><div class="small" style="opacity:.85">Derived from your date of birth & full name</div></div>';
    html+='<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:8px">';
    items.forEach(function(it){
      html+=`<div style="border:1px solid #203052;border-radius:12px;padding:10px;background:#0e1830">
        <div class="small" style="opacity:.8">${it.label}</div>
        <div style="font-size:22px;font-weight:800;margin-top:4px">${it.val??'—'}</div>
        ${ isPaid && it.val ? `<div style="margin-top:6px">${it.text||''}</div>` : ''}
      </div>`;
    });
    html+='</div>';
    if(!isPaid){
      html+='<div style="margin-top:10px"><a class="button" href="pricing.html" style="text-decoration:none">Subscribe to read the meanings</a></div>';
    }
    host.innerHTML=html;
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', render);} else { render(); }
})();