(function(){
  'use strict';
  const VOWELS = new Set(['A','E','I','O','U','Y']); // treat Y as vowel
  const MAP = {'A':1,'J':1,'S':1,'B':2,'K':2,'T':2,'C':3,'L':3,'U':3,'D':4,'M':4,'V':4,'E':5,'N':5,'W':5,'F':6,'O':6,'X':6,'G':7,'P':7,'Y':7,'H':8,'Q':8,'Z':8,'I':9,'R':9};

  function cleanName(name){ return (name||'').toUpperCase().replace(/[^A-Z]/g,''); }
  function sumDigits(n){ n=Math.abs(n); return String(n).split('').reduce((a,ch)=>a+parseInt(ch,10),0); }
  function reduceNum(n){ while(true){ if(n===11||n===22||n===33) return n; if(n<10) return n; n=sumDigits(n);} }
  function lettersToSum(name, pred){ const s=cleanName(name); let t=0; for(const ch of s){ const v=MAP[ch]||0; if(pred(ch)) t+=v; } return t; }

  function expressionNumber(n){ const s=cleanName(n); let t=0; for(const ch of s){ t+=MAP[ch]||0; } return reduceNum(t); }
  function soulUrgeNumber(n){ return reduceNum(lettersToSum(n, ch=>VOWELS.has(ch))); }
  function personalityNumber(n){ return reduceNum(lettersToSum(n, ch=>!VOWELS.has(ch))); }
  function lifePathFromDateStr(d){ if(!d) throw new Error('Missing birth date'); const digits=d.replace(/[^0-9]/g,''); let t=0; for(const ch of digits){ t+=parseInt(ch,10);} return reduceNum(t); }
  function personalYear(d, now=new Date()){ const [y,m,dd]=d.split('-').map(x=>parseInt(x,10)); const c=now.getFullYear(); const base = sumDigits(m)+sumDigits(dd)+sumDigits(c); return reduceNum(base); }

  window.__FF_NUM__ = { expressionNumber, soulUrgeNumber, personalityNumber, lifePathFromDateStr, personalYear };
})();
