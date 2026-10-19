(function(){
  var C = window.JawabuCalc, fmt = C.fmt;
  var $ = function(id){ return document.getElementById(id); };
  function fire(el){ el.dispatchEvent(new Event('input', {bubbles: true})); }

  var ACT = {
    '1': ['Kukaa mara nyingi (bila mazoezi)', 1.2],
    '2': ['Mazoezi kidogo (mara 1 hadi 3 kwa wiki)', 1.375],
    '3': ['Mazoezi ya wastani (mara 3 hadi 5 kwa wiki)', 1.55],
    '4': ['Mazoezi mengi (mara 6 hadi 7 kwa wiki)', 1.725],
    '5': ['Kazi ngumu au mazoezi mazito kila siku', 1.9]
  };
  var GOAL = {
    k: {name: 'Kudumisha uzito', adj: 0, split: [20, 50, 30]},
    p: {name: 'Kupunguza uzito', adj: -500, split: [30, 40, 30]},
    o: {name: 'Kuongeza uzito', adj: 300, split: [25, 50, 25]}
  };
  var FLOOR = {m: 1500, f: 1200};

  function sx(v){ return v.sx === 'f' ? 'f' : 'm'; }
  function gl(v){ return GOAL[v.gl] ? v.gl : 'k'; }
  function ac(v){ return ACT[v.act] ? v.act : '2'; }

  function calc(v){
    var s = sx(v), g = gl(v), a = ac(v);
    var bmr = 10 * v.w + 6.25 * v.h - 5 * v.age + (s === 'm' ? 5 : -161);
    var tdee = bmr * ACT[a][1];
    var target = tdee + GOAL[g].adj, floored = false;
    if(target < FLOOR[s]){ target = FLOOR[s]; floored = true; }
    var sp = GOAL[g].split;
    var gr = [target * sp[0] / 100 / 4, target * sp[1] / 100 / 4, target * sp[2] / 100 / 9];
    var weekly = (target - tdee) * 7 / 7700; // kg kwa wiki
    return {s: s, g: g, a: a, bmr: bmr, tdee: tdee, target: target, floored: floored, sp: sp, gr: gr, weekly: weekly};
  }

  function view(v, r, h){
    var G = GOAL[r.g], cols = ['#2563EB', '#F59E0B', '#DB2777'], names = ['Protini', 'Wanga', 'Mafuta'];
    var bar = '<div class="dv-wrap"><div class="dv-bar" aria-hidden="true">' + r.sp.map(function(p, i){ return '<i style="width:' + p + '%;background:' + cols[i] + '"></i>'; }).join('') +
      '</div><div class="dv-lbl" aria-hidden="true">' + r.sp.map(function(p, i){ return '<span style="width:' + p + '%">' + names[i] + ' ' + p + '%</span>'; }).join('') + '</div></div>';
    var wk = Math.abs(r.weekly) < 0.05 ? '' : '<li><span>' + (r.weekly < 0 ? 'Kupungua kwa makadirio' : 'Kuongezeka kwa makadirio') + '</span><b>kg ' + (Math.round(Math.abs(r.weekly) * 10) / 10) + ' kwa wiki</b></li>';
    var warn = r.floored ? '<div class="advice"><b>Kumbuka:</b> kalori zimewekwa kwenye kiwango cha chini salama (' + fmt(FLOOR[r.s]) + '). Kula chini ya hapo bila usimamizi wa mtaalamu si salama.</div>' : '';
    return '<div class="res-main"><small>Kalori za kula kwa siku</small>' +
        '<div class="dv-big"><strong>' + fmt(r.target) + '</strong><span class="dv-pts">Lengo<b>' + G.name + '</b></span></div></div>' +
      '<ul class="res-rows">' +
        '<li><span>Kalori za mwili kupumzika (BMR)</span><b>' + fmt(r.bmr) + '</b></li>' +
        '<li><span>Za kudumisha uzito wako</span><b>' + fmt(r.tdee) + '</b></li>' + wk +
      '</ul>' + warn +
      '<p class="grp-t">Mgawanyo wa virutubisho (makadirio)</p>' + bar +
      '<ul class="res-rows">' +
        '<li><span>Protini</span><b>' + fmt(r.gr[0]) + ' g</b></li>' +
        '<li><span>Wanga</span><b>' + fmt(r.gr[1]) + ' g</b></li>' +
        '<li><span>Mafuta</span><b>' + fmt(r.gr[2]) + ' g</b></li>' +
      '</ul>' +
      '<p class="af-note"><b>Kumbuka:</b> haya ni makadirio kwa mtu mzima mwenye afya. Wajawazito, wanaonyonyesha, wagonjwa na watoto waone daktari au mtaalamu wa lishe kwanza.</p>' +
      h.links([['Kikokotoo cha BMI', 'bmi.html']]);
  }

  /* ---- seg: jinsia na lengo ---- */
  function bindSeg(segId, attr, hid){
    $(segId).addEventListener('click', function(e){
      var b = e.target.closest('[' + attr + ']'); if(!b) return;
      var val = b.getAttribute(attr); if($(hid).value === val) return;
      $(hid).value = val; fire($(hid));
    });
  }
  bindSeg('sxSeg', 'data-sx', 'sx');
  bindSeg('glSeg', 'data-gl', 'gl');
  function press(segId, attr, cur){
    document.querySelectorAll('#' + segId + ' [' + attr + ']').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute(attr) === cur ? 'true' : 'false'); });
  }

  var cfg = {
    form: 'kalForm', result: 'kalResult', key: 'jawabu_kalori_history_v1',
    fields: [
      {id: 'sx', type: 'text', q: 'jinsia', def: 'm', optional: true},
      {id: 'age', type: 'int', q: 'umri', max: 120, optional: true},
      {id: 'w', type: 'dec', q: 'uzito', optional: true},
      {id: 'h', type: 'dec', q: 'urefu', optional: true},
      {id: 'act', type: 'text', q: 'shughuli', def: '2', optional: true},
      {id: 'gl', type: 'text', q: 'lengo', def: 'k', optional: true}
    ],
    empty: 'Weka taarifa zako, jibu litaonekana hapa papo hapo.',
    valid: function(v){ return v.age >= 15 && v.age <= 90 && v.w >= 25 && v.w <= 300 && v.h >= 120 && v.h <= 230; },
    calc: calc,
    shareTitle: 'Kalori zangu kwa siku - Jawabu TZ',
    shareText: function(v, r){ return 'Kalori za kula kwa siku: ' + fmt(r.target) + ' (' + GOAL[r.g].name + ')\nKudumisha uzito: ' + fmt(r.tdee) + '\nProtini ' + fmt(r.gr[0]) + 'g, wanga ' + fmt(r.gr[1]) + 'g, mafuta ' + fmt(r.gr[2]) + 'g'; },
    view: view,
    histRow: function(v, r){ return {title: 'Kalori ' + fmt(r.target), label: 'Lengo', value: GOAL[r.g].name}; },
    histDetail: function(v, r){
      return '<li><span>Jinsia</span><b>' + (r.s === 'm' ? 'Mwanaume' : 'Mwanamke') + '</b></li><li><span>Umri</span><b>' + v.age + '</b></li>' +
        '<li><span>Uzito / urefu</span><b>' + v.w + ' kg / ' + v.h + ' cm</b></li><li><span>Shughuli</span><b>' + ACT[r.a][0] + '</b></li>' +
        '<li><span>Kudumisha uzito</span><b>' + fmt(r.tdee) + '</b></li><li><span>Kalori za kula</span><b>' + fmt(r.target) + '</b></li>';
    },
    onRender: function(v){ press('sxSeg', 'data-sx', sx(v)); press('glSeg', 'data-gl', gl(v)); if($('act').value !== ac(v)) $('act').value = ac(v); }
  };
  C.init(cfg);
})();