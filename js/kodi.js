(function(){
  var C = window.JawabuCalc, fmt = C.fmt, RATE = 0.10; // kodi ya zuio ya pango: 10%

  function calc(v){
    var gross, net;
    if(v.back){ net = v.rent; gross = net / (1 - RATE); }   // anataka kupokea kiasi hiki halisi
    else { gross = v.rent; net = gross * (1 - RATE); }
    var tax = gross - net;
    return {gross: gross, tax: tax, net: net, grossT: gross * v.months, taxT: tax * v.months, netT: net * v.months};
  }

  C.init({
    form: 'taxForm', result: 'taxResult', key: 'jawabu_kodi_history_v1',
    fields: [
      {id: 'rent', type: 'money', q: 'pango'},
      {id: 'months', type: 'int', q: 'miezi', def: 12, max: 600},
      {id: 'back', type: 'chk', q: 'nipokee', def: false}
    ],
    empty: 'Weka kiasi cha pango, jibu litaonekana hapa papo hapo.',
    valid: function(v){ return v.rent > 0 && v.months > 0; },
    calc: calc,
    shareTitle: 'Hesabu ya kodi ya pango - Jawabu TZ',
    shareText: function(v, r){
      return 'Pango kamili: TSh ' + fmt(r.gross) + ' kwa mwezi\nKodi ya zuio (10%): TSh ' + fmt(r.tax) + '\nMwenye nyumba anapokea: TSh ' + fmt(r.net) + '\nJumla kwa miezi ' + v.months + ': TSh ' + fmt(r.netT);
    },
    view: function(v, r, h){
      return '<div class="res-main"><small>Mwenye nyumba anapokea kwa mwezi</small><strong>TSh ' + fmt(r.net) + '</strong></div>' +
        '<div class="bar" aria-hidden="true"><i style="width:90%;background:#22D3EE"></i><i style="width:10%;background:#F59E0B"></i></div>' +
        '<ul class="res-rows">' +
          '<li><span>Pango kamili (kabla ya kodi)</span><b>TSh ' + fmt(r.gross) + '</b></li>' +
          '<li><span><i class="dot" style="background:#F59E0B"></i>Kodi ya zuio (10%)</span><b>TSh ' + fmt(r.tax) + '</b></li>' +
          '<li><span><i class="dot" style="background:#22D3EE"></i>Anachopokea mwenye nyumba</span><b>TSh ' + fmt(r.net) + '</b></li>' +
        '</ul>' +
        '<details class="steps" open><summary>Jumla kwa miezi ' + v.months + '</summary>' +
          '<ul class="res-rows" style="padding:4px 14px 8px">' +
            '<li><span>Pango lote</span><b>TSh ' + fmt(r.grossT) + '</b></li>' +
            '<li><span>Kodi kwenda TRA</span><b>TSh ' + fmt(r.taxT) + '</b></li>' +
            '<li><span>Anachopokea mwenye nyumba</span><b>TSh ' + fmt(r.netT) + '</b></li>' +
          '</ul></details>' +
        h.links([]);
    },
    histRow: function(v, r){ return {title: 'TSh ' + fmt(v.rent), label: 'Kodi/mwezi', value: 'TSh ' + fmt(r.tax)}; },
    histDetail: function(v, r){
      return '<li><span>' + (v.back ? 'Anataka kupokea' : 'Pango la mwezi') + '</span><b>TSh ' + fmt(v.rent) + '</b></li>' +
        '<li><span>Pango kamili</span><b>TSh ' + fmt(r.gross) + '</b></li>' +
        '<li><span>Kodi (10%)</span><b>TSh ' + fmt(r.tax) + '</b></li>' +
        '<li><span>Miezi</span><b>' + v.months + '</b></li>';
    }
  });
})();