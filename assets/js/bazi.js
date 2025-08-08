
// Day-2 BaZi auto calculation (approximate): date, time, UTC offset -> Year/Month/Day/Hour pillars
// Notes: Uses LiChun ~ Feb 4 boundary for Year/Month, JDN-derived cyclical day, local hour slots for Hour pillar.
// This is sufficient for MVP; Day-3 can add precise solar terms and geolocation-based true solar time.

const STEMS = ["Jia","Yi","Bing","Ding","Wu","Ji","Geng","Xin","Ren","Gui"];
const STEMS_ZH = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["Zi","Chou","Yin","Mao","Chen","Si","Wu","Wei","Shen","You","Xu","Hai"];
const BRANCHES_ZH = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const BRANCH_TO_ELEMENT = {
  Zi:"Water", Chou:"Earth", Yin:"Wood", Mao:"Wood", Chen:"Earth",
  Si:"Fire", Wu:"Fire", Wei:"Earth", Shen:"Metal", You:"Metal", Xu:"Earth", Hai:"Water"
};
const STEM_TO_ELEMENT = {
  Jia:"Wood", Yi:"Wood", Bing:"Fire", Ding:"Fire",
  Wu:"Earth", Ji:"Earth", Geng:"Metal", Xin:"Metal", Ren:"Water", Gui:"Water"
};

function lichunAdjustedYear(date){ // approx: Feb 4 threshold
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  if (m < 1) return y - 1;
  if (m === 1 && d < 4) return y - 1;
  return y;
}
function sexagenaryYear(yearAdj){
  // Standard offset: 1984 is JiaZi year; stem=(year-4)%10 branch=(year-4)%12 works for Gregorian year numbering
  const stemIdx = mod((yearAdj - 4), 10);
  const branchIdx = mod((yearAdj - 4), 12);
  return [stemIdx, branchIdx];
}
function monthPillar(yearStemIdx, date){
  // Approx: Tiger month (Yin) begins ~ Feb 4. Month index from Tiger=1..12 through Ox.
  // Determine "solar month index" anchored at Feb -> Yin(寅)=1
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth(); // 0..11
  const d = date.getUTCDate();
  // Use approximate boundaries: Feb4, Mar6, Apr5, May6, Jun6, Jul7, Aug8, Sep8, Oct8, Nov7, Dec7, Jan6 (rough)
  // For MVP, a coarse mapping by month number is acceptable.
  const approxBoundaries = [ // month start day (UTC) for month index 1..12 starting at Feb
    null,
    4,  // Feb 4 -> Yin(1)
    6,  // Mar 6 -> Mao(2)
    5,  // Apr 5 -> Chen(3)
    6,  // May 6 -> Si(4)
    6,  // Jun 6 -> Wu(5)
    7,  // Jul 7 -> Wei(6)
    8,  // Aug 8 -> Shen(7)
    8,  // Sep 8 -> You(8)
    8,  // Oct 8 -> Xu(9)
    7,  // Nov 7 -> Hai(10)
    7,  // Dec 7 -> Zi(11)
    6   // Jan 6 -> Chou(12)
  ];
  let idxFromTiger = 0;
  if (m===1) idxFromTiger = (d>=approxBoundaries[1])?1:12;
  else if (m===2) idxFromTiger = (d>=approxBoundaries[2])?2:1;
  else if (m===3) idxFromTiger = (d>=approxBoundaries[3])?3:2;
  else if (m===4) idxFromTiger = (d>=approxBoundaries[4])?4:3;
  else if (m===5) idxFromTiger = (d>=approxBoundaries[5])?5:4;
  else if (m===6) idxFromTiger = (d>=approxBoundaries[6])?6:5;
  else if (m===7) idxFromTiger = (d>=approxBoundaries[7])?7:6;
  else if (m===8) idxFromTiger = (d>=approxBoundaries[8])?8:7;
  else if (m===9) idxFromTiger = (d>=approxBoundaries[9])?9:8;
  else if (m===10) idxFromTiger = (d>=approxBoundaries[10])?10:9;
  else if (m===11) idxFromTiger = (d>=approxBoundaries[11])?11:10;
  else if (m===0) idxFromTiger = (d>=approxBoundaries[12])?12:11; // Jan
  // Branch index for month: Yin(寅)=2 in BRANCHES array (0-based), so:
  const branchIdx = mod(2 + (idxFromTiger-1), 12);
  // Stem for months depends on year stem:
  // Year stem groups: 甲己起丙, 乙庚起戊, 丙辛起庚, 丁壬起壬, 戊癸起甲 for 寅月
  const startStemForTiger = { // returns a stem index for Tiger month
    0:2, 5:2, // Jia or Ji -> Bing(2)
    1:4, 6:4, // Yi or Geng -> Wu(4)
    2:6, 7:6, // Bing or Xin -> Geng(6)
    3:8, 8:8, // Ding or Ren -> Ren(8)
    4:0, 9:0  // Wu or Gui -> Jia(0)
  };
  const tigerStemStart = startStemForTiger[yearStemIdx];
  const stemIdx = mod(tigerStemStart + (idxFromTiger-1), 10);
  return [stemIdx, branchIdx];
}

