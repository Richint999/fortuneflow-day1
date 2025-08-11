// ==== Core BaZi primitives (drop-in) ====
// globals for TST
if (typeof window.__tst_enabled === 'undefined') window.__tst_enabled = false;

// stems/branches
const STEMS = ["Jia","Yi","Bing","Ding","Wu","Ji","Geng","Xin","Ren","Gui"];
const STEMS_ZH = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["Zi","Chou","Yin","Mao","Chen","Si","Wu","Wei","Shen","You","Xu","Hai"];
const BRANCHES_ZH = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

// elements maps
const BRANCH_TO_ELEMENT = {
  Zi:"Water", Chou:"Earth", Yin:"Wood", Mao:"Wood", Chen:"Earth",
  Si:"Fire", Wu:"Fire", Wei:"Earth", Shen:"Metal", You:"Metal", Xu:"Earth", Hai:"Water"
};
const STEM_TO_ELEMENT = {
  Jia:"Wood", Yi:"Wood", Bing:"Fire", Ding:"Fire",
  Wu:"Earth", Ji:"Earth", Geng:"Metal", Xin:"Metal", Ren:"Water", Gui:"Water"
};

function mod(n,m){ return ((n % m) + m) % m; }

// 立春前一年 - 近似：2月4日
function lichunAdjustedYear(dateUTC){
  const y = dateUTC.getUTCFullYear();
  const m = dateUTC.getUTCMonth();  // 0..11
  const d = dateUTC.getUTCDate();
  if (m < 1) return y - 1;
  if (m === 1 && d < 4) return y - 1;
  return y;
}

// 年干支（1984 甲子基准）
function sexagenaryYear(yearAdj){
  const stemIdx = mod((yearAdj - 4), 10);
  const branchIdx = mod((yearAdj - 4), 12);
  return [stemIdx, branchIdx];
}

// 按近似节气切分的月柱（寅月起）
function monthPillar(yearStemIdx, dateUTC){
  const m = dateUTC.getUTCMonth(); // 0..11
  const d = dateUTC.getUTCDate();
  const starts = [ ,4,6,5,6,6,7,8,8,8,7,7,6 ]; // Feb..Jan 起始日
  let idxFromTiger = 0; // 1..12
  if (m===1) idxFromTiger = (d>=starts[1])?1:12;
  else if (m===2) idxFromTiger = (d>=starts[2])?2:1;
  else if (m===3) idxFromTiger = (d>=starts[3])?3:2;
  else if (m===4) idxFromTiger = (d>=starts[4])?4:3;
  else if (m===5) idxFromTiger = (d>=starts[5])?5:4;
  else if (m===6) idxFromTiger = (d>=starts[6])?6:5;
  else if (m===7) idxFromTiger = (d>=starts[7])?7:6;
  else if (m===8) idxFromTiger = (d>=starts[8])?8:7;
  else if (m===9) idxFromTiger = (d>=starts[9])?9:8;
  else if (m===10) idxFromTiger = (d>=starts[10])?10:9;
  else if (m===11) idxFromTiger = (d>=starts[11])?11:10;
  else if (m===0) idxFromTiger = (d>=starts[12])?12:11;

  // 寅在 BRANCHES 中索引 2（0-based）
  const branchIdx = mod(2 + (idxFromTiger-1), 12);

  // 年干定寅月起干：甲己丙、乙庚戊、丙辛庚、丁壬庚、戊癸甲
  const startStemForTiger = {0:2,5:2,1:4,6:4,2:6,7:6,3:8,8:8,4:0,9:0};
  const tigerStemStart = startStemForTiger[yearStemIdx];
  const stemIdx = mod(tigerStemStart + (idxFromTiger-1), 10);
  return [stemIdx, branchIdx];
}

// JDN 与日柱（0=甲子）
function julianDayNumber(y,m,d){
  const a = Math.floor((14 - m)/12);
  const y2 = y + 4800 - a;
  const m2 = m + 12*a - 3;
  return d + Math.floor((153*m2 + 2)/5) + 365*y2 + Math.floor(y2/4) - Math.floor(y2/100) + Math.floor(y2/400) - 32045;
}
function sexagenaryDay(y,m,d){
  const jdn = julianDayNumber(y,m,d);
  const idx60 = mod(jdn + 49, 60);
  return [idx60 % 10, idx60 % 12];
}

// 时柱
function hourBranchIndex(hourLocal){ return Math.floor(((hourLocal + 1) % 24) / 2); }
function hourStemIndex(dayStemIdx, hourBranchIdx){
  const startForZi = {0:0,5:0,1:2,6:2,2:4,7:4,3:6,8:6,4:8,9:8};
  return mod(startForZi[dayStemIdx] + hourBranchIdx, 10);
}

