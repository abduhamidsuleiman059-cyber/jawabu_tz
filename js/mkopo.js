(function(){
  var C = window.JawabuCalc, fmt = C.fmt;

  // Mkopo wa kupunguza salio (reducing balance): malipo ya kila mwezi sawa
  function calc(v){
    var P = v.amt, n = v.months, i = v.rate / 100 / 12, pay;
    pay = i ? P * i / (1 - Math.pow(1 + i, -n)) : P / n;
    var total = pay * n, rows = [], bal = P;
    for(var k = 1; k <= n; k++){
      var int = bal * i, pr = pay - int; bal = Math.max(0, bal - pr);
      if(k <= 12 || k === n) rows.push({k: k, pay: pay, pr: pr, int: int, bal: bal});
    }
    return {pay: pay, total: total, interest: total - P, rows: rows};
  }

  C.init({
    form: 'loanForm', result: 'loanResult', key: 'jawabu_mkopo_history_v1',
    fields: [
      {id: 'amt', type: 'money', q: 'kiasi'},
      {id: 'rate', type: 'dec', q: 'riba', def: 18},
      {id: 'months', type: 'int', q: 'miezi', def: 12, max: 600}
    ],
    empty: 'Weka kiasi cha mkopo, riba na muda, jibu litaonekana hapa papo hapo.',
    valid: function(v){ return v.amt > 0 && v.months > 0 && v.rate >= 0; },
    calc: calc,
    shareTitle: 'Hesabu ya mkopo - Jawabu TZ',
    shareText: function(v, r){
      return 'Mkopo: TSh ' + fmt(v.amt) + ' kwa riba ya ' + v.rate + '% kwa miezi ' + v.months + '\nMalipo kwa mwezi: TSh ' + fmt(r.pay) + '\nJumla ya riba: TSh ' + fmt(r.interest) + '\nJumla utakayolipa: TSh ' + fmt(r.total);
    },
    view: function(v, r, h){
      var rows = r.rows.map(function(x){
        return '<tr><td>' + x.k + '</td><td>' + fmt(x.pr) + '</td><td>' + fmt(x.int) + '</td><td>' + fmt(x.bal) + '</td></tr>';
      }).join('');
      var pi = Math.round(v.amt / r.total * 100);
      return '<div class="res-main"><small>Malipo ya kila mwezi</small><strong>TSh ' + fmt(r.pay) + '</strong></div>' +
        '<div class="bar" aria-hidden="true"><i style="width:' + pi + '%;background:#22D3EE"></i><i style="width:' + (100 - pi) + '%;background:#F59E0B"></i></div>' +
        '<ul class="res-rows">' +
          '<li><span><i class="dot" style="background:#22D3EE"></i>Kiasi cha mkopo</span><b>TSh ' + fmt(v.amt) + '</b></li>' +
          '<li><span><i class="dot" style="background:#F59E0B"></i>Jumla ya riba</span><b>TSh ' + fmt(r.interest) + '</b></li>' +
          '<li><span>Jumla utakayolipa</span><b>TSh ' + fmt(r.total) + '</b></li>' +
          '<li><span>Muda</span><b>Miezi ' + v.months + '</b></li>' +
        '</ul>' +
        '<details class="steps"><summary>Ona ratiba ya malipo (miezi 12 ya kwanza)</summary>' +
          '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Mwezi</th><th>Mtaji</th><th>Riba</th><th>Salio</th></tr></thead><tbody>' + rows + '</tbody></table></div></details>' +
        h.links([]);
    },
    histRow: function(v, r){ return {title: 'TSh ' + fmt(v.amt), label: 'Kwa mwezi', value: 'TSh ' + fmt(r.pay)}; },
    histDetail: function(v, r){
      return '<li><span>Riba</span><b>' + v.rate + '% kwa mwaka</b></li>' +
        '<li><span>Muda</span><b>Miezi ' + v.months + '</b></li>' +
        '<li><span>Jumla ya riba</span><b>TSh ' + fmt(r.interest) + '</b></li>' +
        '<li><span>Jumla utakayolipa</span><b>TSh ' + fmt(r.total) + '</b></li>';
    }
  });
})();