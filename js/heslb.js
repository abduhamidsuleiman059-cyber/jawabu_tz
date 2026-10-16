(function(){
  var C = window.JawabuCalc, fmt = C.fmt, RATE = 0.15; // HESLB: 15% ya mshahara ghafi

  function calc(v){
    var cut = Math.round(v.salary * RATE), d = v.debt || 0;
    return {cut: cut, net: v.salary - cut, yr: cut * 12, months: d > 0 ? Math.ceil(d / cut) : 0};
  }
  function dur(m){
    var y = Math.floor(m / 12), r = m % 12, p = [];
    if(y) p.push((y === 1 ? 'mwaka ' : 'miaka ') + y);
    if(r) p.push((r === 1 ? 'mwezi ' : 'miezi ') + r);
    return p.join(' na ') || 'chini ya mwezi 1';
  }

  C.init({
    form: 'heslbForm', result: 'heslbResult', key: 'jawabu_heslb_history_v2',
    fields: [
      {id: 'salary', type: 'money', q: 'mshahara'},
      {id: 'debt', type: 'money', q: 'deni', optional: true}
    ],
    empty: 'Weka mshahara wako wa kila mwezi, jibu litaonekana hapa papo hapo.',
    valid: function(v){ return v.salary > 0; },
    calc: calc,
    shareTitle: 'Hesabu ya mkopo wa HESLB - Jawabu TZ',
    shareText: function(v, r){
      return 'Mshahara ghafi: TSh ' + fmt(v.salary) + '\nMakato ya HESLB (15%): TSh ' + fmt(r.cut) + '\nMshahara baada ya HESLB: TSh ' + fmt(r.net) +
        (v.debt ? '\nDeni: TSh ' + fmt(v.debt) + ' (takriban ' + dur(r.months) + ')' : '');
    },
    view: function(v, r, h){
      var d = v.debt;
      return '<div class="res-main"><small>Makato ya HESLB kwa mwezi</small><strong>TSh ' + fmt(r.cut) + '</strong></div>' +
        '<div class="bar" aria-hidden="true"><i style="width:85%;background:#22D3EE"></i><i style="width:15%;background:#F59E0B"></i></div>' +
        '<ul class="res-rows">' +
          '<li><span>Mshahara ghafi</span><b>TSh ' + fmt(v.salary) + '</b></li>' +
          '<li><span><i class="dot" style="background:#F59E0B"></i>HESLB (15%)</span><b>TSh ' + fmt(r.cut) + '</b></li>' +
          '<li><span><i class="dot" style="background:#22D3EE"></i>Mshahara baada ya HESLB</span><b>TSh ' + fmt(r.net) + '</b></li>' +
          '<li><span>Makato kwa mwaka</span><b>TSh ' + fmt(r.yr) + '</b></li>' +
        '</ul>' +
        (d ? '<details class="steps" open><summary>Muda wa kumaliza deni</summary>' +
          '<ul class="res-rows" style="padding:4px 14px 8px">' +
            '<li><span>Deni lililobaki</span><b>TSh ' + fmt(d) + '</b></li>' +
            '<li><span>Miezi inayokadiriwa</span><b>' + r.months + '</b></li>' +
            '<li><span>Sawa na</span><b>' + dur(r.months) + '</b></li>' +
          '</ul></details>' : '') +
        h.links([['Kokotoa PAYE', 'paye.html?mshahara=' + v.salary], ['Kokotoa NSSF', 'nssf.html?mshahara=' + v.salary]]);
    },
    histRow: function(v, r){ return {title: 'TSh ' + fmt(v.salary), label: 'HESLB/mwezi', value: 'TSh ' + fmt(r.cut)}; },
    histDetail: function(v, r){
      return '<li><span>Makato ya HESLB (15%)</span><b>TSh ' + fmt(r.cut) + '</b></li>' +
        '<li><span>Mshahara baada ya HESLB</span><b>TSh ' + fmt(r.net) + '</b></li>' +
        (v.debt ? '<li><span>Muda wa kumaliza deni</span><b>' + dur(r.months) + '</b></li>' : '');
    },
    onRender: function(v){
      var p = document.getElementById('relPaye'), n = document.getElementById('relNssf');
      if(p) p.href = v.salary ? 'paye.html?mshahara=' + v.salary : 'paye.html';
      if(n) n.href = v.salary ? 'nssf.html?mshahara=' + v.salary : 'nssf.html';
    }
  });
})();