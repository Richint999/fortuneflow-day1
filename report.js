(function(){
  'use strict';

  // 读取首页传来的数据：URL 优先，其次 localStorage
  function getPayload(){
    const u = new URLSearchParams(location.search);
    let p = null;
    if (u.get('date')) {
      p = {
        name: (u.get('name')||'').trim(),
        country: u.get('country')||'',
        date: u.get('date'),
        time: u.get('time') || '12:00',
        offset: parseInt(u.get('offset')||'0',10) || 0,
        lon: u.get('lon')||'',
        tst: u.get('tst') === '1'
      };
      try{ localStorage.setItem('ff_last', JSON.stringify(p)); }catch(_){}
    } else {
      try{ p = JSON.parse(localStorage.getItem('ff_last')||'null'); }catch(_){}
    }
    return p || null;
  }

  function z(arr,i){ return (arr && arr[i]!=null) ? arr[i] : '?'; }
  const $ = (sel, root=document)=>root.querySelector(sel);

  function render(p){
    const warn = $('#rep-warning');
    if (warn) warn.style.display = 'none';
    const sum = $('#rep-summary'); if (sum) sum.style.display = 'block';

    // 复算
    const pillars = autoFourPillarsFromInput(p.date, p.time || '12:00', p.offset||0);
    const counts  = elementsFromPillars([pillars.year, pillars.month, pillars.day, pillars.hour]);

    // 顶部文字
    const meta = pillars.meta || {};
    const SZ = meta.stemsZh || meta.stems || [];
    const BZ = meta.branchesZh || meta.branches || [];
    const txt = `Year ${z(SZ,pillars.year.stemIdx)}${z(BZ,pillars.year.branchIdx)}  `
              + `Month ${z(SZ,pillars.month.stemIdx)}${z(BZ,pillars.month.branchIdx)}  `
              + `Day ${z(SZ,pillars.day.stemIdx)}${z(BZ,pillars.day.branchIdx)}  `
              + `Hour ${z(SZ,pillars.hour.stemIdx)}${z(BZ,pillars.hour.branchIdx)}`;

    const set = (id, v)=>{ const el = $(id); if (el) el.textContent = v; };
    set('#r-name',  p.name || '—');
    set('#r-birth', `${p.date} ${p.time||'12:00'} (UTC ${p.offset>=0?'+':''}${(p.offset/60).toFixed(2)}h)`);
    set('#r-pillars', txt);

    // 五行
    set('#r-five-wood',  counts.Wood  || 0);
    set('#r-five-fire',  counts.Fire  || 0);
    set('#r-five-earth', counts.Earth || 0);
    set('#r-five-metal', counts.Metal || 0);
    set('#r-five-water', counts.Water || 0);
    const keys = ['Wood','Fire','Earth','Metal','Water'];
    const most  = keys.reduce((a,b)=> counts[b]>counts[a]?b:a, 'Wood');
    const least = keys.reduce((a,b)=> counts[b]<counts[a]?b:a, 'Wood');
    set('#r-five-most', most);
    set('#r-five-least', least);

    // 数字命理
    const N = window.__FF_NUM__;
    set('#r-life',  N.lifePathFromDateStr(p.date));
    set('#r-expr',  N.expressionNumber(p.name||''));
    set('#r-soul',  N.soulUrgeNumber(p.name||''));
    set('#r-pers',  N.personalityNumber(p.name||''));
    set('#r-pyear', N.personalYear(p.date, new Date()));

    // 打印
    const bindPrint = (id)=>{ const a=$(id); if(a) a.onclick=(e)=>{e.preventDefault(); window.print();}; };
    bindPrint('#btn-print');
    bindPrint('#btn-print-dup');
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const p = getPayload();
    if (!p) {
      console.warn('[Report] No payload. Recalculate on Home.');
      return; // 保持 “No data …”
    }
    try { render(p); }
    catch(e){
      console.error('[Report] render error', e);
      const warn = document.getElementById('rep-warning');
      if (warn){ warn.textContent = '⚠️ Failed to render report. Please re-calculate on Home.'; }
    }
  });
})();