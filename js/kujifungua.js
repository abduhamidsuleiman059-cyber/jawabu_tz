(function(){
  var C = window.JawabuCalc;
  var $ = function(id){ return document.getElementById(id); };
  function fire(el){ el.dispatchEvent(new Event('input', {bubbles: true})); }

  var DAY = 86400000;
  var MONTHS = ['Januari', 'Februari', 'Machi', 'Aprili', 'Mei', 'Juni', 'Julai', 'Agosti', 'Septemba', 'Oktoba', 'Novemba', 'Desemba'];
  var WDAYS = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];
  var METHODS = {l: 'Hedhi ya mwisho', c: 'Kutungwa mimba', e: 'Tarehe ya kujifungua'};

  function method(v){ return METHODS[v.m] ? v.m : 'l'; }
  function today(){ var n = new Date(); return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()); }
  function parseDate(s){
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); if(!m) return null;
    var t = Date.UTC(+m[1], +m[2] - 1, +m[3]), d = new Date(t);
    return (d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3]) ? t : null;
  }
  function long(t){ var d = new Date(t); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); }
  function shortD(t){ var d = new Date(t); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()].slice(0, 3) + ' ' + d.getUTCFullYear(); }
  function wday(t){ return WDAYS[new Date(t).getUTCDay()]; }
  function cycle(v){ return v.cy >= 21 && v.cy <= 45 ? v.cy : 28; }

  /* LMP inayofaa (kwa mzunguko wa siku 28) kutoka kwenye njia iliyochaguliwa */
  function lmpOf(v){
    var d = parseDate(v.d); if(d === null) return null;
    var m = method(v);
    if(m === 'l') return d + (cycle(v) - 28) * DAY;
    if(m === 'c') return d - 14 * DAY;
    return d - 280 * DAY;
  }

  function calc(v){
    var lmp = lmpOf(v), t = today();
    var edd = lmp + 280 * DAY, days = Math.round((t - lmp) / DAY);
    var res = {lmp: lmp, edd: edd, days: days, w: Math.floor(days / 7), d: days % 7, left: Math.round((edd - t) / DAY)};
    res.tri = res.w < 14 ? 1 : res.w < 28 ? 2 : 3;
    res.conc = lmp + 14 * DAY;
    res.term = [lmp + 259 * DAY, lmp + 293 * DAY]; // wiki 37+0 hadi wiki 41+6
    res.stones = [
      [12, 'Mwisho wa trimester ya kwanza'],
      [20, 'Ultrasound ya kawaida (wiki 18 hadi 22)'],
      [28, 'Trimester ya tatu inaanza'],
      [37, 'Mimba imekomaa (mtoto anaweza kuzaliwa)'],
      [40, 'Tarehe inayotarajiwa']
    ].map(function(s){ return {w: s[0], name: s[1], date: lmp + s[0] * 7 * DAY, past: s[0] * 7 <= days}; });
    return res;
  }

  function barHtml(r){
    var segs = [[14, '#F9A8D4', 'Trimester 1'], [14, '#EC4899', 'Trimester 2'], [13, '#BE185D', 'Trimester 3']];
    var tot = 41, html = segs.map(function(s){ return '<i style="width:' + (s[0] / tot * 100) + '%;background:' + s[1] + '"></i>'; }).join('');
    var lbl = segs.map(function(s){ return '<span style="width:' + (s[0] / tot * 100) + '%">' + s[2] + '</span>'; }).join('');
    var pos = Math.max(0, Math.min(100, (r.days / 7) / tot * 100));
    return '<div class="dv-wrap"><span class="dv-mark" style="left:' + pos + '%"></span><div class="dv-bar" aria-hidden="true">' + html + '</div><div class="dv-lbl" aria-hidden="true">' + lbl + '</div></div>';
  }

  function view(v, r, h){
    var left = r.left > 0 ? '<li><span>Siku zilizobaki</span><b>' + r.left + '</b></li>' :
      r.left === 0 ? '<li><span>Siku zilizobaki</span><b>Ni leo</b></li>' :
      '<li><span>Zimepita tangu tarehe inayotarajiwa</span><b>siku ' + (-r.left) + '</b></li>';
    var st = r.stones.map(function(s){
      return '<li class="' + (s.past ? 'done' : '') + '"><span>Wiki ' + s.w + ': ' + s.name + '</span><b>' + shortD(s.date) + '</b></li>';
    }).join('');
    var late = r.days > 294 ? '<div class="advice bad"><b>Tahadhari:</b> mimba imepita wiki 42. Hakikisha uko chini ya uangalizi wa mtoa huduma wa afya.</div>' : '';
    return '<div class="res-main"><small>Tarehe inayotarajiwa ya kujifungua</small>' +
        '<div class="dv-big"><strong class="edd">' + long(r.edd) + '</strong><span class="dv-pts">Siku<b>' + wday(r.edd) + '</b></span></div></div>' +
      barHtml(r) +
      '<ul class="res-rows">' +
        '<li><span>Mimba ina</span><b>wiki ' + r.w + ' siku ' + r.d + '</b></li>' +
        '<li><span>Uko trimester ya</span><b>' + (r.tri === 1 ? 'kwanza' : r.tri === 2 ? 'pili' : 'tatu') + '</b></li>' + left +
        '<li><span>Mimba ilitungwa (makadirio)</span><b>' + shortD(r.conc) + '</b></li>' +
        '<li><span>Anaweza kuzaliwa kuanzia</span><b>' + shortD(r.term[0]) + ' hadi ' + shortD(r.term[1]) + '</b></li>' +
      '</ul>' + late +
      '<details class="steps"><summary>Hatua muhimu za mimba</summary><ul class="res-rows stones" style="padding:4px 14px 8px">' + st + '</ul></details>' +
      '<p class="af-note"><b>Kumbuka:</b> hii ni makadirio tu. Ni watoto wachache sana huzaliwa siku hiyo hasa. Hudhuria kliniki ya wajawazito (ANC) na mtoa huduma wa afya atathibitisha tarehe kwa kipimo cha ultrasound.</p>' +
      h.links([['Kikokotoo cha BMI', 'bmi.html']]);
  }

  $('mSeg').addEventListener('click', function(e){
    var b = e.target.closest('[data-m]'); if(!b) return;
    var val = b.getAttribute('data-m'); if($('m').value === val) return;
    $('m').value = val; fire($('m'));
  });
  var HINT = {l: 'Siku ya kwanza ya hedhi yako ya mwisho', c: 'Tarehe ambayo mimba ilitungwa', e: 'Tarehe ya kujifungua uliyopewa na daktari'};

  var cfg = {
    form: 'kujForm', result: 'kujResult', key: 'jawabu_kujifungua_history_v1',
    fields: [
      {id: 'm', type: 'text', q: 'njia', def: 'l', optional: true},
      {id: 'd', type: 'text', q: 'tarehe', optional: true},
      {id: 'cy', type: 'int', q: 'mzunguko', max: 60, optional: true}
    ],
    empty: 'Weka tarehe, jibu litaonekana hapa papo hapo.',
    valid: function(v){
      var lmp = lmpOf(v); if(lmp === null) return false;
      var days = Math.round((today() - lmp) / DAY);
      return days >= 0 && days <= 300;
    },
    calc: calc,
    shareTitle: 'Tarehe yangu ya kujifungua - Jawabu TZ',
    shareText: function(v, r){ return 'Tarehe inayotarajiwa ya kujifungua: ' + wday(r.edd) + ' ' + long(r.edd) + '\nMimba ina wiki ' + r.w + ' siku ' + r.d + ' (trimester ya ' + r.tri + ')'; },
    view: view,
    histRow: function(v, r){ return {title: shortD(r.edd), label: 'Mimba', value: 'Wiki ' + r.w}; },
    histDetail: function(v, r){
      return '<li><span>Njia</span><b>' + METHODS[method(v)] + '</b></li><li><span>Tarehe uliyoweka</span><b>' + shortD(parseDate(v.d)) + '</b></li>' +
        '<li><span>Tarehe inayotarajiwa</span><b>' + long(r.edd) + '</b></li><li><span>Mimba ilipokokotolewa</span><b>wiki ' + r.w + ' siku ' + r.d + '</b></li>';
    },
    onRender: function(v){
      var m = method(v);
      document.querySelectorAll('#mSeg [data-m]').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-m') === m ? 'true' : 'false'); });
      $('cyBox').hidden = m !== 'l';
      $('dHint').textContent = HINT[m];
      cfg.empty = (v.d && parseDate(v.d) !== null) ? 'Tarehe hii haiendani na mimba ya sasa. Weka tarehe ya ndani ya miezi 10 iliyopita (au ijayo kwa tarehe ya kujifungua).' : 'Weka tarehe, jibu litaonekana hapa papo hapo.';
    }
  };
  C.init(cfg);
})();