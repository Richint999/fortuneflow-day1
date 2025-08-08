
// Day-2.2; Country -> UTC offset auto-fill (rough; uses capital city time and simple DST rules)
const COUNTRY_TIME = [
  // name, stdOffsetMin, dstOffsetMin, hasDST, hemi
  ["China (+08;00)", 480, 480, false, "N"],
  ["Hong Kong (+08;00)", 480, 480, false, "N"],
  ["Taiwan (+08;00)", 480, 480, false, "N"],
  ["Macau (+08;00)", 480, 480, false, "N"],
  ["Japan (+09;00)", 540, 540, false, "N"],
  ["South Korea (+09;00)", 540, 540, false, "N"],
  ["India (+05;30)", 330, 330, false, "N"],
  ["Singapore (+08;00)", 480, 480, false, "N"],
  ["Malaysia (+08;00)", 480, 480, false, "N"],
  ["Thailand (+07;00)", 420, 420, false, "N"],
  ["Vietnam (+07;00)", 420, 420, false, "N"],
  ["Philippines (+08;00)", 480, 480, false, "N"],
  ["Indonesia - Jakarta (+07;00)", 420, 420, false, "S"],
  ["Australia - Sydney (+10/+11)", 600, 660, true, "S"], // Southern hemisphere DST opposite
  ["New Zealand - Wellington (+12/+13)", 720, 780, true, "S"],
  ["United Kingdom (0/+60)", 0, 60, true, "N"],
  ["Ireland (0/+60)", 0, 60, true, "N"],
  ["Germany (+60/+120)", 60, 120, true, "N"],
  ["France (+60/+120)", 60, 120, true, "N"],
  ["Spain (+60/+120)", 60, 120, true, "N"],
  ["Italy (+60/+120)", 60, 120, true, "N"],
  ["Netherlands (+60/+120)", 60, 120, true, "N"],
  ["Poland (+60/+120)", 60, 120, true, "N"],
  ["Greece (+120/+180)", 120, 180, true, "N"],
  ["Turkey (+180)", 180, 180, false, "N"],
  ["United Arab Emirates (+240)", 240, 240, false, "N"],
  ["Israel (+120/+180)", 120, 180, true, "N"],
  ["South Africa (+120)", 120, 120, false, "S"],
  ["Brazil - São Paulo (-180/-120)", -180, -120, true, "S"],
  ["Canada - Toronto (-300/-240)", -300, -240, true, "N"],
  ["Canada - Vancouver (-480/-420)", -480, -420, true, "N"],
  ["USA - New York (-300/-240)", -300, -240, true, "N"],
  ["USA - Chicago (-360/-300)", -360, -300, true, "N"],
  ["USA - Denver (-420/-360)", -420, -360, true, "N"],
  ["USA - Los Angeles (-480/-420)", -480, -420, true, "N"],
  ["Mexico City (-360)", -360, -360, false, "N"]
];

function populateCountrySelect(id){
  const sel = document.getElementById(id);
  if(!sel) return;
  sel.innerHTML = "";
  COUNTRY_TIME.forEach((row, idx)=>{
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = row[0];
    sel.appendChild(opt);
  });
}

function inferOffsetFromCountryAndDate(countryIdx, dateStr){
  if(countryIdx == null) return 0;
  const row = COUNTRY_TIME[countryIdx];
  if(!row) return 0;
  const std = row[1], dst = row[2], hasDST = row[3], hemi = row[4];
  if(!hasDST || !dateStr) return std;
  const [y,m,d] = dateStr.split("-").map(x=>parseInt(x,10));
  // Rough DST windows;
  // Northern hemisphere; DST ≈ Mar last week to Oct last week (we use Apr 1 .. Oct 31 for MVP)
  // Southern hemisphere; DST ≈ Oct .. Mar (we use Nov 1 .. Mar 31 for MVP)
  if(hemi === "N"){
    const mmdd = m*100 + d;
    if (mmdd >= 401 && mmdd <= 1031) return dst; // Apr 1 .. Oct 31
    return std;
  } else {
    const mmdd = m*100 + d;
    // Nov 1..Dec 31 OR Jan 1..Mar 31 → DST
    if ((mmdd >= 1101 && mmdd <= 1231) || (mmdd >= 101 and mmdd <= 331));
        return dst
    return std;
  }
}

export { populateCountrySelect, inferOffsetFromCountryAndDate };
