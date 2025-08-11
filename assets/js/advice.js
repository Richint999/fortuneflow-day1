
// FortuneFlow Advice (Health, Love, Career, Wealth) based on Five Elements
// Injects into report page if ff_result_en exists in localStorage
(function(){
  const GEN = { Wood:"Fire", Fire:"Earth", Earth:"Metal", Metal:"Water", Water:"Wood" };   // 相生
  const KE  = { Wood:"Earth", Earth:"Water", Water:"Fire", Fire:"Metal", Metal:"Wood" };   // 相克
  const ORDER = ["Wood","Fire","Earth","Metal","Water"];

  const ORGANS = {
    Wood: {zh:"肝胆", tips:[
      "作息规律，尽量在23:00前入睡，保护肝胆代谢",
      "每日做肩颈和髋屈伸拉伸，舒筋活络",
      "饮食多选深绿色蔬菜、适量酸味（如柠檬、山楂），少油炸与烈酒"
    ]},
    Fire: {zh:"心小肠", tips:[
      "限制晚间咖啡因与高糖，减轻心脏负担",
      "每天10–20分钟有氧（步行、骑行、游泳）+ 呼吸训练",
      "情绪起伏大时先暂停沟通，先降温再表达"
    ]},
    Earth:{zh:"脾胃", tips:[
      "偏温热、少生冷，规律三餐，晚餐不过饱",
      "核心与腿部力量训练，每周2–3次",
      "减少精制糖与过度零食，关注餐后困倦"
    ]},
    Metal:{zh:"肺大肠", tips:[
      "晨间户外步行与深呼吸，改善肺气",
      "饮水+高纤维（蔬果/全谷）促进肠道蠕动",
      "注意皮肤与鼻腔保湿，换季时加强防护"
    ]},
    Water:{zh:"肾膀胱", tips:[
      "保证7.5–9小时睡眠，尽量在23:00前入睡",
      "充足饮水，适度盐分，避免久坐多动髋/腰背",
      "安排劳逸结合，连续工作60–90分钟要休息"
    ]}
  };

  const LOVE = {
    Wood:{traits:["生长","主动","规划"], dos:["共同设立长期目标与里程碑","给对方成长空间，少催促"], donts:["避免不耐烦或指责","避免单方面制定计划"]},
    Fire:{traits:["热情","表达","冒险"], dos:["安排有趣新鲜的约会场景","先倾听后表达，给情绪“冷却期”"], donts:["避免冲动的言语伤害","避免把争论升级为输赢"]},
    Earth:{traits:["踏实","照顾","稳定"], dos:["多用行动表达关心（接送、做饭）","留出即兴时间，定期小旅行"], donts:["避免过度控制或占有","避免凡事求稳而忽略浪漫"]},
    Metal:{traits:["标准","秩序","理性"], dos:["清晰沟通边界与期待","固定“二人时光”仪式感"], donts:["避免挑剔与打分式沟通","避免把问题法律化、条款化"]},
    Water:{traits:["敏感","洞察","包容"], dos:["安排高质量深聊时间","用小记录/卡片表达在乎"], donts:["避免逃避冲突","避免过度牺牲而不表达需要"]}
  };

  const CAREER_STYLE = {
    Wood:["适合战略/产品/教育类岗位；以“增长”和“学习曲线”为导向","把大型目标拆解为季度冲刺，避免同时开太多项目"],
    Fire:["适合销售/市场/公关/领导岗位；需要舞台与速度","设置决策冷静期和复盘机制，防止情绪化"],
    Earth:["适合运营/项目管理/财务/供应链；稳中求进","建立周/月度例行检查表，持续优化流程"],
    Metal:["适合法务/审计/工程/质量；崇尚标准化与精确","留出创新与试错窗口，避免僵化"],
    Water:["适合研究/数据/设计/咨询；善于跨界与整合","定期做优先级排序，防止分散与拖延"]
  };

  const WEALTH = {
    Wood:{profile:"成长型", tips:["组合里保留优质成长与教育/科技主题","年度再平衡，避免一味“加码扩张”","学习基本面框架：现金流、壁垒、复利"]},
    Fire:{profile:"进取型/动量型", tips:["明确止损与仓位上限，写成规则","分散到不同资产，避免“孤注一掷”","交易后复盘，不做情绪加仓"]},
    Earth:{profile:"稳健型/现金流", tips:["优先紧急备用金与稳健现金流标的","设置自动定投，抗波动，坚持长期","每年检视保单与负债，降成本"]},
    Metal:{profile:"规则型/量化", tips:["以规则表驱动投资（如再平衡、估值阈）","避免过度优化历史数据，关注稳健性","记录投资日志，定期检验纪律执行"]},
    Water:{profile:"灵活型/对冲", tips:["擅长跨市场与多策略，注意信息筛选","设定“信息饮食”，控制频繁换仓","构建预算与现金流表，避免漂移"]}
  };

  function topKey(counts){ return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0]; }
  function lowKey(counts){ return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(-1)[0][0]; }
  function total(counts){ return ORDER.reduce((s,k)=>s+(counts[k]||0),0); }
  function normalized(counts){
    const S=total(counts)||1;
    const obj={}; ORDER.forEach(k=>obj[k]=((counts[k]||0)/S).toFixed(2));
    return obj;
  }

  function buildSection(title, id){
    const sec = document.createElement('div');
    sec.className = 'subsec';
    sec.innerHTML = `<h3>${title}</h3><div id="${id}"></div>`;
    return sec;
  }

  function bullets(lines){
    const ul = document.createElement('ul');
    ul.className = 'bullets';
    lines.forEach(t=>{ const li=document.createElement('li'); li.textContent=t; ul.appendChild(li); });
    return ul;
  }

  function renderHealth(host, counts){
    const most = topKey(counts), least = lowKey(counts);
    const dom = ORGANS[most];
    const weakenBy = KE[most];        // 抑制强项
    const drainTo  = GEN[most];       // 泄去多余
    const lines = [
      `重点关照：${most}（${dom.zh}）`,
      `平衡法则：以 ${weakenBy} 来制衡，以 ${drainTo} 来疏泄（相克为刹车，相生为泄洪）`
    ].concat(dom.tips);
    host.appendChild(bullets(lines));
  }

  function renderLove(host, counts){
    const most = topKey(counts), least = lowKey(counts);
    const L = LOVE[most];
    const lines = [
      `你的主导气质：${most}（${L.traits.join(" / ")}）`,
      `关系里需要补齐：${least}（多引入其特质与节奏）`,
      "建议："
    ].concat(L.dos.map(x=>"✔ "+x)).concat(L.donts.map(x=>"✘ "+x));
    host.appendChild(bullets(lines));
  }

  function renderCareer(host, counts){
    const most = topKey(counts), least = lowKey(counts);
    const lines = [
      `工作风格：以 ${most} 为主，注意 ${least} 维度的短板`,
      ...CAREER_STYLE[most]
    ];
    host.appendChild(bullets(lines));
  }

  function renderWealth(host, counts){
    const most = topKey(counts), least = lowKey(counts);
    const w = WEALTH[most];
    const lines = [
      `金钱性格：${w.profile}（主导：${most}；需补：${least}）`,
      "行动要点：",
      ...w.tips
    ];
    host.appendChild(bullets(lines));
  }

  
  function ensureAdviceSections(){
    const pro = document.getElementById('pro-sections');
    if(!pro) return null;
    // Try to find existing
    let box = document.getElementById('advice-box');
    if(!box){
      box = document.createElement('section');
      box.id = 'advice-box';
      box.className = 'subsec';
      box.innerHTML = `<h2>个性化建议（Based on Five Elements）</h2>`;
      // Place BEFORE the Lucky Windows section if we can find it
      let lucky = document.getElementById('windows');
      if(lucky && lucky.parentElement && lucky.parentElement.parentElement === pro){
        pro.insertBefore(box, lucky.parentElement);
      }else{
        pro.appendChild(box);
      }
    } else {
      box.innerHTML = `<h2>个性化建议（Based on Five Elements）</h2>`;
    }
    const secHealth = buildSection("健康 / Health", "adv-health");
    const secLove   = buildSection("爱情 / Love", "adv-love");
    const secCareer = buildSection("事业 / Career", "adv-career");
    const secWealth = buildSection("财运 / Wealth", "adv-wealth");
    box.appendChild(secHealth); box.appendChild(secLove); box.appendChild(secCareer); box.appendChild(secWealth);
    return box;
  }
else {
      box.innerHTML = `<h2>个性化建议（Based on Five Elements）</h2>`;
    }
    const secHealth = buildSection("健康 / Health", "adv-health");
    const secLove   = buildSection("爱情 / Love", "adv-love");
    const secCareer = buildSection("事业 / Career", "adv-career");
    const secWealth = buildSection("财运 / Wealth", "adv-wealth");
    box.appendChild(secHealth); box.appendChild(secLove); box.appendChild(secCareer); box.appendChild(secWealth);
    return box;
  }

  function run(){
    try{
      const data = JSON.parse(localStorage.getItem('ff_result_en')||'null');
      if(!data || !data.counts) return;
      const pro = document.getElementById('pro-sections');
      if(!pro) return;
      // Respect paywall: only render when unlocked
      const isLocked = pro.classList.contains('lock');
      if(isLocked) return;
      ensureAdviceSections();
      renderHealth(document.getElementById('adv-health'), data.counts);
      renderLove(document.getElementById('adv-love'), data.counts);
      renderCareer(document.getElementById('adv-career'), data.counts);
      renderWealth(document.getElementById('adv-wealth'), data.counts);
    }catch(e){
      console.error("Advice render error:", e);
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    // Try after base report finished
    setTimeout(run, 60); // slight delay to allow paywall toggle
  });
})();
