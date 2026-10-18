(function(){
  var C = window.JawabuCalc;
  var $ = function(id){ return document.getElementById(id); };

  /* [daraja, alama ya chini, rangi] - kuanzia ya juu hadi ya chini */
  var SC = {
    csee: {name: 'Kidato cha 1 hadi 4', bands: [['A', 75, '#16A34A'], ['B', 65, '#22C55E'], ['C', 45, '#F59E0B'], ['D', 30, '#F97316'], ['F', 0, '#DC2626']]},
    acsee: {name: 'Kidato cha 5 na 6', bands: [['A', 80, '#16A34A'], ['B', 70, '#22C55E'], ['C', 60, '#84CC16'], ['D', 50, '#F59E0B'], ['E', 40, '#F97316'], ['S', 35, '#EF4444'], ['F', 0, '#DC2626']]}
  };
  var MAXROWS = 15;

  function level(v){ return SC[v.lvl] ? v.lvl : 'csee'; }
  function f1(n){ return (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, ''); }
  function gradeOf(L, m){
    var b = SC[L].bands;
    for(var i = 0; i < b.length; i++) if(m >= b[i][1]) return b[i];
    return b[b.length - 1];
  }
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]; }); }

  /* ---- data: "jina|alama,jina|alama" (jina limesimbwa kwa encodeURIComponent) ---- */
  function decode(s){
    return String(s || '').split(',').map(function(p, i){
      var a = p.split('|'), sc = parseInt(a[1], 10), nm = '';
      try { nm = decodeURIComponent(a[0] || ''); } catch(e){ nm = a[0] || ''; }
      return (sc >= 0 && sc <= 100) ? {n: nm.slice(0, 12), s: sc} : null;
    }).filter(Boolean);
  }
  function encode(rows){
    return rows.filter(function(r){ return r.s !== '' && r.s !== null && !isNaN(r.s); }).map(function(r){
      return encodeURIComponent(String(r.n || '').replace(/[|,]/g, '').slice(0, 12)) + '|' + r.s;
    }).join(',');
  }

  function calc(v){
    var L = level(v), rows = decode(v.sc), tot = 0;
    rows.forEach(function(r, i){ r.n = r.n || ('Somo ' + (i + 1)); r.g = gradeOf(L, r.s); tot += r.s; });
    var n = rows.length, avg = n ? tot / n : 0;
    var best = rows[0], worst = rows[0];
    rows.forEach(function(r){ if(r.s > best.s) best = r; if(r.s < worst.s) worst = r; });
    var res = {L: L, rows: rows, n: n, tot: tot, avg: avg, g: gradeOf(L, avg), best: best, worst: worst};
    if(v.tg > 0){
      res.tg = Math.min(100, v.tg);
      res.need = res.tg * (n + 1) - tot;
    }
    return res;
  }

  function barHtml(L, avg){
    var b = SC[L].bands.slice().reverse(), html = '', lbl = '';
    b.forEach(function(x, i){
      var hi = i + 1 < b.length ? b[i + 1][1] : 101, w = (hi - x[1]);
      html += '<i style="width:' + w + '%;background:' + x[2] + '"></i>';
      lbl += '<span style="width:' + w + '%">' + x[0] + '</span>';
    });
    return '<div class="dv-wrap"><span class="dv-mark" style="left:' + Math.max(0, Math.min(100, avg)) + '%"></span><div class="dv-bar" aria-hidden="true">' + html + '</div><div class="dv-lbl" aria-hidden="true">' + lbl + '</div></div>';
  }

  function view(v, r, h){
    var rows = r.rows.map(function(x){
      return '<tr><td>' + esc(x.n) + '</td><td>' + x.s + '</td><td>' + x.g[0] + '</td></tr>';
    }).join('');
    var tgt = '';
    if(r.tg){
      tgt = '<div class="advice ' + (r.need <= 0 ? 'ok' : r.need > 100 ? 'bad' : '') + '"><b>Lengo la wastani ' + f1(r.tg) + ':</b> ' +
        (r.need <= 0 ? 'tayari umefikia lengo lako.' : r.need > 100 ? 'haliwezekani kwa mtihani mmoja ujao (ungehitaji zaidi ya 100).' : 'mtihani au somo linalofuata linahitaji alama ya angalau <b>' + Math.ceil(r.need) + '</b>.') + '</div>';
    }
    return '<div class="res-main"><small>Wastani wa alama</small>' +
        '<div class="dv-big"><strong>' + f1(r.avg) + '%</strong><span class="dv-pts">Daraja<b>' + r.g[0] + '</b></span></div></div>' +
      barHtml(r.L, r.avg) +
      '<ul class="res-rows">' +
        '<li><span>Jumla ya alama</span><b>' + r.tot + ' / ' + (r.n * 100) + '</b></li>' +
        '<li><span>Idadi ya masomo</span><b>' + r.n + '</b></li>' +
        '<li><span>Somo bora</span><b>' + esc(r.best.n) + ' (' + r.best.s + ')</b></li>' +
        '<li><span>Somo la chini</span><b>' + esc(r.worst.n) + ' (' + r.worst.s + ')</b></li>' +
      '</ul>' + tgt +
      '<details class="steps"><summary>Daraja la kila somo</summary><div class="tbl-wrap"><table class="tbl cnt"><thead><tr><th>Somo</th><th>Alama</th><th>Daraja</th></tr></thead><tbody>' + rows +
      '</tbody><tfoot><tr><td>Wastani</td><td>' + f1(r.avg) + '</td><td>' + r.g[0] + '</td></tr></tfoot></table></div></details>' +
      h.links([['Matokeo ya NECTA', 'necta.html'], ['Kikokotoo cha GPA', 'gpa.html']]);
  }

  /* ---- UI ya safu ---- */
  var rowsEl = $('alRows'), cEl = $('sc'), lvlEl = $('lvl'), ui = [];
  function blank(){ return {n: '', s: ''}; }
  function setRows(arr){ ui = arr.map(function(r){ return {n: r.n, s: r.s}; }); while(ui.length < 5) ui.push(blank()); draw(); }
  function draw(){
    var L = level({lvl: lvlEl.value});
    rowsEl.innerHTML = ui.map(function(r, i){
      var g = (r.s !== '' && !isNaN(r.s)) ? gradeOf(L, +r.s) : null;
      return '<div class="al-row" data-i="' + i + '">' +
        '<input class="an" type="text" maxlength="12" value="' + esc(r.n) + '" placeholder="Somo ' + (i + 1) + '" autocomplete="off" aria-label="Jina la somo ' + (i + 1) + '">' +
        '<input class="mk" type="text" inputmode="numeric" maxlength="3" value="' + r.s + '" placeholder="0-100" aria-label="Alama za somo ' + (i + 1) + '">' +
        '<span class="gtag"' + (g ? ' style="background:' + g[2] + '"' : '') + '>' + (g ? g[0] : '-') + '</span>' +
        (ui.length > 1 ? '<button type="button" class="gp-x" data-x aria-label="Ondoa somo ' + (i + 1) + '">×</button>' : '<span></span>') + '</div>';
    }).join('');
    $('addRow').hidden = ui.length >= MAXROWS;
  }
  function tags(){
    var L = level({lvl: lvlEl.value});
    rowsEl.querySelectorAll('.al-row').forEach(function(row){
      var r = ui[+row.getAttribute('data-i')], t = row.querySelector('.gtag');
      var g = (r.s !== '' && !isNaN(r.s)) ? gradeOf(L, +r.s) : null;
      t.textContent = g ? g[0] : '-'; t.style.background = g ? g[2] : '';
    });
  }
  function push(){ cEl.value = encode(ui); cEl.dispatchEvent(new Event('input', {bubbles: true})); }

  rowsEl.addEventListener('input', function(e){
    var row = e.target.closest('.al-row'); if(!row) return;
    var r = ui[+row.getAttribute('data-i')];
    if(e.target.classList.contains('mk')){
      var n = e.target.value.replace(/[^\d]/g, '').slice(0, 3); if(n !== '' && +n > 100) n = '100';
      e.target.value = n; r.s = n === '' ? '' : +n;
    } else if(e.target.classList.contains('an')){
      r.n = e.target.value.replace(/[|,]/g, '');
    } else return;
    tags(); push();
  });
  rowsEl.addEventListener('click', function(e){
    var x = e.target.closest('[data-x]'); if(!x) return;
    ui.splice(+x.closest('.al-row').getAttribute('data-i'), 1); draw(); push();
  });
  $('addRow').addEventListener('click', function(){ if(ui.length < MAXROWS){ ui.push(blank()); draw(); } });
  $('lvSeg').addEventListener('click', function(e){
    var b = e.target.closest('[data-lv]'); if(!b) return;
    if(b.getAttribute('data-lv') === level({lvl: lvlEl.value})) return;
    lvlEl.value = b.getAttribute('data-lv'); lvlEl.dispatchEvent(new Event('input', {bubbles: true}));
  });

  var cfg = {
    form: 'alForm', result: 'alResult', key: 'jawabu_alama_history_v1',
    fields: [
      {id: 'sc', type: 'text', q: 'a', optional: true},
      {id: 'lvl', type: 'text', q: 'kiwango', def: 'csee', optional: true},
      {id: 'tg', type: 'dec', q: 'lengo', max: 100, optional: true}
    ],
    empty: 'Weka alama za masomo yako, jibu litaonekana hapa papo hapo.',
    valid: function(v){ return decode(v.sc).length > 0; },
    calc: calc,
    shareTitle: 'Wastani wa alama zangu - Jawabu TZ',
    shareText: function(v, r){
      return 'Wastani: ' + f1(r.avg) + '% (daraja ' + r.g[0] + ')\nMasomo: ' + r.n + ', jumla ' + r.tot + '\nSomo bora: ' + r.best.n + ' (' + r.best.s + ')';
    },
    view: view,
    histRow: function(v, r){ return {title: 'Wastani ' + f1(r.avg) + '%', label: 'Daraja', value: r.g[0]}; },
    histDetail: function(v, r){
      return '<li><span>Kiwango</span><b>' + SC[r.L].name + '</b></li><li><span>Masomo</span><b>' + r.n + '</b></li>' +
        '<li><span>Jumla</span><b>' + r.tot + '</b></li><li><span>Wastani</span><b>' + f1(r.avg) + '%</b></li>' +
        '<li><span>Daraja</span><b>' + r.g[0] + '</b></li>';
    },
    onRender: function(v){
      var L = level(v);
      document.querySelectorAll('#lvSeg [data-lv]').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-lv') === L ? 'true' : 'false'); });
      if(encode(ui) !== (v.sc || '')) setRows(decode(v.sc)); else tags();
    }
  };

  setRows([]);
  C.init(cfg);
  $('clearBtn').addEventListener('click', function(){ setRows([]); });
})();