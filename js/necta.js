(function(){
  var C = window.JawabuCalc, fmt = C.fmt;
  var $ = function(id){ return document.getElementById(id); };

  var ICON_GO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';
  var ICON_COPY = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';

  /* ================= Vichupo ================= */
  var tabs = document.querySelectorAll('.tabs [data-tab]'), panels = {find: $('panelFind'), div: $('panelDiv')};
  function showTab(t){
    tabs.forEach(function(b){ b.setAttribute('aria-selected', b.getAttribute('data-tab') === t ? 'true' : 'false'); });
    panels.find.hidden = t !== 'find'; panels.div.hidden = t !== 'div';
    try{ history.replaceState(null, '', t === 'div' ? '#division' : location.pathname + location.search); }catch(e){}
  }
  tabs.forEach(function(b){ b.addEventListener('click', function(){ showTab(b.getAttribute('data-tab')); }); });

  var toastEl, toastT;
  function toast(msg){
    if(!toastEl){ toastEl = document.createElement('div'); toastEl.className = 'cm-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 2200);
  }
  function copy(text, ok){
    function fallback(){
      var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      try{ document.execCommand('copy'); toast(ok); }catch(e){ toast('Imeshindwa kunakili.'); }
      document.body.removeChild(t);
    }
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function(){ toast(ok); }, fallback);
    else fallback();
  }

  /* ================= 1. TAFUTA MATOKEO ================= */
  var EX = {
    psle:  {name: 'Darasa la Saba', ph: 'Mfano: PS0203141-0012', eg: 'Namba ya Darasa la Saba: namba ya shule (PS + tarakimu 7), kisha namba yako. Mfano PS0203141-0012.'},
    csee:  {name: 'Kidato cha Nne', ph: 'Mfano: S0101/0001/2024', eg: 'Namba ya mtahiniwa kama ilivyo kwenye kadi, mfano S0101/0001. Mwaka unaweza kuwa mwishoni.'},
    acsee: {name: 'Kidato cha Sita', ph: 'Mfano: S0101/0001/2024', eg: 'Namba ya mtahiniwa kama ilivyo kwenye kadi, mfano S0101/0001. Mwaka unaweza kuwa mwishoni.'}
  };
  var YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020];
  function host(y){ return y >= 2026 ? 'https://matokeo.necta.go.tz' : 'https://onlinesys.necta.go.tz'; }
  function schoolUrl(ex, y, code){
    code = code.toLowerCase();
    return host(y) + '/results/' + y + '/' + ex + '/results/' + (ex === 'psle' ? 'shl_' : '') + code + '.htm';
  }
  function indexUrl(ex, y){ return host(y) + '/results/' + y + '/' + ex + (ex === 'psle' ? '/psle.htm' : '/index.htm'); }
  var SEARCH_URL = 'https://www.necta.go.tz/search_results';

  var ex = 'csee', sNo = $('sNo'), sYear = $('sYear'), findOut = $('findOut'), sEg = $('sEg');
  var userPickedYear = false;
  sYear.innerHTML = YEARS.map(function(y){ return '<option value="' + y + '"' + (y === 2025 ? ' selected' : '') + '>' + y + '</option>'; }).join('');

  function parseNo(raw){
    var s = String(raw).toUpperCase().replace(/\s+/g, '').replace(/[–—]/g, '-');
    if(!s) return null;
    var m, o = {};
    if((m = /^(PS\d{7})(?:[-\/](\d{1,4}))?(?:[-\/](20\d\d))?$/.exec(s))){
      o.ex = 'psle'; o.school = m[1]; o.cand = m[2] ? m[1] + '-' + m[2] : ''; o.year = m[3] ? +m[3] : 0; return o;
    }
    if((m = /^([SP]\d{4})(?:[-\/](\d{3,4}))?(?:[-\/](20\d\d))?$/.exec(s))){
      o.school = m[1]; o.cand = m[2] ? m[1] + '/' + m[2] : ''; o.year = m[3] ? +m[3] : 0; return o;
    }
    return null;
  }

  function setEx(e){
    ex = e;
    document.querySelectorAll('#exSeg [data-ex]').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-ex') === e ? 'true' : 'false'); });
    sNo.placeholder = EX[e].ph; sEg.textContent = EX[e].eg;
  }
  document.querySelectorAll('#exSeg [data-ex]').forEach(function(b){ b.addEventListener('click', function(){
    var e = b.getAttribute('data-ex'), p = parseNo(sNo.value);
    if(p && ((p.ex === 'psle') !== (e === 'psle'))) sNo.value = '';   // namba haingani na mtihani mpya
    setEx(e); renderFind();
  }); });
  sYear.addEventListener('change', function(){ userPickedYear = true; renderFind(); });

  var cur = null; // {ex, y, school, cand}
  function renderFind(){
    var p = parseNo(sNo.value);
    cur = null;
    if(!sNo.value.trim()){
      findOut.innerHTML = '<div class="find-hint">Andika namba ya mtahiniwa, kiungo rasmi cha NECTA kitatokea hapa.</div>'; return;
    }
    if(!p){
      findOut.innerHTML = '<div class="find-hint">Namba haionekani sawa. Tumia muundo kama <b>' + (ex === 'psle' ? 'PS0203141-0012' : 'S0101/0001') + '</b>.</div>'; return;
    }
    if(p.ex && p.ex !== ex) setEx(p.ex);
    else if(!p.ex && ex === 'psle') setEx('csee');
    if(p.year && YEARS.indexOf(p.year) >= 0){ sYear.value = String(p.year); userPickedYear = true; }
    var y = +sYear.value;
    cur = {ex: ex, y: y, school: p.school, cand: p.cand};
    var url = schoolUrl(ex, y, p.school);
    findOut.innerHTML =
      '<div class="chips"><span class="chip"><small>Mtihani</small>' + EX[ex].name + '</span><span class="chip"><small>Shule</small>' + p.school + '</span><span class="chip"><small>Mwaka</small>' + y + '</span>' +
        (p.cand ? '<span class="chip"><small>Namba</small>' + p.cand + '</span>' : '') + '</div>' +
      '<a class="go" id="goSchool" href="' + url + '" target="_blank" rel="noopener noreferrer">' + ICON_GO + 'Fungua matokeo ya shule (NECTA)</a>' +
      (p.cand ? '<button type="button" class="ghost" id="copyNo">' + ICON_COPY + 'Nakili namba yangu ' + p.cand + '</button>' : '') +
      '<a class="ghost" href="' + indexUrl(ex, y) + '" target="_blank" rel="noopener noreferrer">' + ICON_GO + 'Orodha ya shule za mwaka ' + y + '</a>' +
      '<a class="ghost" href="' + SEARCH_URL + '" target="_blank" rel="noopener noreferrer">' + ICON_GO + 'Tafuta kwa NECTA (namba ya mtahiniwa)</a>' +
      '<p class="tip">Ukurasa wa NECTA unaonyesha shule nzima. Tafuta namba yako ndani yake kwa Ctrl+F (kompyuta) au "Find in page" (simu).</p>';
    var cp = $('copyNo'); if(cp) cp.addEventListener('click', function(){ copy(p.cand, 'Namba imenakiliwa. Ibandike kwenye utafutaji wa ukurasa.'); });
    var go = $('goSchool'); if(go) go.addEventListener('click', function(){ saveRecent(); });
  }
  sNo.addEventListener('input', function(){ renderFind(); });

  /* ---- zilizotafutwa hivi karibuni (kifaa hiki tu) ---- */
  var RKEY = 'jawabu_necta_recent_v1', recent = [];
  try{ recent = JSON.parse(localStorage.getItem(RKEY) || '[]'); if(!Array.isArray(recent)) recent = []; }catch(e){ recent = []; }
  function saveRecentStore(){ try{ localStorage.setItem(RKEY, JSON.stringify(recent)); }catch(e){} }
  function saveRecent(){
    if(!cur) return;
    var no = sNo.value.trim().toUpperCase();
    recent = recent.filter(function(r){ return !(r.ex === cur.ex && r.y === cur.y && r.no === no); });
    recent.unshift({ex: cur.ex, y: cur.y, no: no}); if(recent.length > 6) recent.length = 6;
    saveRecentStore(); renderRecent();
  }
  function renderRecent(){
    var box = $('recentBox');
    if(!box){
      box = document.createElement('div'); box.id = 'recentBox'; box.className = 'recent';
      $('findForm').appendChild(box);
      box.addEventListener('click', function(e){
        var b = e.target.closest('[data-r]');
        if(b){ var r = recent[+b.getAttribute('data-r')]; if(!r) return; setEx(r.ex); sNo.value = r.no; sYear.value = String(r.y); userPickedYear = true; renderFind(); return; }
        if(e.target.closest('#recentClear')){
          JawabuConfirm('Futa orodha ya ulizotafuta?', function(){ recent = []; saveRecentStore(); renderRecent(); });
        }
      });
    }
    if(!recent.length){ box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = '<h3>Ulizotafuta hivi karibuni <button type="button" id="recentClear">Futa zote</button></h3>' +
      recent.map(function(r, i){ return '<button type="button" class="rc" data-r="' + i + '">' + EX[r.ex].name.replace('Kidato cha ', 'K').replace('Darasa la Saba', 'DSaba') + ' • ' + r.no + ' • ' + r.y + '</button>'; }).join('');
  }

  $('findForm').addEventListener('submit', function(e){
    e.preventDefault();
    if(!cur){ sNo.focus(); return; }
    saveRecent();
    window.open(schoolUrl(cur.ex, cur.y, cur.school), '_blank', 'noopener');
  });
  $('sClear').addEventListener('click', function(){ sNo.value = ''; userPickedYear = false; sYear.value = '2025'; renderFind(); sNo.focus(); });
  renderRecent();

  /* ================= 2. KOKOTOA DIVISION ================= */
  var LV = {
    csee: {
      name: 'Kidato cha Nne', pts: {A: 1, B: 2, C: 3, D: 4, F: 5}, grades: ['A', 'B', 'C', 'D', 'F'], need: 7,
      subs: [['kis', 'Kiswahili'], ['eng', 'English'], ['civ', 'Civics'], ['his', 'History'], ['geo', 'Geography'], ['mat', 'Basic Mathematics'],
             ['bio', 'Biology'], ['che', 'Chemistry'], ['phy', 'Physics'], ['bk', 'Book-keeping'], ['com', 'Commerce'], ['rel', 'Dini (Bible / Islamic Knowledge)']],
      note: 'Chagua daraja la kila somo ulilofanya. Masomo 7 bora ndiyo yanayohesabiwa. Acha tupu yale ambayo hukufanya.',
      ranges: [['I', 7, 17, '#16A34A'], ['II', 18, 21, '#22C55E'], ['III', 22, 25, '#F59E0B'], ['IV', 26, 33, '#F97316'], ['0', 34, 35, '#DC2626']]
    },
    acsee: {
      name: 'Kidato cha Sita', pts: {A: 1, B: 2, C: 3, D: 4, E: 5, S: 6, F: 7}, grades: ['A', 'B', 'C', 'D', 'E', 'S', 'F'], need: 3,
      subs: [['p1', 'Somo kuu la 1'], ['p2', 'Somo kuu la 2'], ['p3', 'Somo kuu la 3']],
      note: 'Weka daraja la masomo yako 3 makuu (principal). General Studies na masomo ya nyongeza (subsidiary) hayahesabiwi kwenye Division.',
      ranges: [['I', 3, 9, '#16A34A'], ['II', 10, 12, '#22C55E'], ['III', 13, 17, '#F59E0B'], ['IV', 18, 19, '#F97316'], ['0', 20, 21, '#DC2626']]
    },
    psle: {
      name: 'Darasa la Saba', need: 6,
      subs: [['kis', 'Kiswahili'], ['eng', 'English Language'], ['maa', 'Maarifa ya Jamii na Stadi za Kazi'], ['his', 'Hisabati'], ['say', 'Sayansi na Teknolojia'], ['ura', 'Uraia na Maadili']],
      note: 'Weka alama ulizopata kwa kila somo, kati ya 0 na 50.'
    }
  };
  var BANDS = [['A', 41], ['B', 31], ['C', 21], ['D', 11], ['E', 0]];
  function bandOf(avg){ for(var i = 0; i < BANDS.length; i++) if(avg >= BANDS[i][1]) return BANDS[i][0]; return 'E'; }
  function divOf(L, t){
    var r = LV[L].ranges;
    for(var i = 0; i < r.length; i++) if(t <= r[i][2]) return i;
    return r.length - 1;
  }

  function decode(s){
    var m = {};
    String(s || '').split(',').forEach(function(p){ var a = p.split(':'); if(a.length === 2 && a[0]) m[a[0]] = a[1]; });
    return m;
  }
  function encode(m){ return Object.keys(m).map(function(k){ return k + ':' + m[k]; }).join(','); }
  function level(v){ return LV[v.lvl] ? v.lvl : 'csee'; }

  function haveCount(v){
    var L = level(v), m = decode(v.g), n = 0;
    LV[L].subs.forEach(function(s){
      var x = m[s[0]];
      if(L === 'psle'){ if(x !== undefined && x !== '' && !isNaN(+x)) n++; }
      else if(x && LV[L].pts[x]) n++;
    });
    return n;
  }

  function calc(v){
    var L = level(v), m = decode(v.g), d = LV[L], list = [];
    if(L === 'psle'){
      var total = 0;
      d.subs.forEach(function(s){
        var x = Math.max(0, Math.min(50, Math.round(+m[s[0]] || 0)));
        total += x; list.push({k: s[0], name: s[1], mark: x, grade: bandOf(x)});
      });
      var avg = total / d.subs.length;
      return {L: L, list: list, total: total, avg: avg, grade: bandOf(avg)};
    }
    d.subs.forEach(function(s){
      var g = m[s[0]];
      if(g && d.pts[g]) list.push({k: s[0], name: s[1], g: g, p: d.pts[g]});
    });
    var sorted = list.slice().sort(function(a, b){ return a.p - b.p; });
    var used = sorted.slice(0, d.need), usedKeys = {};
    used.forEach(function(u){ usedKeys[u.k] = 1; });
    var sum = used.reduce(function(a, b){ return a + b.p; }, 0);
    var di = divOf(L, sum);
    return {L: L, list: list, used: used, usedKeys: usedKeys, total: sum, di: di, div: d.ranges[di][0]};
  }

  function barHtml(L, total){
    var rg = LV[L].ranges, min = rg[0][1], max = rg[rg.length - 1][2], span = max - min + 1;
    var segs = rg.map(function(r){ return '<i style="width:' + ((r[2] - r[1] + 1) / span * 100) + '%;background:' + r[3] + '"></i>'; }).join('');
    var lbls = rg.map(function(r){ return '<span style="width:' + ((r[2] - r[1] + 1) / span * 100) + '%">' + r[0] + '</span>'; }).join('');
    var pos = Math.max(0, Math.min(100, (total - min + 0.5) / span * 100));
    return '<div class="dv-wrap"><span class="dv-mark" style="left:' + pos + '%"></span><div class="dv-bar" aria-hidden="true">' + segs + '</div><div class="dv-lbl" aria-hidden="true">' + lbls + '</div></div>';
  }

  function adviceHtml(r){
    var L = r.L, rg = LV[L].ranges;
    if(r.di === 0) return '<div class="advice ok"><b>Hongera!</b> Umefika Division I.</div>';
    var target = rg[r.di - 1], need = r.total - target[2];
    var weak = r.used.slice().sort(function(a, b){ return b.p - a.p; }).filter(function(x){ return x.p > 1; }).slice(0, 3)
      .map(function(x){ return x.name + ' (' + x.g + ')'; }).join(', ');
    return '<div class="advice">Unahitaji kupunguza points <b>' + need + '</b> ili ufike Division <b>' + target[0] + '</b>. Kuboresha daraja moja la somo kunapunguza point 1.' +
      (weak ? ' Masomo ya kuanza nayo: ' + weak + '.' : '') + '</div>';
  }

  function view(v, r, h){
    var L = r.L, d = LV[L];
    if(L === 'psle'){
      var rows = r.list.map(function(x){ return '<tr><td>' + x.name + '</td><td>' + x.mark + ' / 50</td><td>' + x.grade + '</td></tr>'; }).join('');
      return '<div class="res-main"><small>Daraja la jumla (makadirio)</small><div class="dv-big"><strong>Daraja ' + r.grade + '</strong><span class="dv-pts">Wastani<b>' + (Math.round(r.avg * 10) / 10) + ' / 50</b></span></div></div>' +
        '<ul class="res-rows"><li><span>Jumla ya alama</span><b>' + r.total + ' / ' + (d.subs.length * 50) + '</b></li><li><span>Wastani wa alama</span><b>' + (Math.round(r.avg * 100) / 100) + ' / 50</b></li></ul>' +
        '<details class="steps" open><summary>Daraja la kila somo</summary><div class="tbl-wrap"><table class="tbl cnt"><thead><tr><th>Somo</th><th>Alama</th><th>Daraja</th></tr></thead><tbody>' + rows + '</tbody></table></div></details>' +
        '<p class="rate">Mipaka: A 41–50, B 31–40, C 21–30, D 11–20, E 0–10. Ni makadirio, rasmi ni NECTA.</p>' + h.links([]);
    }
    var extra = r.list.length - r.used.length;
    var rows2 = r.list.slice().sort(function(a, b){ return a.p - b.p; }).map(function(x){
      var u = r.usedKeys[x.k];
      return '<tr class="' + (u ? 'used' : 'out') + '"><td>' + x.name + '</td><td>' + x.g + '</td><td>' + x.p + '</td><td>' + (u ? 'Imehesabiwa' : 'Haikuhesabiwa') + '</td></tr>';
    }).join('');
    return '<div class="res-main"><small>' + d.name + ' · ' + d.need + ' masomo ' + (L === 'csee' ? 'bora' : 'makuu') + '</small><div class="dv-big"><strong>Division ' + r.div + '</strong><span class="dv-pts">Points<b>' + r.total + '</b></span></div></div>' +
      barHtml(L, r.total) + adviceHtml(r) +
      '<details class="steps" open><summary>Masomo na pointi zake' + (extra > 0 ? ' (' + extra + ' hayakuhesabiwa)' : '') + '</summary><div class="tbl-wrap"><table class="tbl cnt"><thead><tr><th>Somo</th><th>Daraja</th><th>Pointi</th><th></th></tr></thead><tbody>' + rows2 + '</tbody></table></div></details>' +
      h.links([]);
  }

  var cfg = {
    form: 'divForm', result: 'divResult', key: 'jawabu_necta_history_v1',
    fields: [
      {id: 'lvl', type: 'text', q: 'kiwango', def: 'csee', optional: true},
      {id: 'g', type: 'text', q: 'g', optional: true}
    ],
    empty: 'Jaza daraja zako, jibu litaonekana hapa papo hapo.',
    valid: function(v){ return haveCount(v) >= LV[level(v)].need; },
    calc: calc,
    shareTitle: 'Matokeo yangu ya NECTA (makadirio) - Jawabu TZ',
    shareText: function(v, r){
      if(r.L === 'psle') return LV.psle.name + ': Daraja ' + r.grade + ', wastani ' + (Math.round(r.avg * 10) / 10) + '/50 (jumla ' + r.total + ')';
      return LV[r.L].name + ': Division ' + r.div + ', points ' + r.total;
    },
    view: view,
    histRow: function(v, r){
      return {title: LV[r.L].name, label: r.L === 'psle' ? 'Daraja' : 'Division', value: r.L === 'psle' ? r.grade + ' • ' + (Math.round(r.avg * 10) / 10) : r.div + ' • ' + r.total};
    },
    histDetail: function(v, r){
      if(r.L === 'psle') return '<li><span>Jumla ya alama</span><b>' + r.total + ' / 300</b></li><li><span>Wastani</span><b>' + (Math.round(r.avg * 10) / 10) + ' / 50</b></li><li><span>Daraja</span><b>' + r.grade + '</b></li>';
      return '<li><span>Division</span><b>' + r.div + '</b></li><li><span>Points</span><b>' + r.total + '</b></li>' +
        r.used.map(function(x){ return '<li><span>' + x.name + '</span><b>' + x.g + ' (' + x.p + ')</b></li>'; }).join('');
    },
    onRender: function(v){
      syncUI(v);
      var L = level(v), n = haveCount(v), need = LV[L].need;
      cfg.empty = n > 0 ? 'Umejaza masomo ' + n + ' kati ya ' + need + '. Ongeza ' + (need - n) + ' zaidi ili kuona jibu.' : 'Jaza daraja za masomo ' + need + ' au zaidi, jibu litaonekana hapa papo hapo.';
    }
  };

  /* ---- UI ya masomo ---- */
  var rowsEl = $('rows'), lvlEl = $('lvl'), gEl = $('g'), noteEl = $('rowsNote'), builtFor = '';
  function fire(el){ el.dispatchEvent(new Event('input', {bubbles: true})); }

  function buildRows(L){
    var d = LV[L];
    noteEl.textContent = d.note;
    rowsEl.innerHTML = d.subs.map(function(s){
      if(L === 'psle') return '<div class="sub-row"><span class="nm">' + s[1] + '</span><input class="mk" type="text" inputmode="numeric" maxlength="2" placeholder="0-50" data-s="' + s[0] + '" aria-label="Alama za ' + s[1] + '"></div>';
      return '<div class="sub-row"><span class="nm">' + s[1] + '</span><span class="grs" role="group" aria-label="Daraja la ' + s[1] + '">' +
        d.grades.map(function(g){ return '<button type="button" class="gb" data-s="' + s[0] + '" data-g="' + g + '" aria-pressed="false">' + g + '</button>'; }).join('') + '</span></div>';
    }).join('');
    builtFor = L;
  }
  function syncUI(v){
    var L = level(v);
    if(builtFor !== L) buildRows(L);
    document.querySelectorAll('#lvSeg [data-lv]').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-lv') === L ? 'true' : 'false'); });
    var m = decode(v.g);
    if(L === 'psle'){
      rowsEl.querySelectorAll('.mk').forEach(function(i){
        var val = m[i.getAttribute('data-s')]; val = val === undefined ? '' : String(val);
        if(document.activeElement !== i && i.value !== val) i.value = val;
      });
    } else {
      rowsEl.querySelectorAll('.gb').forEach(function(b){
        b.setAttribute('aria-pressed', m[b.getAttribute('data-s')] === b.getAttribute('data-g') ? 'true' : 'false');
      });
    }
  }
  $('lvSeg').addEventListener('click', function(e){
    var b = e.target.closest('[data-lv]'); if(!b) return;
    var L = b.getAttribute('data-lv'); if(L === level({lvl: lvlEl.value})) return;
    lvlEl.value = L; gEl.value = ''; fire(lvlEl);
  });
  rowsEl.addEventListener('click', function(e){
    var b = e.target.closest('.gb'); if(!b) return;
    var m = decode(gEl.value), s = b.getAttribute('data-s'), g = b.getAttribute('data-g');
    if(m[s] === g) delete m[s]; else m[s] = g;
    gEl.value = encode(m); fire(gEl);
  });
 rowsEl.addEventListener('input', function(e){
    var i = e.target.closest('.mk'); if(!i) return;
    var n = i.value.replace(/[^\d]/g, '').slice(0, 2); if(n !== '' && +n > 50) n = '50';
    i.value = n;
    var m = decode(gEl.value), s = i.getAttribute('data-s');
    if(n === '') delete m[s]; else m[s] = n;
    gEl.value = encode(m); fire(gEl);
  });

  C.init(cfg);

  // fungua kichupo cha Division kama kiungo kina ?kiwango= au #division
  try{
    var q = new URLSearchParams(location.search);
    if(location.hash === '#division' || q.get('kiwango') || q.get('g') || q.get('tab') === 'division') showTab('div');
    if(q.get('no')){ sNo.value = q.get('no'); if(EX[q.get('ex')]) setEx(q.get('ex')); if(YEARS.indexOf(+q.get('y')) >= 0) sYear.value = q.get('y'); renderFind(); }
  }catch(e){}
})();