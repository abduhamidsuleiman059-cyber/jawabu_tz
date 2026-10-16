(function(){
  var C = window.JawabuCalc, fmt = C.fmt, RATE = 0.10; // mfanyakazi 10%, mwajiri 10%

  function calc(v){
    var m = v.months || 12, g = v.salary, emp = Math.round(g * RATE), er = Math.round(g * RATE);
    return {m: m, emp: emp, er: er, tot: emp + er, net: g - emp, empT: emp * m, erT: er * m, totT: (emp + er) * m};
  }

  C.init({
    form: 'nssfForm', result: 'nssfResult', key: 'jawabu_nssf_history_v2',
    fields: [
      {id: 'salary', type: 'money', q: 'mshahara'},
      {id: 'months', type: 'int', q: 'miezi', def: 12, max: 600, optional: true}
    ],
    empty: 'Weka mshahara wako wa kila mwezi, jibu litaonekana hapa papo hapo.',
    valid: function(v){ return v.salary > 0; },
    calc: calc,
    shareTitle: 'Hesabu ya NSSF - Jawabu TZ',
    shareText: function(v, r){
      return 'Mshahara ghafi: TSh ' + fmt(v.salary) + '\nMchango wangu (10%): TSh ' + fmt(r.emp) + '\nMchango wa mwajiri (10%): TSh ' + fmt(r.er) +
        '\nJumla kwa miezi ' + r.m + ': TSh ' + fmt(r.totT);
    },
    view: function(v, r, h){
      return '<div class="res-main"><small>Mchango wako wa NSSF kwa mwezi</small><strong>TSh ' + fmt(r.emp) + '</strong></div>' +
        '<div class="bar" aria-hidden="true"><i style="width:50%;background:#22D3EE"></i><i style="width:50%;background:#34D399"></i></div>' +
        '<ul class="res-rows">' +
          '<li><span>Mshahara ghafi</span><b>TSh ' + fmt(v.salary) + '</b></li>' +
          '<li><span><i class="dot" style="background:#22D3EE"></i>Mchango wako (10%)</span><b>TSh ' + fmt(r.emp) + '</b></li>' +
          '<li><span><i class="dot" style="background:#34D399"></i>Mchango wa mwajiri (10%)</span><b>TSh ' + fmt(r.er) + '</b></li>' +
          '<li><span>Jumla kwa mwezi (20%)</span><b>TSh ' + fmt(r.tot) + '</b></li>' +
          '<li><span>Mshahara baada ya NSSF (kabla ya PAYE)</span><b>TSh ' + fmt(r.net) + '</b></li>' +
        '</ul>' +
        '<details class="steps" open><summary>Jumla kwa miezi ' + r.m + '</summary>' +
          '<ul class="res-rows" style="padding:4px 14px 8px">' +
            '<li><span>Michango yako</span><b>TSh ' + fmt(r.empT) + '</b></li>' +
            '<li><span>Michango ya mwajiri</span><b>TSh ' + fmt(r.erT) + '</b></li>' +
            '<li><span>Jumla kwenye akaunti</span><b>TSh ' + fmt(r.totT) + '</b></li>' +
          '</ul></details>' +
        h.links([['Kokotoa PAYE ya mshahara huu', 'paye.html?mshahara=' + v.salary]]);
    },
    histRow: function(v, r){ return {title: 'TSh ' + fmt(v.salary), label: 'NSSF/mwezi', value: 'TSh ' + fmt(r.emp)}; },
    histDetail: function(v, r){
      return '<li><span>Mchango wako (10%)</span><b>TSh ' + fmt(r.emp) + '</b></li>' +
        '<li><span>Mchango wa mwajiri (10%)</span><b>TSh ' + fmt(r.er) + '</b></li>' +
        '<li><span>Jumla kwa miezi ' + r.m + '</span><b>TSh ' + fmt(r.totT) + '</b></li>';
    },
    onRender: function(v){
      var a = document.getElementById('relPaye'); if(a) a.href = v.salary ? 'paye.html?mshahara=' + v.salary : 'paye.html';
    }
  });
})();