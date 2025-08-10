(function(){
  function needsTiming(nav){
    var links = Array.from(nav.querySelectorAll('a'));
    return !links.some(function(a){ return /\/timing\/?$/i.test(a.getAttribute('href')||''); });
  }
  function relToTiming(){
    try{
      var path = location.pathname;
      if (/\/(match|timing)\//i.test(path)) return '../timing/';
      return 'timing/';
    }catch(e){ return 'timing/'; }
  }
  function insert(){
    var nav = document.querySelector('nav'); if(!nav) return;
    if(!needsTiming(nav)) return;
    var links = Array.from(nav.querySelectorAll('a'));
    var after = links.find(function(a){ return /match\/?$/i.test(a.getAttribute('href')||'') || /Partner\s*Match/i.test(a.textContent||''); });
    var a = document.createElement('a'); a.href = relToTiming(); a.textContent = 'Timing';
    if(after && after.parentNode===nav){ after.insertAdjacentElement('afterend', a); }
    else{ nav.appendChild(a); }
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', insert); }
  else{ insert(); }
})();