(function(){
  var C = window.JawabuCalc, fmt = C.fmt;

  // Viwango vya PAYE kwa mwezi (2024/25): [kikomo cha juu, asilimia]
  var BR = [[270000,0],[520000,0.09],[760000,0.20],[1000000,0.25],[Infinity,0.30]];

  function calcPaye(g){
    var tax = 0, prev = 0;
    for(var i = 0; i < BR.length; i++){
      if(g > prev){ tax += (Math.min(g, BR[i][0]) - prev) * BR[i][1]; }
      prev = BR[i][0];
    }
    return Math.round(tax);
  }
  window.JAWABU_PAYE = calcPaye;

  function steps(g){
    var rows = [], prev = 0;
    for(var i = 0; i < BR.length; i++){
      if(g > prev){
        var top = Math.min(g, BR[i][0]);
        rows.push({from: prev, to: top, amt: top - prev, rate: BR[i][1]});
      }
      prev = BR[i][0];
    }
    return rows;
  }

  function stepsHtml(g, paye){
    var list = steps(g), used = 0;
    var rows = list.map(function(s, i){
      var tax = (i === list.length - 1) ? paye - used : Math.round(s.amt * s.rate);
      used += tax;
      return '<tr><td>' + fmt(s.from) + ' hadi ' + fmt(s.to) + '</td><td>' + fmt(s.amt) + ' × ' + Math.round(s.rate * 100) + '%</td><td>' + fmt(tax) + '</td></tr>';
    }).join('');
    return '<details class="steps"><summary>Ona hatua za hesabu</summary>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sehemu ya mshahara</th><th>Hesabu</th><th>Kodi</th></tr></thead><tbody>' + rows +
      '</tbody><tfoot><tr><td colspan="2">Jumla ya PAYE</td><td>' + fmt(paye) + '</td></tr></tfoot></table></div></details>';
  }

  // net = mshahara ghafi - NSSF - PAYE - makato mengine (tupu = 0)
  function calc(v){
    var g = v.salary, oth = v.other || 0;
    var nssf = v.nssfOn ? Math.round(g * 0.10) : 0;
    var paye = calcPaye(g);
    var net = g - nssf - paye - oth;
    // Ukaguzi: angalia Console (F12) kuona kila namba iliyotumika
    if(window.console && console.log) console.log('[PAYE]', {mshaharaGhafi: g, nssf: nssf, paye: paye, makatoMengine: oth, unachochukua: net});
    return {nssf: nssf, paye: paye, oth: oth, net: Math.max(0, net), over: net < 0};
  }

  C.init({
    form: 'payeForm', result: 'payeResult', key: 'jawabu_paye_history_v2',
    fields: [
      {id: 'salary', type: 'money', q: 'mshahara'},
      {id: 'nssfOn', type: 'chk', q: 'nssf', def: true},
      {id: 'other', type: 'money', q: 'makato', optional: true}
    ],
    empty: 'Weka mshahara wako wa kila mwezi, jibu litaonekana hapa papo hapo.',
    valid: function(v){ return v.salary > 0; },
    calc: calc,
    shareTitle: 'Hesabu ya mshahara (PAYE) - Jawabu TZ',
    shareText: function(v, r){
      return 'Mshahara ghafi: TSh ' + fmt(v.salary) + '\nNSSF: TSh ' + fmt(r.nssf) + '\nPAYE: TSh ' + fmt(r.paye) +
        (r.oth ? '\nMakato mengine: TSh ' + fmt(r.oth) : '') + '\nUnachochukua nyumbani: TSh ' + fmt(r.net);
    },
    view: function(v, r, h){
      var g = v.salary, oth = r.oth;
      var warn = r.over ? '<div class="warn">Makato yako yanazidi mshahara. Angalia tena kiasi cha makato mengine.</div>' : '';
      var pct = function(x){ return (x / g * 100).toFixed(2); };
      return warn +
        '<div class="res-main"><small>Mshahara wa kuchukua nyumbani</small><strong>TSh ' + fmt(r.net) + '</strong></div>' +
        '<div class="bar" aria-hidden="true">' +
          '<i style="width:' + pct(r.net)  + '%;background:#4F46E5"></i>' +
          '<i style="width:' + pct(r.nssf) + '%;background:#22D3EE"></i>' +
          '<i style="width:' + pct(r.paye) + '%;background:#F59E0B"></i>' +
          '<i style="width:' + pct(oth)    + '%;background:#94A3B8"></i>' +
        '</div>' +
        '<ul class="res-rows">' +
          '<li><span>Mshahara ghafi</span><b>TSh ' + fmt(g) + '</b></li>' +
          '<li><span><i class="dot" style="background:#22D3EE"></i>NSSF (10%)</span><b>TSh ' + fmt(r.nssf) + '</b></li>' +
          '<li><span><i class="dot" style="background:#F59E0B"></i>PAYE (kodi ya mshahara)</span><b>TSh ' + fmt(r.paye) + '</b></li>' +
          (oth ? '<li><span><i class="dot" style="background:#94A3B8"></i>Makato mengine</span><b>TSh ' + fmt(oth) + '</b></li>' : '') +
          '<li><span><i class="dot" style="background:#4F46E5"></i>Unachochukua</span><b>TSh ' + fmt(r.net) + '</b></li>' +
        '</ul>' +
        '<p class="rate">Kiwango halisi cha PAYE: <b>' + (r.paye / g * 100).toFixed(1) + '%</b> ya mshahara wako.</p>' +
        stepsHtml(g, r.paye) +
        h.links([['Maelezo zaidi ya NSSF', 'nssf.html?mshahara=' + g], ['Viwango vya PAYE', '#viwango']]);
    },
    histRow: function(v, r){ return {title: 'TSh ' + fmt(v.salary), label: 'Mkononi', value: 'TSh ' + fmt(r.net)}; },
    histDetail: function(v, r){
      return '<li><span>Mshahara ghafi</span><b>TSh ' + fmt(v.salary) + '</b></li>' +
        '<li><span>NSSF' + (v.nssfOn ? ' (10%)' : ' (haikukatwa)') + '</span><b>TSh ' + fmt(r.nssf) + '</b></li>' +
        '<li><span>PAYE</span><b>TSh ' + fmt(r.paye) + '</b></li>' +
        (r.oth ? '<li><span>Makato mengine</span><b>TSh ' + fmt(r.oth) + '</b></li>' : '') +
        '<li><span>Unachochukua</span><b>TSh ' + fmt(r.net) + '</b></li>';
    }
  });
})();