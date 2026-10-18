(function(){
  var C = window.JawabuCalc, fmt = C.fmt;
  var $ = function(id){ return document.getElementById(id); };

  var GP = {'A': 5, 'B+': 4, 'B': 3, 'C': 2, 'D': 1, 'F': 0};
  var GRADES = ['A', 'B+', 'B', 'C', 'D', 'F'];
  var CLASSES = [ // [jina, kiwango cha chini cha GPA, rangi]
    ['First Class', 4.4, '#16A34A'], ['Upper Second', 3.5, '#22C55E'], ['Lower Second', 2.7, '#F59E0B'], ['Pass', 2.0, '#F97316'], ['Fail', 0, '#DC2626']
  ];
  var MAXROWS = 20;

  function f2(n){ return (Math.round(n * 100) / 100).toFixed(2); }
  function trunc1(n){ return Math.floor(n * 10 + 1e-9) / 10; }
  function classOf(gpa){
    var t = trunc1(gpa);
    for(var i = 0; i < CLASSES.length; i++) if(t >= CLASSES[i][1]) return i;
    return CLASSES.length - 1;
  }

  /* ---- mfumo wa data: "3:A,3:B+" ---- */
  function decode(s){
    return String(s || '').split(',').map(function(p){
      var a = p.split(':'), c = parseInt(a[0], 10);
      return (c > 0 && GP[a[1]] !== undefined) ? {c: c, g: a[1]} : null;
    }).filter(Boolean);
  }
  function encode(rows){
    return rows.filter(function(r){ return r.c > 0 && r.g; }).map(function(r){ return r.c + ':' + r.g; }).join(',');
  }

  function calc(v){
    var rows = decode(v.c), cr = 0, pts = 0;
    rows.forEach(function(r){ cr += r.c; pts += r.c * GP[r.g]; });
    var gpa = cr ? pts / cr : 0;
    var res = {rows: rows, cr: cr, pts: pts, gpa: gpa, ci: classOf(gpa)};
    var pc = v.pc || 0, pg = v.pg || 0;
    if(pc > 0 && pg > 0 && pg <= 5){
      var tc = pc + cr, tp = pg * pc + pts;
      res.cum = {gpa: tp / tc, cr: tc, pts: tp, ci: classOf(tp / tc)};
    }
    var base = res.cum || {gpa: gpa, cr: cr, pts: pts, ci: res.ci};
    res.base = base;
    // GPA inayohitajika muhula ujao (credits sawa na muhula huu)
    res.need = [];
    for(var i = base.ci - 1; i >= 0; i--){
      var target = CLASSES[i][1], nc = cr || 15;
      var req = (target * (base.cr + nc) - base.pts) / nc;
      res.need.push({name: CLASSES[i][0], target: target, req: req, nc: nc});
    }
    return res;
  }

  function barHtml(gpa){
    var segs = [[2.0, '#DC2626'], [0.7, '#F97316'], [0.8, '#F59E0B'], [0.9, '#22C55E'], [0.6, '#16A34A']];
    var tot = 5, html = segs.map(function(s){ return '<i style="width:' + (s[0] / tot * 100) + '%;background:' + s[1] + '"></i>'; }).join('');
    var lbl = [['Fail', 2.0], ['Pass', 0.7], ['LS', 0.8], ['US', 0.9], ['First', 0.6]].map(function(s){ return '<span style="width:' + (s[1] / tot * 100) + '%">' + s[0] + '</span>'; }).join('');
    var pos = Math.max(0, Math.min(100, gpa / tot * 100));
    return '<div class="dv-wrap"><span class="dv-mark" style="left:' + pos + '%"></span><div class="dv-bar" aria-hidden="true">' + html + '</div><div class="dv-lbl" aria-hidden="true">' + lbl + '</div></div>';
  }

  function view(v, r, h){
    var b = r.base, cls = CLASSES[b.ci];
    var rows = r.rows.map(function(x, i){
      return '<tr><td>Somo ' + (i + 1) + '</td><td>' + x.c + '</td><td>' + x.g + ' (' + GP[x.g] + ')</td><td>' + (x.c * GP[x.g]) + '</td></tr>';
    }).join('');
    var need = '';
    if(b.ci > 0){
      need = '<details class="steps"><summary>GPA ya kuhitaji muhula ujao</summary><ul class="res-rows need" style="padding:4px 14px 8px">' +
        r.need.map(function(n){
          return '<li><span>' + n.name + ' (' + n.target + ')</span><b>' + (n.req > 5 ? 'Haiwezekani muhula mmoja' : n.req <= 0 ? 'Tayari' : 'GPA ≥ ' + f2(n.req)) + '</b></li>';
        }).join('') + '<li><span style="color:var(--mut);font-size:.78rem">Kwa credits ' + r.need[0].nc + ' muhula ujao</span><b></b></li></ul></details>';
    } else need = '<div class="advice ok"><b>Hongera!</b> Uko kwenye First Class.</div>';
    return '<div class="res-main"><small>' + (r.cum ? 'GPA ya jumla (CGPA)' : 'GPA ya muhula huu') + '</small>' +
        '<div class="dv-big"><strong>' + f2(b.gpa) + '</strong><span class="dv-pts">Daraja<b>' + cls[0] + '</b></span></div></div>' +
      barHtml(b.gpa) +
      '<ul class="res-rows">' +
        '<li><span>GPA ya muhula huu</span><b>' + f2(r.gpa) + '</b></li>' +
        '<li><span>Credits za muhula huu</span><b>' + r.cr + '</b></li>' +
        (r.cum ? '<li><span>Jumla ya credits (zote)</span><b>' + r.cum.cr + '</b></li>' : '') +
      '</ul>' + need +
      '<details class="steps"><summary>Hesabu ya kila somo</summary><div class="tbl-wrap"><table class="tbl cnt"><thead><tr><th>Somo</th><th>Credits</th><th>Daraja</th><th>Credits × pointi</th></tr></thead><tbody>' + rows +
      '</tbody><tfoot><tr><td>Jumla</td><td>' + r.cr + '</td><td></td><td>' + r.pts + '</td></tr></tfoot></table></div></details>' +
      h.links([]);
  }

  /* ---- UI ya safu za masomo ---- */
  var rowsEl = $('gpRows'), cEl = $('c'), ui = [];
  function blank(){ return {c: 3, g: ''}; }
  function setRows(arr){ ui = arr.length ? arr : []; while(ui.length < 5) ui.push(blank()); draw(); }
  function draw(){
    rowsEl.innerHTML = ui.map(function(r, i){
      return '<div class="gp-row" data-i="' + i + '"><span class="nm">Somo ' + (i + 1) + '</span>' +
        '<input class="cr" type="text" inputmode="numeric" maxlength="2" value="' + (r.c || '') + '" aria-label="Credits za somo ' + (i + 1) + '">' +
        '<span class="grs" role="group" aria-label="Daraja la somo ' + (i + 1) + '">' +
          GRADES.map(function(g){ return '<button type="button" class="gb" data-g="' + g + '" aria-pressed="' + (r.g === g) + '">' + g + '</button>'; }).join('') +
        '</span>' +
        (ui.length > 1 ? '<button type="button" class="gp-x" data-x aria-label="Ondoa somo ' + (i + 1) + '">×</button>' : '<span></span>') + '</div>';
    }).join('');
    $('addRow').hidden = ui.length >= MAXROWS;
  }
  function push(){ cEl.value = encode(ui); cEl.dispatchEvent(new Event('input', {bubbles: true})); }
  function syncPressed(){
    rowsEl.querySelectorAll('.gp-row').forEach(function(row){
      var r = ui[+row.getAttribute('data-i')];
      row.querySelectorAll('.gb').forEach(function(b){ b.setAttribute('aria-pressed', r.g === b.getAttribute('data-g') ? 'true' : 'false'); });
    });
  }
  rowsEl.addEventListener('click', function(e){
    var row = e.target.closest('.gp-row'); if(!row) return;
    var i = +row.getAttribute('data-i'), gb = e.target.closest('.gb');
    if(gb){ var g = gb.getAttribute('data-g'); ui[i].g = ui[i].g === g ? '' : g; syncPressed(); push(); }
    else if(e.target.closest('[data-x]')){ ui.splice(i, 1); draw(); push(); }
  });
  rowsEl.addEventListener('input', function(e){
    var inp = e.target.closest('.cr'); if(!inp) return;
    var row = inp.closest('.gp-row'), n = inp.value.replace(/[^\d]/g, '').slice(0, 2);
    inp.value = n; ui[+row.getAttribute('data-i')].c = parseInt(n, 10) || 0; push();
  });
  $('addRow').addEventListener('click', function(){ if(ui.length < MAXROWS){ ui.push(blank()); draw(); } });

  var cfg = {
    form: 'gpaForm', result: 'gpaResult', key: 'jawabu_gpa_history_v1',
    fields: [
      {id: 'c', type: 'text', q: 'g', optional: true},
      {id: 'pg', type: 'dec', q: 'gpa', optional: true},
      {id: 'pc', type: 'int', q: 'cr', max: 400, optional: true}
    ],
    empty: 'Weka daraja za masomo yako, jibu litaonekana hapa papo hapo.',
    valid: function(v){ return decode(v.c).length > 0; },
    calc: calc,
    shareTitle: 'Hesabu yangu ya GPA - Jawabu TZ',
    shareText: function(v, r){
      var b = r.base;
      return 'GPA ya muhula: ' + f2(r.gpa) + ' (credits ' + r.cr + ')' + (r.cum ? '\nCGPA: ' + f2(r.cum.gpa) : '') + '\nDaraja: ' + CLASSES[b.ci][0];
    },
    view: view,
    histRow: function(v, r){ return {title: 'GPA ' + f2(r.base.gpa), label: 'Daraja', value: CLASSES[r.base.ci][0]}; },
    histDetail: function(v, r){
      return '<li><span>GPA ya muhula</span><b>' + f2(r.gpa) + '</b></li><li><span>Credits</span><b>' + r.cr + '</b></li>' +
        (r.cum ? '<li><span>CGPA</span><b>' + f2(r.cum.gpa) + '</b></li>' : '') +
        '<li><span>Daraja</span><b>' + CLASSES[r.base.ci][0] + '</b></li>';
    },
    onRender: function(v){
      // Ikiwa thamani imebadilishwa nje ya UI (historia, kiungo, Futa), jenga safu upya
      if(encode(ui) !== (v.c || '')) setRows(decode(v.c));
      if((v.pg || v.pc) && !$('prevBox').open) $('prevBox').open = true;
    }
  };

  setRows([]);
  C.init(cfg);
  $('clearBtn').addEventListener('click', function(){ setRows([]); $('prevBox').open = false; });
})();