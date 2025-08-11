
// Day-1 MVP: User selects Gan-Zhi pillars; we map to Five Elements and output advice.
// Later (Day-2): auto-convert from Gregorian datetime to BaZi.

const STEMS = [
  {key:"Jia", zh:"甲", element:"Wood"},
  {key:"Yi", zh:"乙", element:"Wood"},
  {key:"Bing", zh:"丙", element:"Fire"},
  {key:"Ding", zh:"丁", element:"Fire"},
  {key:"Wu", zh:"戊", element:"Earth"},
  {key:"Ji", zh:"己", element:"Earth"},
  {key:"Geng", zh:"庚", element:"Metal"},
  {key:"Xin", zh:"辛", element:"Metal"},
  {key:"Ren", zh:"壬", element:"Water"},
  {key:"Gui", zh:"癸", element:"Water"}
];

const BRANCHES = [
  {key:"Zi", zh:"子", hidden:["Water"]},
  {key:"Chou", zh:"丑", hidden:["Earth","Water","Metal"]},
  {key:"Yin", zh:"寅", hidden:["Wood","Fire","Earth"]},
  {key:"Mao", zh:"卯", hidden:["Wood"]},
  {key:"Chen", zh:"辰", hidden:["Earth","Wood","Water"]},
  {key:"Si", zh:"巳", hidden:["Fire","Metal","Earth"]},
  {key:"Wu", zh:"午", hidden:["Fire","Earth"]},
  {key:"Wei", zh:"未", hidden:["Earth","Wood","Fire"]},
  {key:"Shen", zh:"申", hidden:["Metal","Water","Earth"]},
  {key:"You", zh:"酉", hidden:["Metal"]},
  {key:"Xu", zh:"戌", hidden:["Earth","Fire","Metal"]},
  {key:"Hai", zh:"亥", hidden:["Water","Wood"]}
];

const ELEMENTS = ["Wood","Fire","Earth","Metal","Water"];

function buildSelect(options, id) {
  const sel = document.getElementById(id);
  sel.innerHTML = "";
  options.forEach((o, idx)=>{
    const opt = document.createElement("option");
    opt.value = idx;
    opt.textContent = `${o.zh} (${o.key})`;
    sel.appendChild(opt);
  });
}

function tallyElements(stemIdx, branchIdx) {
  const counts = {Wood:0, Fire:0, Earth:0, Metal:0, Water:0};
  counts[STEMS[stemIdx].element] += 1;
  BRANCHES[branchIdx].hidden.forEach(e => counts[e] += 1);
  return counts;
}

function combineCounts(arr) {
  const total = {Wood:0, Fire:0, Earth:0, Metal:0, Water:0};
  arr.forEach(c => ELEMENTS.forEach(e => total[e]+=c[e]));
  return total;
}

function bestColors(element) {
  // Simple mapping Day-1
  const map = {
    Wood: ["green","cyan"],
    Fire: ["red","orange"],
    Earth: ["yellow","brown"],
    Metal: ["white","silver","gold"],
    Water: ["black","blue","navy"]
  };
  return map[element] || [];
}

function adviceFromCounts(counts){
  // Find max and min
  const entries = ELEMENTS.map(e => [e, counts[e]]);
  entries.sort((a,b)=>b[1]-a[1]);
  const most = entries[0][0];
  const least = entries[4][0];
  return {
    most, least,
    luckyColors: bestColors(least), // suggest colors that "nourish" the least element (Day-1 heuristic)
  };
}

function renderBars(counts){
  const container = document.getElementById("five-bars");
  container.innerHTML = "";
  ELEMENTS.forEach(e=>{
    const bar = document.createElement("div");
    bar.className = "bar";
    const v = counts[e];
    bar.style.height = (10 + v*20) + "px";
    bar.title = `${e}: ${v}`;
    const label = document.createElement("span");
    label.textContent = `${e} ${v}`;
    bar.appendChild(label);
    container.appendChild(bar);
  });
}

function onCalculate(){
  const pillars = ["year","month","day","hour"].map(p=>{
    const s = parseInt(document.getElementById(`${p}-stem`).value,10);
    const b = parseInt(document.getElementById(`${p}-branch`).value,10);
    return tallyElements(s,b);
  });
  const total = combineCounts(pillars);
  renderBars(total);
  const adv = adviceFromCounts(total);
  document.getElementById("result-json").textContent = JSON.stringify(total, null, 2);
  document.getElementById("advice").innerHTML = `
    <b>Most abundant:</b> ${adv.most}<br/>
    <b>Weakest:</b> ${adv.least}<br/>
    <b>Lucky colors:</b> ${adv.luckyColors.join(", ") || "—"}
  `;
}

function initFortune(){
  ["year","month","day","hour"].forEach(p=>{
    buildSelect(STEMS, `${p}-stem`);
    buildSelect(BRANCHES, `${p}-branch`);
  });
  document.getElementById("calc-btn").addEventListener("click", onCalculate);
}

document.addEventListener("DOMContentLoaded", initFortune);


// --- Easy Mode: auto-fill Year Stem/Branch from Gregorian date (approx via Feb 4 LiChun rule) ---
function lichunAdjustedYear(date){
  // If date is before Feb 4 of that year, treat as previous lunar-solar year for pillars.
  const y = date.getFullYear();
  const m = date.getMonth(); // 0-11
  const d = date.getDate();
  if (m < 1) return y - 1;         // Jan
  if (m === 1 && d < 4) return y - 1; // before Feb 4
  return y;
}
function sexagenaryYearIndex(year){
  // Return [stemIdx, branchIdx] using (year - 4) offsets (JiaZi year = 1984, but this works generally)
  const stemIdx = ((year - 4) % 10 + 10) % 10;
  const branchIdx = ((year - 4) % 12 + 12) % 12;
  return [stemIdx, branchIdx];
}
function autofillYearFromDateStr(dateStr){
  if(!dateStr) return;
  const dt = new Date(dateStr + "T12:00:00"); // noon to avoid TZ surprises
  const adjYear = lichunAdjustedYear(dt);
  const [stemIdx, branchIdx] = sexagenaryYearIndex(adjYear);
  const ys = document.getElementById("year-stem");
  const yb = document.getElementById("year-branch");
  if(ys && yb){
    ys.value = String(stemIdx);
    yb.value = String(branchIdx);
  }
  // Optional: hint
  const hint = document.getElementById("easy-hint");
  if(hint){
    hint.textContent = `Auto-filled Year Pillar for ${adjYear} (approx. LiChun on Feb 4).`;
  }
}