// True Solar Time（可选）
function dayOfYearUTC(date){
  const start = Date.UTC(date.getUTCFullYear(),0,1);
  return Math.floor((date.getTime() - start)/(1000*60*60*24)) + 1;
}
function equationOfTimeMinutes(doy){
  const B = 2 * Math.PI * (doy - 81) / 364.0;
  return 9.87*Math.sin(2*B) - 7.53*Math.cos(B) - 1.5*Math.sin(B);
}
function standardMeridianDeg(offsetMinutes){ return (offsetMinutes/60) * 15; }
function adjustHourByTST(localHour, localMinute, longitudeDeg, offsetMinutes, utcDateForEoT){
  const stdMer = standardMeridianDeg(offsetMinutes);
  const deltaMinutes = 4*(longitudeDeg - stdMer) + equationOfTimeMinutes(dayOfYearUTC(utcDateForEoT));
  let total = localHour*60 + localMinute + deltaMinutes;
  total = ((total % 1440) + 1440) % 1440;
  return { hour: Math.floor(total/60), minute: Math.round(total%60) };
}

// 五行计数（按天干+地支）
function elementsFromPillars(arr){
  const counts = {Wood:0, Fire:0, Earth:0, Metal:0, Water:0};
  arr.forEach(p=>{
    const sEl = STEM_TO_ELEMENT[STEMS[p.stemIdx]];
    const bEl = BRANCH_TO_ELEMENT[BRANCHES[p.branchIdx]];
    if (sEl) counts[sEl] += 1;
    if (bEl) counts[bEl] += 1;
  });
  return counts;
}
window.elementsFromPillars = elementsFromPillars;
// ==== end primitives ====

var __tst_enabled = false;
// -- helper: parse utc offset to minutes --
function parseOffsetMinutes(raw){
  if (raw == null) return 0;
  const s = String(raw).trim();
  if (s === "") return 0;

  // 形如 "+08:00" / "-07:30" / "+8:00"
  const m = s.match(/^([+-]?)(\d{1,2})(?::?(\d{2}))?$/);
  if (m){
    const sign = m[1] === "-" ? -1 : 1;
    const hh = parseInt(m[2]||"0",10);
    const mm = parseInt(m[3]||"0",10);
    // 当作小时:分钟
    if (hh <= 24) return sign * (hh*60 + mm);
  }

  // 纯数字：|n|<=24 当作“小时”，否则当作“分钟”
  const n = Number(s);
  if (!isNaN(n)){
    if (Math.abs(n) <= 24) return Math.round(n*60);
    return Math.round(n);
  }
  return 0; // 容错
}
function autoFourPillarsFromInput(dateStr, timeStr, utcOffsetMinutesRaw){
  if(!dateStr) throw new Error("Missing date");
  const [y,m,d] = dateStr.split("-").map(x=>parseInt(x,10));
  let hr=12, min=0;
  if (timeStr){
    const parts = timeStr.split(":");
    hr = parseInt(parts[0]||"12",10);
    min = parseInt(parts[1]||"0",10);
  }

  // ✅ 统一把第三个参数解析成“分钟”数，后面所有地方都用这个变量
  const utcOffsetMinutes = parseOffsetMinutes(utcOffsetMinutesRaw); // e.g. 480 / -300

  // local time = UTC + offset  =>  UTC = local - offset
  const local = new Date(Date.UTC(y, (m-1), d, hr, min));
  const utcMillis = local.getTime() - utcOffsetMinutes * 60 * 1000;  // ✅ 用解析后的数值
  const utcDate = new Date(utcMillis);

  // Year
  const yAdj = lichunAdjustedYear(utcDate);
  const [yStem, yBranch] = sexagenaryYear(yAdj);

  // Month
  const [mStem, mBranch] = monthPillar(yStem, utcDate);

  // Day（JDN）
  const [dStem, dBranch] =
    sexagenaryDay(utcDate.getUTCFullYear(), utcDate.getUTCMonth()+1, utcDate.getUTCDate());

  // Hour（考虑 TST）
  let adjHr = hr, adjMin = min;
  if (__tst_enabled && typeof __tst_lon === 'number' && !isNaN(__tst_lon)){
    const adj = adjustHourByTST(hr, min, __tst_lon, utcOffsetMinutes, utcDate); // ✅ 这里也用统一变量
    adjHr = adj.hour; adjMin = adj.minute;
  }
  const hBranch = hourBranchIndex(adjHr);
  const hStem = hourStemIndex(dStem, hBranch);

  // 可选调试
  console.log({
    input:{ y, m, d, hr, min, utcOffsetMinutes },
    pillars_preview:{ yStem, yBranch },
    utcDate: utcDate.toISOString()
  });

  return {
    year:{stemIdx:yStem, branchIdx:yBranch},
    month:{stemIdx:mStem, branchIdx:mBranch},
    day:{stemIdx:dStem, branchIdx:dBranch},
    hour:{stemIdx:hStem, branchIdx:hBranch},
    meta:{
      yAdj,
      stems: STEMS, stemsZh: STEMS_ZH, branches: BRANCHES, branchesZh: BRANCHES_ZH
    }
  };
}

window.autoFourPillarsFromInput = autoFourPillarsFromInput;
window.elementsFromPillars = elementsFromPillars;
