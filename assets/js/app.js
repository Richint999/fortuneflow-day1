(function(){
  'use strict';

  const ELEMENT_KEYS = ['Wood','Fire','Earth','Metal','Water'];
  const LUCKY_MAP = {
    Wood:['green','cyan'], Fire:['red','orange'], Earth:['yellow','brown'],
    Metal:['white','silver','gold'], Water:['black','blue','navy']
  };
  const $ = (sel, root=document) => root.querySelector(sel);

  // ---- Country select (with fallback) ----
  function populateCountrySelect(){
    try{
      const sel = $('#ff-country'); if(!sel) return;
      sel.innerHTML = "";
      // placeholder
      const ph = document.createElement('option');
      ph.value = ""; ph.textContent = "Select country"; ph.disabled = true; ph.selected = true;
      sel.appendChild(ph);

      // data source
      const _C = (window.COUNTRIES || (typeof COUNTRIES!=='undefined' ? COUNTRIES : []));
      const fallback = [
        { value:'US', label:'United States (auto DST)' },
        { value:'CN', label:'China (UTC+8)' },
        { value:'IN', label:'India (UTC+5:30)' }
      ];
      const list = Array.isArray(_C) && _C.length ? _C : fallback;

      list.forEach((c,i)=>{
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = c.label || c.value || ('Country '+(i+1));
        sel.appendChild(opt);
      });

      const af = document.getElementById('ff-autofill');
      if (af) af.disabled = !(Array.isArray(_C) && _C.length);
    }catch(e){ console.warn(e); }
  }

  // ---- Offset inference ----
  function inferOffsetFromCountryAndDate(){
    try{
      const sel = $('#ff-country'); const dateStr = $('#ff-date').value;
      if(!sel || !dateStr) return;
      const idx = sel.selectedIndex - 1; // minus placeholder
      if(idx < 0){ $('#ff-offset').value = '0'; return; }

      if (window.__FF_GEO__ && typeof window.__FF_GEO__.inferOffsetFromCountryAndDate === 'function'){
        const off = window.__FF_GEO__.inferOffsetFromCountryAndDate(idx, dateStr);
        $('#ff-offset').value = String((off!=null ? off : 0));
      } else {
        // basic fallback
        const label = sel.options[sel.selectedIndex].textContent || '';
        if (/China/i.test(label)) $('#ff-offset').value = '480';
        else if (/India/i.test(label)) $('#ff-offset').value = '330';
        else $('#ff-offset').value = '0';
      }
    }catch(e){ console.warn('offset fallback', e); $('#ff-offset').value = '0'; }
  }

  // ---- Rendering helpers ----
  function luckyBy(e){ return (LUCKY_MAP[e]||[]); }

  function renderFive(counts){
    const bars = $('#five-bars'); if (bars) { bars.innerHTML = ''; }
    const keys = ELEMENT_KEYS;
    if (bars){
      keys.forEach(k=>{
        const v = counts[k]||0;
        const row = document.createElement('div'); row.className='bar';
        const px = Math.max(4, v*20) + 'px';
        row.style.width = px; row.style.setProperty('--bar-width', px);
        const label = document.createElement('span'); label.textContent = k+' '+v;
        row.appendChild(label); bars.appendChild(row);
      });
    }
    const host = $('#five-table-host');
    if (host){
      const table = document.createElement('table');
      const thead = document.createElement('thead'); const trh = document.createElement('tr');
      keys.forEach(k=>{ const th=document.createElement('th'); th.textContent = k; trh.appendChild(th); });
      thead.appendChild(trh);
      const tb = document.createElement('tbody'); const tr = document.createElement('tr');
      keys.forEach(k=>{ const td=document.createElement('td'); td.textContent = String(counts[k]||0); tr.appendChild(td); });
      tb.appendChild(tr); table.appendChild(thead); table.appendChild(tb);
      host.innerHTML = ''; host.appendChild(table);
    }
  }

  function mostLeast(counts){
    const ks = ELEMENT_KEYS; let most=ks[0], least=ks[0];
    ks.forEach(k=>{ if(counts[k]>counts[most]) most=k; if(counts[k]<counts[least]) least=k; });
    return {most, least};
  }

  // ---- Main calculate ----
  function onCalculate(){
    const name = ($('#ff-name').value||'').trim();
    const dateStr = $('#ff-date').value;
    const timeStr = $('#ff-time').value || '12:00';
    const offsetMin = parseInt($('#ff-offset').value||'0', 10);
    const lonVal = $('#ff-lon').value; const lon = lonVal? parseFloat(lonVal): undefined;
    const tst = $('#ff-tst').checked;

    try{
      if(!name) throw new Error('Please enter full name');
      if(!dateStr) throw new Error('Please enter birth date');

      // TST flags BEFORE pillars calc
      if (typeof lon === 'number' && !isNaN(lon)) { window.__tst_lon = lon; }
      window.__tst_enabled = !!tst;

      // Four pillars
      const pillars = autoFourPillarsFromInput(dateStr, timeStr, offsetMin);
      const counts = elementsFromPillars([pillars.year, pillars.month, pillars.day, pillars.hour]);
      const {most, least} = mostLeast(counts);

      // Render
      $('#pillars-text').textContent =
        `Year ${pillars.meta.stemsZh[pillars.year.stemIdx]}${pillars.meta.branchesZh[pillars.year.branchIdx]}  ` +
        `Month ${pillars.meta.stemsZh[pillars.month.stemIdx]}${pillars.meta.branchesZh[pillars.month.branchIdx]}  ` +
        `Day ${pillars.meta.stemsZh[pillars.day.stemIdx]}${pillars.meta.branchesZh[pillars.day.branchIdx]}  ` +
        `Hour ${pillars.meta.stemsZh[pillars.hour.stemIdx]}${pillars.meta.branchesZh[pillars.hour.branchIdx]}`;
      renderFive(counts);
      $('#most-el').textContent = most;
      $('#least-el').textContent = least;
      $('#lucky-colors').textContent = luckyBy(most).join(', ');

      // Numerology (uses dateStr + name)
      const N = window.__FF_NUM__;
      $('#num-life').textContent = N.lifePathFromDateStr(dateStr);
      $('#num-expr').textContent = N.expressionNumber(name);
      $('#num-soul').textContent = N.soulUrgeNumber(name);
      $('#num-pers').textContent = N.personalityNumber(name);
      $('#num-pyear').textContent = N.personalYear(dateStr, new Date());

      const live = $('#result-live'); if(live){ live.textContent = `Most ${most}, Life Path ${N.lifePathFromDateStr(dateStr)}`; }
      const err = $('#error-banner'); if(err){ err.style.display='none'; }
    }catch(e){
      const err = $('#error-banner');
      if(err){
        err.textContent = '⚠️ ' + (e.message || 'Unknown error');
        err.style.display = 'block';
        err.scrollIntoView({behavior:'smooth', block:'center'});
      }
      console.error(e);
    }
  }

  // ---- Init ----
  function init(){
    populateCountrySelect();
    const sel = $('#ff-country'); if(sel){ sel.addEventListener('change', inferOffsetFromCountryAndDate); }
    const dt = $('#ff-date'); if(dt){ dt.addEventListener('change', inferOffsetFromCountryAndDate); }
    const af = $('#ff-autofill'); if(af){ af.addEventListener('click', e=>{e.preventDefault(); inferOffsetFromCountryAndDate();}); }
    const cb = $('#calc-btn'); if(cb){ cb.addEventListener('click', e=>{e.preventDefault(); onCalculate();}); }
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
