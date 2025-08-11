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
