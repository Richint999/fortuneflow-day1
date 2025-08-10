(function(){
  const P_MAP={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8};
  const VOWELS=new Set(['A','E','I','O','U']);
  function sumDigits(n){ return String(n).split('').reduce((a,b)=>a+(+b||0),0); }
  function reduceKeepMaster(n){ while(n>9 && n!==11 && n!==22 && n!==33){ n=sumDigits(n);} return n; }
  function numberFromDate(y,m,d){ const raw=String(y).split('').concat(String(m).split(''),String(d).split('')).reduce((a,b)=>a+(+b||0),0); return reduceKeepMaster(raw); }
  function nameToNums(full){
    const letters=(full||'').toUpperCase().replace(/[^A-Z]/g,'');
    let all=0,v=0,c=0;
    for(const ch of letters){ const n=P_MAP[ch]||0; all+=n; if(VOWELS.has(ch)) v+=n; else c+=n; }
    return { expression:reduceKeepMaster(all), soul:reduceKeepMaster(v), personality:reduceKeepMaster(c), letters };
  }
  function getBirth(){
    const yI=document.querySelector('input[name="y"], #y'), mI=document.querySelector('input[name="m"], #m'), dI=document.querySelector('input[name="d"], #d');
    if(yI && mI && dI && yI.value && mI.value && dI.value){ return {y:+yI.value, m:+mI.value, d:+dI.value}; }
    const keys=['ff_inputs','ff_birth','birth','ff_user','ff_calc'];
    for(const k of keys){ try{ const v=localStorage.getItem(k); if(!v) continue; const o=JSON.parse(v); if(o.y&&o.m&&o.d) return {y:+o.y, m:+o.m, d:+o.d}; }catch(e){} }
    return null;
  }
  function getName(){ return (localStorage.getItem('ff_name')||'').trim(); }
  function setName(v){ localStorage.setItem('ff_name', v); }
  function mount(){
    const h=document.querySelector('h1, h2'); const parent=h?h.parentNode:document.body;
    const box=document.createElement('div'); box.id='num-home-host';
    box.style.cssText='border:1px solid #203052;border-radius:16px;padding:12px;background:#0f1a32;margin:12px 0';
    const title=document.createElement('div'); title.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:6px';
    title.innerHTML='<div style="font-weight:700">Numerology — Quick Numbers</div><div class="small" style="opacity:.8">Life Path · Expression (Destiny) · Soul Urge</div>';
    box.appendChild(title);
    const nameRow=document.createElement('div'); nameRow.style.cssText='display:flex;gap:8px;align-items:center;margin-bottom:6px';
    nameRow.innerHTML='<input id="ff_fullname" type="text" placeholder="Full name for numerology" style="flex:1;padding:8px;border-radius:10px;border:1px solid #203052;background:#0b1020;color:#e6eefc" />'+
                      '<button id="ff_set_name" class="button" type="button" style="padding:8px 12px">Apply</button>';
    box.appendChild(nameRow);
    const grid=document.createElement('div'); grid.id='num-home-grid';
    grid.style.cssText='display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px';
    box.appendChild(grid);
    if(h) h.after(box); else parent.insertBefore(box, parent.firstChild);
    return {grid, nameInput: nameRow.querySelector('#ff_fullname'), applyBtn: nameRow.querySelector('#ff_set_name')};
  }
  function renderNumbers(grid, nums){
    grid.innerHTML='';
    function cell(label, value){
      const d=document.createElement('div');
      d.style.cssText='border:1px solid #203052;border-radius:12px;padding:10px;background:#0e1830;text-align:center';
      d.innerHTML='<div class="small" style="opacity:.8">'+label+'</div><div style="font-size:22px;font-weight:800;margin-top:4px">'+(value??'—')+'</div>';
      return d;
    }
    grid.appendChild(cell('Life Path', (nums.life!=null?nums.life:'—')));
    grid.appendChild(cell('Expression (Destiny)', (nums.expression!=null?nums.expression:'—')));
    grid.appendChild(cell('Soul Urge', (nums.soul!=null?nums.soul:'—')));
  }
  function compute(){
    const birth=getBirth(); const full=getName();
    const out={};
    if(birth){ out.life=numberFromDate(birth.y,birth.m,birth.d); }
    if(full){
      const r=nameToNums(full);
      out.expression=r.expression; out.soul=r.soul; out.personality=r.personality;
    }
    try{ localStorage.setItem('ff_num_summary', JSON.stringify(out)); }catch(e){}
    return out;
  }
  function init(){
    const {grid, nameInput, applyBtn}=mount();
    nameInput.value=getName();
    function refresh(){ const nums=compute(); renderNumbers(grid, nums); }
    applyBtn.addEventListener('click', ()=>{ setName(nameInput.value.trim()); refresh(); });
    refresh();
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init);} else { init(); }
})();