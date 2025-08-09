
(function(){
  function paid(){
    try{
      var s = JSON.parse(localStorage.getItem('ff_subs')||'[]');
      if (Array.isArray(s) && s.length>0) return true;
    }catch(e){}
    return !!localStorage.getItem('ff_last_plan');
  }
  function injectStyle(){
    var css = '.ff-locked{filter:blur(2px);opacity:.7;pointer-events:none}'+
              '.ff-cta{margin:12px 0;padding:10px 12px;border-radius:12px;border:1px solid #203052;display:inline-flex;gap:10px;align-items:center;background:#1e2f57;color:#fff;text-decoration:none}'+
              '.ff-cta-wrap{margin:10px 0 16px 0}'+
              '.ff-note{font-size:12px;opacity:.8;margin-left:8px}';
    var s=document.createElement('style'); s.textContent=css; document.head.appendChild(s);
  }
  function removeActionTips(){
    var hs = Array.from(document.querySelectorAll('h2, h3, h4'));
    hs.forEach(function(h){
      if((h.textContent||'').toLowerCase().indexOf('action tips')>=0){
        var el = h;
        while(el){
          var next = el.nextElementSibling;
          el.remove();
          if(!next) break;
          if(/^H[2-4]$/.test(next.tagName)) break;
          el = next;
        }
      }
    });
  }
  function lockPremium(){
    if (paid()) { return; }
    var pro = document.getElementById('pro');
    if (pro){ pro.classList.add('ff-locked'); }
    var keys = ['career','caution','strength','risk','partner','lucky'];
    var hs = Array.from(document.querySelectorAll('h2, h3, h4'));
    hs.forEach(function(h){
      var t = (h.textContent||'').toLowerCase();
      if(keys.some(function(k){return t.indexOf(k)>=0;})){
        h.style.display='none';
        var el = h.nextElementSibling;
        while(el && !/^H[2-4]$/.test(el.tagName)){
          el.style.display='none';
          el = el.nextElementSibling;
        }
      }
    });
    var title = document.querySelector('h1, h2');
    var wrap = document.createElement('div'); wrap.className='ff-cta-wrap';
    wrap.innerHTML = '<a class="ff-cta" href="pricing.html">See full insights — Subscribe</a><span class="ff-note">Already subscribed? Refresh this page.</span>';
    if (title && title.parentNode){ title.parentNode.insertBefore(wrap, title.nextSibling); }
  }
  document.addEventListener('DOMContentLoaded', function(){
    injectStyle();
    removeActionTips();
    lockPremium();
  });
})();
