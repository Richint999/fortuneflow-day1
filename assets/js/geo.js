
// Day-2.3: Plain script (no modules). Country -> UTC offset auto-fill.
(function(){
  
  var COUNTRY_TIME = [
    // --- Priority markets ---
    ["China (+08:00)", 480, 480, false, "N"],
    ["USA - Los Angeles (-480/-420)", -480, -420, true, "N"],
    ["USA - New York (-300/-240)", -300, -240, true, "N"],
    ["Canada - Toronto (-300/-240)", -300, -240, true, "N"],
    ["Hong Kong (+08:00)", 480, 480, false, "N"],
    ["Taiwan (+08:00)", 480, 480, false, "N"],
    ["Japan (+09:00)", 540, 540, false, "N"],
    ["South Korea (+09:00)", 540, 540, false, "N"],
    ["Mexico City (-360)", -360, -360, false, "N"],
    ["Spain (+60/+120)", 60, 120, true, "N"],
    // --- Others (still available) ---
    ["Singapore (+08:00)", 480, 480, false, "N"],
    ["Malaysia (+08:00)", 480, 480, false, "N"],
    ["Thailand (+07:00)", 420, 420, false, "N"],
    ["Vietnam (+07:00)", 420, 420, false, "N"],
    ["Philippines (+08:00)", 480, 480, false, "N"],
    ["United Kingdom (0/+60)", 0, 60, true, "N"],
    ["Germany (+60/+120)", 60, 120, true, "N"],
    ["France (+60/+120)", 60, 120, true, "N"],
    ["Italy (+60/+120)", 60, 120, true, "N"],
    ["Netherlands (+60/+120)", 60, 120, true, "N"],
    ["Greece (+120/+180)", 120, 180, true, "N"],
    ["Turkey (+180)", 180, 180, false, "N"],
    ["Israel (+120/+180)", 120, 180, true, "N"],
    ["UAE (+240)", 240, 240, false, "N"],
    ["South Africa (+120)", 120, 120, false, "S"],
    ["Australia - Sydney (+10/+11)", 600, 660, true, "S"],
    ["New Zealand - Wellington (+12/+13)", 720, 780, true, "S"],
    ["Brazil - São Paulo (-180/-120)", -180, -120, true, "S"],
    ["Canada - Vancouver (-480/-420)", -480, -420, true, "N"],
    ["USA - Chicago (-360/-300)", -360, -300, true, "N"],
    ["USA - Denver (-420/-360)", -420, -360, true, "N"]
  ];

  function populateCountrySelect(id){
    var sel = document.getElementById(id);
    if(!sel) return;
    sel.innerHTML = "";
    COUNTRY_TIME.forEach(function(row, idx){
      var opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = row[0];
      sel.appendChild(opt);
    });
  }
  function inferOffsetFromCountryAndDate(countryIdx, dateStr){
    if(countryIdx == null) return 0;
    var row = COUNTRY_TIME[countryIdx];
    if(!row) return 0;
    var std = row[1], dst = row[2], hasDST = row[3], hemi = row[4];
    if(!hasDST || !dateStr) return std;
    var parts = dateStr.split("-");
    if(parts.length<3) return std;
    var y = parseInt(parts[0],10), m = parseInt(parts[1],10), d = parseInt(parts[2],10);
    var mmdd = m*100 + d;
    if (hemi === "N"){
      if (mmdd >= 401 && mmdd <= 1031) return dst; // Apr 1 .. Oct 31
      return std;
    } else {
      if ((mmdd >= 1101 && mmdd <= 1231) || (mmdd >= 101 && mmdd <= 331)) return dst;
      return std;
    }
  }
  window.__FF_COUNTRY__ = { populateCountrySelect, inferOffsetFromCountryAndDate };
})();
