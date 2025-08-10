
(function(){
  'use strict';
  const ELEMENT_KEYS = ['Wood','Fire','Earth','Metal','Water'];
  const LUCKY_MAP = {Wood:['green','cyan'], Fire:['red','orange'], Earth:['yellow','brown'], Metal:['white','silver','gold'], Water:['black','blue','navy']};

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Country select
  function populateCountrySelect(){
    try{
      const sel = $('#ff-country');
      if(!sel) return;
      sel.innerHTML = "";
      // placeholder
      var ph = document.createElement('option');
      ph.value = ""; ph.textContent = "Select country"; ph.disabled = true; ph.selected = true;
      sel.appendChild(ph);
      // candidates
      const _C = (window.COUNTRIES || (typeof COUNTRIES!=='undefined'?COUNTRIES:[]));
      const fallback = [
        { value:'US', label:'United States (auto DST)' },
        { value:'CN', label:'China (UTC+8)' },
        { value:'IN', label:'India (UTC+5:30)' }
      ];
      const list = Array.isArray(_C) && _C.length ? _C : fallback;
      list.forEach((c, i)=>{
        const opt = document.createElement('option');
        opt.value = String(i);
        opt.textContent = c.label || c.value || ('Country '+(i+1));
        sel.appendChild(opt);
      });
      // enable/disable autofill button
      var btn = document.getElementById('ff-autofill');
      if(btn){ btn.disabled = !(Array.isArray(_C) && _C.length); }
    }catch(e){ console.warn(e); }
  });
    }catch(e){ console.warn(e); }
  }

  function inferOffsetFromCountryAndDate(){
    try{
      const sel = $('#ff-country');
      const dateStr = $('#ff-date').value;
      if(!sel || !dateStr) return;
      const idx = sel.selectedIndex - 1; // account for placeholder
      if(idx < 0){ $('#ff-offset').value = '0'; return; }
      if(window.__FF_GEO__ && typeof window.__FF_GEO__.inferOffsetFromCountryAndDate==='function'){
        const off = window.__FF_GEO__.inferOffsetFromCountryAndDate(idx, dateStr);
        $('#ff-offset').value = String((off!=null?off:0));
      }else{
        // basic fallback
        const label = sel.options[sel.selectedIndex].textContent || '';
        if(/China/i.test(label)) $('#ff-offset').value = '480';
        else if(/India/i.test(label)) $('#ff-offset').value = '330';
        else $('#ff-offset').value = '0';
      }
    }catch(e){ console.warn('offset fallback', e); $('#ff-offset').value = '0'; }
  }
    }catch(e){ console.warn('offset fallback', e); }
  }

  function luckyBy(e){ return (LUCKY_MAP[e]||[]); }

  function renderFiveElements(counts){
    // bars
    const c = $('#five-bars'); if(c){ c.innerHTML = ''; }
    const frag = document.createDocumentFragment();
    ELEMENT_KEYS.forEach(k=>{
      const v = counts[k]||0;
      const bar = document.createElement('div'); bar.className='bar'; var px = Math.max(4, v*20); bar.style.width = px+'px'; bar.style.setProperty('--bar-width', px+'px');
      const label = document.createElement('span'); label.textContent = k+' '+v; bar.appendChild(label);
      frag.appendChild(bar);
    });
    c && c.appendChild(frag);
    // table
    const table = document.createElement('table'); const thead=document.createElement('thead'); const trh=document.createElement('tr');
    ELEMENT_KEYS.forEach(k=>{ const th=document.createElement('th'); th.textContent=k; trh.appendChild(th); }); thead.appendChild(trh);
    const tb=document.createElement('tbody'); const tr=document.createElement('tr');
    ELEMENT_KEYS.forEach(k=>{ const td=document.createElement('td'); td.textContent=String(counts[k]||0); tr.appendChild(td); });
    tb.appendChild(tr); table.appendChild(thead); table.appendChild(tb);
    const host = $('#five-table-host'); if(host){ host.innerHTML=''; host.appendChild(table); }
  }

  function mostLeast(counts){
    const keys = ELEMENT_KEYS;
    let most=keys[0], least=keys[0];
    keys.forEach(k=>{ if(counts[k]>counts[most]) most=k; if(counts[k]<counts[least]) least=k; });
    return {most, least};
  }

  function calcFourPillarsAndElements(input){
    // input: {dateStr, timeStr, offsetMin, lon, tst}
    const pillars = autoFourPillarsFromInput(input.dateStr, input.timeStr, input.offsetMin);
    // set globals for TST if provided
    if(typeof input.lon === 'number'){ window.__tst_lon = input.lon; }
    window.__tst_enabled = !!input.tst;
    const counts = elementsFromPillars([pillars.year, pillars.month, pillars.day, pillars.hour]);
    return {pillars, counts};
  }

  function onCalculate(){
    const name = ($('#ff-name').value||'').trim();
    const dateStr = $('#ff-date').value;
    const timeStr = $('#ff-time').value || '12:00';
    const offsetMin = parseInt($('#ff-offset').value||'0',10);
    const lonVal = $('#ff-lon').value; const lon = lonVal? parseFloat(lonVal): undefined;
    const tst = $('#ff-tst').checked;

    try{
      if(!dateStr) throw new Error('Please enter birth date');
      if(!name) throw new Error('Please enter full name (Latin letters)');
      // Four Pillars
            // set TST flags before calculation so hour pillar is correct
      if(typeof lon === 'number'){ window.__tst_lon = lon; }
      window.__tst_enabled = !!tst;
      const {pillars, counts} = calcFourPillarsAndElements({dateStr,timeStr,offsetMin,lon,tst});
      const {most, least} = mostLeast(counts);
      $('#pillars-text').textContent = `Year ${pillars.meta.stemsZh[pillars.year.stemIdx]}${pillars.meta.branchesZh[pillars.year.branchIdx]}  Month ${pillars.meta.stemsZh[pillars.month.stemIdx]}${pillars.meta.branchesZh[pillars.month.branchIdx]}  Day ${pillars.meta.stemsZh[pillars.day.stemIdx]}${pillars.meta.branchesZh[pillars.day.branchIdx]}  Hour ${pillars.meta.stemsZh[pillars.hour.stemIdx]}${pillars.meta.branchesZh[pillars.hour.branchIdx]}`;
      renderFiveElements(counts);
      $('#most-el').textContent = most;
      $('#least-el').textContent = least;
      $('#lucky-colors').textContent = luckyBy(most).join(', ');

      // Numerology
      const N = window.__FF_NUM__;
      const life = N.lifePathFromDateStr(dateStr);
      const expr = N.expressionNumber(name);
      const soul = N.soulUrgeNumber(name);
      const pers = N.personalityNumber(name);
      const pyear = N.personalYear(dateStr, new Date());

      $('#num-life').textContent = life;
      $('#num-expr').textContent = expr;
      $('#num-soul').textContent = soul;
      $('#num-pers').textContent = pers;
      $('#num-pyear').textContent = pyear;

      // live region
      const live = $('#result-live');
      if(live){ live.textContent = `Most ${most}, Least ${least}, Life Path ${life}`; }

      // persist
      localStorage.setItem('ff_profile', JSON.stringify({name,dateStr,timeStr,offsetMin,lon,tst}));
      const url = new URL(window.location.href);
      url.searchParams.set('name', encodeURIComponent(name));
      url.searchParams.set('d', dateStr);
      url.searchParams.set('t', timeStr);
      url.searchParams.set('o', String(offsetMin));
      if(lon!=null) url.searchParams.set('lon', String(lon));
      url.searchParams.set('tst', tst?'1':'0');
      history.replaceState({},'',url.toString());

      $('#error-banner').style.display='none';
    }catch(e){
      const err = $('#error-banner');
      if(err){ err.textContent = '⚠️ ' + (e.message || 'Unknown error'); err.style.display='block'; err.scrollIntoView({behavior:'smooth', block:'center'}); }
      console.error(e);
    }
  }

  function restore(){
    try{
      populateCountrySelect();
      const q = new URLSearchParams(window.location.search);
      const saved = JSON.parse(localStorage.getItem('ff_profile')||'null') || {};
      $('#ff-name').value = decodeURIComponent(q.get('name')|| saved.name || '');
      $('#ff-date').value = q.get('d') || saved.dateStr || '';
      $('#ff-time').value = q.get('t') || saved.timeStr || '';
      $('#ff-offset').value = q.get('o') || (saved.offsetMin!=null? String(saved.offsetMin): '0');
      $('#ff-lon').value = q.get('lon') || (saved.lon!=null? String(saved.lon): '');
      $('#ff-tst').checked = (q.get('tst')==='1') || !!saved.tst;

      $('#ff-country').addEventListener('change', inferOffsetFromCountryAndDate);
      $('#ff-date').addEventListener('change', inferOffsetFromCountryAndDate);
      $('#ff-autofill').addEventListener('click', function(ev){ ev.preventDefault(); inferOffsetFromCountryAndDate(); });

      $('#calc-btn').addEventListener('click', function(ev){ ev.preventDefault(); onCalculate(); });
    }catch(e){ console.error(e); }
  }

  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', restore); } else { restore(); }
})();
