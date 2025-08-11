var __tst_enabled = false;
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
