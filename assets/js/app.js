(function(){
  'use strict';

  console.log('[FF] app.js loaded');

  const ELEMENT_KEYS = ['Wood','Fire','Earth','Metal','Water'];
  const LUCKY_MAP = {
    Wood:['green','cyan'], Fire:['red','orange'], Earth:['yellow','brown'],
    Metal:['white','silver','gold'], Water:['black','blue','navy']
  };
  const $ = (sel, root=document) => root.querySelector(sel);

  // -------- Country select (with fallback) --------
  function populateCountrySelect(){
    try{
      const sel = $('#ff-country'); if(!sel) return;
      sel.innerHTML = '';
      // placeholder
      const ph = document.createElement('option');
      ph.value = ''; ph.textContent = 'Select country'; ph.disabled = true; ph.selected = true;
      sel.appendChild(ph);

      // try window.COUNTRIES or const COUNTRIES; else fallback 3
      const _C = (window.COUNTRIES || (typeof COUNTRIES!=='undefined' ? COUNTRIES : []));
      const fallback = [
        { value:'US', label:'United States (auto DST)' },
        { value:'CN', label:'China (UTC+8)' },
        { value:'IN', label:'India (UTC+5:30)' }
      ];
      const list = Array.isArray(_C) && _C.length ? _C : fallback;

      list.forEach((c,i)=>{
        const opt = document.createElement('option');
        opt.value = c.value || String(i);
        opt.textContent = c.label || c.value || ('Country '+(i+1));
        sel.appendChild(opt);
      });

      const af = document.getElementById('ff-autofill');
      if (af) af.disabled = !(Array.isArray(_C) && _C.length);
    }catch(e){
      console.warn('[FF] populateCountrySelect error', e);
    }
  }

  // -------- Offset inference --------
  function inferOffsetFromCountryAndDate(){
    try{
      const sel = $('#ff-country'); const dateStr = $('#ff-date').value;
      if(!sel || !dateStr) return;

      // if you have geo.js with __FF_GEO__.inferOffsetFromCountryAndDate(idx, dateStr)
      if (window.__FF_GEO__ && typeof window.__FF_GEO__.inferOffsetFromCountryAndDate === 'function'){
        const idx = Math.max(0, sel.selectedIndex - 1); // remove placeholder
        const off = window.__FF_GEO__.inferOffsetFromCountryAndDate(idx, dateStr);
        $('#ff-offset').value = String((off!=null ? off : 0));
        return;
      }

      // basic fallback by label
      const label = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].textContent : '';
      let v = 0;
      if (/China/i.test(label)) v = 480;
      else if (/India/i.test(label)) v = 330;
      $('#ff-offset').value = String(v);
    }catch(e){
      console.warn('[FF] inferOffsetFromCountryAndDate error', e);
      $('#ff-offset').value = '0';
    }
  }

  // -------- Render helpers --------
  function luckyBy(e){ return (LUCKY_MAP[e]||[]); }

  function renderFive(counts){
    const bars = $('#five-bars'); if (bars) bars.innerHTML = '';
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
      const thead=document.createElement('thead'); const trh=document.createElement('tr');
      keys.forEach(k=>{ const th=document.createElement('th'); th.textContent=k; trh.appendChild(th); }); thead.appendChild(trh);
      const tb=document.createElement('tbody'); const tr=document.createElement('tr');
      keys.forEach(k=>{ const td=document.createElement('td'); td.textContent=String(counts[k]||0); tr.appendChild(td); });
      tb.appendChild(tr); table.appendChild(thead); table.appendChild(tb); host.innerHTML=''; host.appendChild(table);
    }
  }

  function mostLeast(counts){
    const ks = ELEMENT_KEYS; let most=ks[0], least=ks[0];
    ks.forEach(k=>{ if(counts[k]>counts[most]) most=k; if(counts[k]<counts[least]) least=k; });
    return {most, least};
  }

  // -------- Main calculate --------
  function onCalculate(){
    const name = ($('#ff-name').value||'').trim();
    const dateStr = $('#ff-date').value;
    const timeStr = $('#ff-time').value || '12:00';

    // ensure utcOffsetMinutes exists
    let utcOffsetMinutes = parseInt($('#ff-offset').value || '0', 10);
    if (isNaN(utcOffsetMinutes)) utcOffsetMinutes = 0;

    const lonVal = $('#ff-lon').value; const lon = lonVal? parseFloat(lonVal): undefined;
    const tst = $('#ff-tst').checked;

    try{
      if(!name) throw new Error('Please enter full name');
      if(!dateStr) throw new Error('Please enter birth date');

      if (typeof window.autoFourPillarsFromInput !== 'function') {
        throw new Error('BaZi core not loaded (autoFourPillarsFromInput missing)');
      }
      if (typeof window.elementsFromPillars !== 'function') {
        throw new Error('BaZi core not loaded (elementsFromPillars missing)');
      }

      // set TST flags BEFORE pillar calc
      if (typeof lon === 'number' && !isNaN(lon)) { window.__tst_lon = lon; }
      window.__tst_enabled = !!tst;

      // four pillars
      const pillars = autoFourPillarsFromInput(dateStr, timeStr, utcOffsetMinutes);
      const counts = elementsFromPillars([pillars.year, pillars.month, pillars.day, pillars.hour]);
      const {most, least} = mostLeast(counts);

      $('#pillars-text').textContent =
        `Year ${pillars.meta.stemsZh[pillars.year.stemIdx]}${pillars.meta.branchesZh[pillars.year.branchIdx]}  ` +
        `Month ${pillars.meta.stemsZh[pillars.month.stemIdx]}${pillars.meta.branchesZh[pillars.month.branchIdx]}  ` +
        `Day ${pillars.meta.stemsZh[pillars.day.stemIdx]}${pillars.meta.branchesZh[pillars.day.branchIdx]}  ` +
        `Hour ${pillars.meta.stemsZh[pillars.hour.stemIdx]}${pillars.meta.branchesZh[pillars.hour.branchIdx]}`;
      renderFive(counts);
      $('#most-el').textContent = most;
      $('#least-el').textContent = least;
      $('#lucky-colors').textContent = luckyBy(most).join(', ');

      // numerology
      const N = window.__FF_NUM__;
      $('#num-life').textContent = N.lifePathFromDateStr(dateStr);
      $('#num-expr').textContent = N.expressionNumber(name);
      $('#num-soul').textContent = N.soulUrgeNumber(name);
      $('#num-pers').textContent = N.personalityNumber(name);
      $('#num-pyear').textContent = N.personalYear(dateStr, new Date());
$('#num-pyear').textContent = N.personalYear(dateStr, new Date());

// === Report CTA（付费报告引导）===
const cta = $('#report-cta');
const btn = $('#btn-report');
if (cta && btn) {
  const q = new URLSearchParams({
    name: ($('#ff-name').value||'').trim(),
    country: $('#ff-country').value || '',
    date: dateStr,
    time: $('#ff-time').value || '12:00',
    offset: String(utcOffsetMinutes),
    lon: $('#ff-lon').value || '',
    tst: $('#ff-tst').checked ? '1' : '0',
    src: 'calc'
  }).toString();

  // 如果有实际结账地址，这里改成你的支付链接
  btn.href = 'report.html?' + q;

  try {
    localStorage.setItem('ff_last', JSON.stringify({
      name: ($('#ff-name').value||'').trim(),
      country: $('#ff-country').value || '',
      date: dateStr,
      time: $('#ff-time').value || '12:00',
      offset: utcOffsetMinutes,
      lon: $('#ff-lon').value || null,
      tst: $('#ff-tst').checked ? 1 : 0
    }));
  } catch(_) {}

  cta.style.display = 'block';
}

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

  // -------- Init --------
  function init(){
    populateCountrySelect();
    const sel = $('#ff-country'); if(sel){ sel.addEventListener('change', inferOffsetFromCountryAndDate); }
    const dt  = $('#ff-date'); if(dt){ dt.addEventListener('change', inferOffsetFromCountryAndDate); }
    const af  = $('#ff-autofill'); if(af){ af.addEventListener('click', e=>{e.preventDefault(); inferOffsetFromCountryAndDate();}); }
    const cb  = $('#calc-btn'); if(cb){ cb.addEventListener('click', e=>{e.preventDefault(); onCalculate();}); }
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
