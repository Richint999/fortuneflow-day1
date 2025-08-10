
(function(){
  'use strict';
  const VOWELS = new Set(['A','E','I','O','U','Y']); // treat Y as vowel for Soul Urge in many systems
  const MAP = {'A':1,'J':1,'S':1,'B':2,'K':2,'T':2,'C':3,'L':3,'U':3,'D':4,'M':4,'V':4,'E':5,'N':5,'W':5,'F':6,'O':6,'X':6,'G':7,'P':7,'Y':7,'H':8,'Q':8,'Z':8,'I':9,'R':9};

  function cleanName(name){
    return (name||'').toUpperCase().replace(/[^A-Z]/g,'');
  }
  function sumDigits(n){
    n = Math.abs(n);
    let s = 0; String(n).split('').forEach(ch=>{ s += parseInt(ch,10); });
    return s;
  }
  function reduceNum(n){
    while(true){
      if(n===11||n===22||n===33) return n;
      if(n<10) return n;
      n = sumDigits(n);
    }
  }
  function lettersToSum(name, predicate){
    const s = cleanName(name);
    let total = 0;
    for(const ch of s){
      const val = MAP[ch]||0;
      if(predicate(ch)) total += val;
    }
    return total;
  }
  function expressionNumber(name){
    const s = cleanName(name);
    let t = 0; for(const ch of s){ t += (MAP[ch]||0); }
    return reduceNum(t);
  }
  function soulUrgeNumber(name){
    return reduceNum(lettersToSum(name, ch => VOWELS.has(ch)));
  }
  function personalityNumber(name){
    return reduceNum(lettersToSum(name, ch => !VOWELS.has(ch)));
  }
  function lifePathFromDateStr(dateStr){
    if(!dateStr) throw new Error('Missing birth date');
    const digits = dateStr.replace(/[^0-9]/g,'');
    let total = 0;
    for(const ch of digits){ total += parseInt(ch,10); }
    return reduceNum(total);
  }
  function personalYear(dateStr, now=new Date()){
    // PY = reduce( month + day + currentYear digits )
    const [y,m,d] = dateStr.split('-').map(x=>parseInt(x,10));
    const c = now.getFullYear();
    const base = reduceNum(sumDigits(m)+sumDigits(d)+sumDigits(c));
    return base;
  }

  window.__FF_NUM__ = {
    expressionNumber, soulUrgeNumber, personalityNumber, lifePathFromDateStr, personalYear
  };
})();
