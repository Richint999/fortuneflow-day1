
(function(){
  var SUPPORTED = ["en","zh","es"];
  function detectLang(){
    try{
      var saved = localStorage.getItem("ff_lang");
      if (saved && SUPPORTED.indexOf(saved)>=0) return saved;
      var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
      nav = (nav||"en").toLowerCase();
      if (nav.startsWith("zh")) return "zh";
      if (nav.startsWith("es")) return "es";
      return "en";
    }catch(e){ return "en"; }
  }
  function setLang(lang){
    if (SUPPORTED.indexOf(lang)<0) lang = "en";
    localStorage.setItem("ff_lang", lang);
    return lang;
  }
  function getLang(){ return localStorage.getItem("ff_lang") || detectLang(); }

  function loadDict(lang){
    return fetch("lang/" + lang + ".json").then(function(r){ return r.json(); });
  }

  function applyDict(dict){
    // Header title (if exists)
    var t = document.querySelector("title");
    if (t) t.textContent = dict.site_title || t.textContent;

    // Unified panel translations (by IDs / data-i18n)
    var map = {
      "#ff-unified h2": "auto_four_pillars",
      "#ff-unified p": "panel_tip",
      "label[for='ff-country']": "country",
      "label[for='ff-date']": "birth_date",
      "label[for='ff-time']": "birth_time",
      "#ff-autofill": "autofill"
    };
    Object.keys(map).forEach(function(sel){
      var el = document.querySelector(sel);
      if (el && dict[map[sel]]) el.textContent = dict[map[sel]];
    });

    // Error banner placeholder text
    var err = document.getElementById("ff-error");
    if (err) err.setAttribute("data-i18n-error", dict.error_select_date || "");

    // Lucky colors label if needed (not strictly required here)
  }

  function initI18n(){
    var lang = getLang();
    loadDict(lang).then(function(dict){
      applyDict(dict);
      // attach switcher
      var menu = document.getElementById("ff-lang-menu");
      if (menu){
        menu.value = lang;
        menu.addEventListener("change", function(){
          var chosen = setLang(menu.value);
          loadDict(chosen).then(applyDict);
        });
      }
      // Hook into Auto-Fill display messages
      var disp = document.getElementById("d2-hint") || document.getElementById("ff-disp");
      if (disp){
        disp.setAttribute("data-i18n-filled", dict.filled_hint || "");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initI18n);
  window.__FF_I18N__ = { setLang, getLang };
})();