function julianDayNumber(y,m,d){ // Gregorian to JDN (at 0h UTC)
  // m: 1..12
  const a = Math.floor((14 - m)/12);
  const y2 = y + 4800 - a;
  const m2 = m + 12*a - 3;
  let jdn = d + Math.floor((153*m2 + 2)/5) + 365*y2 + Math.floor(y2/4) - Math.floor(y2/100) + Math.floor(y2/400) - 32045;
  return jdn;
}
function sexagenaryDay(y,m,d){
  const jdn = julianDayNumber(y,m,d);
  // Common approximation: JiaZi day index when (JDN + 49) % 60 == 0
  const idx60 = mod(jdn + 49, 60); // 0..59 where 0=JiaZi
  const stemIdx = idx60 % 10;
  const branchIdx = idx60 % 12;
  return [stemIdx, branchIdx];
}
function hourBranchIndex(hour){ // local hour 0..23 -> Zi starts at 23:00-00:59
  // We'll map 23,0 => Zi; 1,2 => Chou; etc.
  const slot = Math.floor(((hour + 1) % 24) / 2); // 0..11
  return slot; // 0=Zi,1=Chou,...
}
function hourStemIndex(dayStemIdx, hourBranchIdx){
  // Hour stem depends on day stem group:
  // 甲己日起甲子时; 乙庚日起丙子时; 丙辛日起戊子时; 丁壬日起庚子时; 戊癸日起壬子时
  const startStemForZi = {
    0:0, 5:0, // Jia/Ji -> Jia
    1:2, 6:2, // Yi/Geng -> Bing
    2:4, 7:4, // Bing/Xin -> Wu
    3:6, 8:6, // Ding/Ren -> Geng
    4:8, 9:8  // Wu/Gui -> Ren
  };
  const start = startStemForZi[dayStemIdx];
  return mod(start + hourBranchIdx, 10);
}
function mod(n,m){ return ((n % m) + m) % m; }

function elementsFromPillars(pillars){
  // pillars = [{stemIdx, branchIdx}, ...]
  const counts = {Wood:0, Fire:0, Earth:0, Metal:0, Water:0};
  pillars.forEach(p=>{
    const sEl = STEM_TO_ELEMENT[STEMS[p.stemIdx]];
    const bEl = BRANCH_TO_ELEMENT[BRANCHES[p.branchIdx]];
    counts[sEl] += 1;
    counts[bEl] += 1;
  });
  return counts;
}

function autoFourPillarsFromInput(dateStr, timeStr, utcOffsetMinutes){
  if(!dateStr) throw new Error("Missing date");
  const [y,m,d] = dateStr.split("-").map(x=>parseInt(x,10));
  let hr=12, min=0;
  if (timeStr){
    const parts = timeStr.split(":");
    hr = parseInt(parts[0]||"12",10);
    min = parseInt(parts[1]||"0",10);
  }
  // Construct UTC date from local time and offset
  // local time = UTC + offset => UTC = local - offset
  const local = new Date(Date.UTC(y, (m-1), d, hr, min));
  const utcMillis = local.getTime() - utcOffsetMinutes*60*1000;
  const utcDate = new Date(utcMillis);

  // Year pillar
  const yAdj = lichunAdjustedYear(utcDate);
  const [yStem, yBranch] = sexagenaryYear(yAdj);

  // Month pillar
  const [mStem, mBranch] = monthPillar(yStem, utcDate);

  // Day pillar (use UTC date for JDN at 0h UTC of this day)
  const [dStem, dBranch] = sexagenaryDay(utcDate.getUTCFullYear(), utcDate.getUTCMonth()+1, utcDate.getUTCDate());

  // Hour pillar
  const hb = hourBranchIndex(local.getUTCHours ? local.getUTCHours() : utcDate.getUTCHours()); // using local's UTC hours not available; fallback to utcDate hours
  const hBranch = hb;
  const hStem = hourStemIndex(dStem, hBranch);

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
