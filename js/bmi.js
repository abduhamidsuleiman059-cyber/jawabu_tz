(function(){
  var C = window.JawabuCalc;
  var $ = function(id){ return document.getElementById(id); };

  var LB = 0.45359237, IN = 0.0254;
  var CATS = [ // [mpaka (chini ya), jina, rangi, ushauri]
    [18.5, 'Uzito pungufu', '#0EA5E9', 'Uzito wako uko chini ya kiwango cha kawaida. Kula milo kamili yenye protini na wanga wa kutosha, na umwone mtaalamu wa afya ili kujua sababu ikiwa umepungua bila kukusudia.'],
    [25, 'Uzito wa kawaida', '#16A34A', 'Uzito wako uko kwenye kiwango cha kawaida kwa urefu wako. Endelea na lishe bora, mazoezi ya mara kwa mara na usingizi wa kutosha.'],
    [30, 'Uzito mkubwa', '#F59E0B', 'Uzito wako uko juu kidogo ya kiwango cha kawaida. Mabadiliko madogo kama kutembea kila siku na kupunguza vinywaji vyenye sukari yanaweza kusaidia.'],
    [999, 'Unene', '#DC2626', 'BMI yako iko kwenye kiwango cha unene, ambacho huongeza hatari ya magonjwa kama kisukari na shinikizo la damu. Ni vizuri kuonana na mtaalamu wa afya au lishe kwa mpango salama.']
  ];

  function catOf(b){ for(var i = 0; i < CATS.length; i++) if(b < CATS[i][0]) return CATS[i]; return CATS[CATS.length - 1]; }
  function f1(n){ return (Math.round(n * 10) / 10).toFixed(1); }
  function imp(v){ return v.u === 'i'; }
  function kgOf(v){ return imp(v) ? v.w * LB : v.w; }
  function mOf(v){ return imp(v) ? (v.ft * 12 + v.inc) * IN : v.h / 100; }

  function calc(v){
    var kg = kgOf(v), m = mOf(v), bmi = kg / (m * m);
    var lo = 18.5 * m * m, hi = 24.9 * m * m, diff = 0;
    if(bmi > 24.9) diff = kg - hi; else if(bmi < 18.5) diff = lo - kg;
    return {kg: kg, m: m, bmi: bmi, cat: catOf(bmi), lo: lo, hi: hi, diff: diff, imp: imp(v)};
  }
  function wt(r, kg){ return r.imp ? Math.round(kg / LB) + ' lb' : f1(kg) + ' kg'; }
  function hgt(v){
    return imp(v) ? v.ft + ' ft ' + (v.inc ? f1(v.inc) + ' in' : '') : v.h + ' cm';
  }

  function barHtml(b){
    var segs = [[6.5, '#0EA5E9', 'Pungufu'], [6.5, '#16A34A', 'Kawaida'], [5, '#F59E0B', 'Mkubwa'], [12, '#DC2626', 'Unene']];
    var html = segs.map(function(s){ return '<i style="width:' + (s[0] / 30 * 100) + '%;background:' + s[1] + '"></i>'; }).join('');
    var lbl = segs.map(function(s){ return '<span style="width:' + (s[0] / 30 * 100) + '%">' + s[2] + '</span>'; }).join('');
    var pos = Math.max(0, Math.min(100, (b - 12) / 30 * 100));
    return '<div class="dv-wrap"><span class="dv-mark" style="left:' + pos + '%"></span><div class="dv-bar" aria-hidden="true">' + html + '</div><div class="dv-lbl" aria-hidden="true">' + lbl + '</div></div>';
  }

  function view(v, r, h){
    var c = r.cat, goal = '';
    if(r.diff > 0){
      goal = '<li><span>' + (r.bmi > 24.9 ? 'Kupunguza ili ufike kawaida' : 'Kuongeza ili ufike kawaida') + '</span><b>' + wt(r, r.diff) + '</b></li>';
    }
    return '<div class="res-main"><small>BMI yako</small>' +
        '<div class="dv-big"><strong>' + f1(r.bmi) + '</strong><span class="dv-pts">Kundi<b style="color:' + c[2] + '">' + c[1] + '</b></span></div></div>' +
      barHtml(r.bmi) +
      '<ul class="res-rows">' +
        '<li><span>Uzito wako</span><b>' + wt(r, r.kg) + '</b></li>' +
        '<li><span>Urefu wako</span><b>' + hgt(v) + '</b></li>' +
        '<li><span>Uzito wa kawaida kwa urefu wako</span><b>' + wt(r, r.lo) + ' hadi ' + wt(r, r.hi) + '</b></li>' + goal +
      '</ul>' +
      '<div class="advice' + (r.bmi >= 18.5 && r.bmi < 25 ? ' ok' : r.bmi >= 30 ? ' bad' : '') + '"><b>' + c[1] + ':</b> ' + c[3] + '</div>' +
      '<p class="af-note"><b>Kumbuka:</b> BMI ni makadirio tu. Haitofautishi misuli na mafuta, wala haizingatii umri au jinsia. Si badala ya ushauri wa daktari.</p>' +
      h.links([['Kalori kwa siku', 'kalori.html']]);
  }

  /* ---- vipimo: kg/cm au lb/ft+in ---- */
  var uEl = $('u');
  function fire(el){ el.dispatchEvent(new Event('input', {bubbles: true})); }
  function num(id){ return parseFloat($(id).value.replace(',', '.')) || 0; }
  function r1(n){ return n ? String(Math.round(n * 10) / 10) : ''; }
  function r2(n){ return n ? String(Math.round(n * 100) / 100) : ''; }

  function setUnit(U){
    var cur = uEl.value === 'i' ? 'i' : 'm'; if(cur === U) return;
    var w = num('w'), h = num('h'), ft = num('ft'), inc = num('inc');
    if(U === 'i'){
      $('w').value = r1(w / LB);
      var ti = h / 2.54; $('ft').value = h ? String(Math.floor(ti / 12)) : ''; $('inc').value = h ? r2(ti - Math.floor(ti / 12) * 12) : ''; $('h').value = '';
    } else {
      $('w').value = r1(w * LB);
      var cm = (ft * 12 + inc) * 2.54; $('h').value = (ft || inc) ? r1(cm) : ''; $('ft').value = ''; $('inc').value = '';
    }
    uEl.value = U; fire(uEl);
  }
  $('uSeg').addEventListener('click', function(e){
    var b = e.target.closest('[data-u]'); if(b) setUnit(b.getAttribute('data-u'));
  });

  var cfg = {
    form: 'bmiForm', result: 'bmiResult', key: 'jawabu_bmi_history_v1',
    fields: [
      {id: 'u', type: 'text', q: 'kipimo', def: 'm', optional: true},
      {id: 'w', type: 'dec', q: 'uzito', optional: true},
      {id: 'h', type: 'dec', q: 'urefu', optional: true},
      {id: 'ft', type: 'int', q: 'futi', max: 8, optional: true},
      {id: 'inc', type: 'dec', q: 'inchi', optional: true}
    ],
    empty: 'Weka uzito na urefu wako, jibu litaonekana hapa papo hapo.',
    valid: function(v){
      var kg = kgOf(v), m = mOf(v);
      return kg >= 10 && kg <= 400 && m >= 0.9 && m <= 2.5;
    },
    calc: calc,
    shareTitle: 'BMI yangu - Jawabu TZ',
    shareText: function(v, r){ return 'BMI: ' + f1(r.bmi) + ' (' + r.cat[1] + ')\nUzito: ' + wt(r, r.kg) + ', urefu: ' + hgt(v); },
    view: view,
    histRow: function(v, r){ return {title: 'BMI ' + f1(r.bmi), label: 'Kundi', value: r.cat[1]}; },
    histDetail: function(v, r){
      return '<li><span>Uzito</span><b>' + wt(r, r.kg) + '</b></li><li><span>Urefu</span><b>' + hgt(v) + '</b></li>' +
        '<li><span>BMI</span><b>' + f1(r.bmi) + '</b></li><li><span>Kundi</span><b>' + r.cat[1] + '</b></li>';
    },
    onRender: function(v){
      var I = imp(v);
      document.querySelectorAll('#uSeg [data-u]').forEach(function(b){ b.setAttribute('aria-pressed', (b.getAttribute('data-u') === 'i') === I ? 'true' : 'false'); });
      $('wu').textContent = I ? 'lb' : 'kg';
      $('hMetric').hidden = I; $('hImp').hidden = !I;
    }
  };
  C.init(cfg);
})();