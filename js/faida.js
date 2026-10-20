(function(){
  var C = window.JawabuCalc, fmt = C.fmt;

  function f1(n){ return (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, ''); }
  function sgn(n){ return (n < 0 ? '-' : '') + 'TSh ' + fmt(Math.abs(n)); }

  function calc(v){
    var q = v.q > 0 ? v.q : 1, o = v.o || 0;
    var sales = v.p * q, costs = v.c * q + o, profit = sales - costs, unit = v.p - v.c;
    var res = {q: q, o: o, sales: sales, costs: costs, profit: profit, unit: unit,
      margin: sales ? profit / sales * 100 : 0, markup: costs ? profit / costs * 100 : 0,
      per: profit / q, loss: profit < 0, be: null};
    if(o > 0 && unit > 0) res.be = Math.ceil(o / unit);
    return res;
  }

  function view(v, r, h){
    var even = r.profit === 0;
    var title = r.loss ? 'Hasara yako' : even ? 'Hakuna faida wala hasara' : 'Faida yako';
    var col = r.loss ? '#DC2626' : '#065F46';
    var cp = r.costs && r.sales ? Math.min(100, r.costs / Math.max(r.sales, r.costs) * 100) : 0;
    var gp = r.loss ? 0 : 100 - cp;
    var bar = '<div class="dv-wrap"><div class="dv-bar" aria-hidden="true"><i style="width:' + cp + '%;background:' + (r.loss ? '#DC2626' : '#94A3B8') + '"></i>' +
      (gp > 0 ? '<i style="width:' + gp + '%;background:#10B981"></i>' : '') + '</div><div class="dv-lbl" aria-hidden="true"><span style="width:' + Math.max(cp, 30) + '%">Gharama ' + f1(cp) + '%</span>' +
      (gp > 0 ? '<span style="width:' + gp + '%">Faida ' + f1(gp) + '%</span>' : '') + '</div></div>';
    var be = '';
    if(r.be !== null) be = '<li><span>Vitu vya kuuza ili kufidia gharama nyingine</span><b>' + fmt(r.be) + '</b></li>';
    var tip = r.loss
      ? '<div class="advice bad"><b>Hasara:</b> ' + (r.unit <= 0 ? 'bei ya kuuza iko chini ya gharama ya kimoja, kwa hiyo kila kitu unachouza kinakupotezea pesa. Ongeza bei au punguza gharama.' : 'mauzo hayatoshi kufidia gharama zote. Uza vitu zaidi, ongeza bei au punguza gharama nyingine.') + '</div>'
      : r.margin < 10 && !even ? '<div class="advice"><b>Margin ndogo:</b> faida yako ni chini ya 10% ya mauzo. Gharama au bei ikibadilika kidogo, faida inaweza kupotea.</div>'
      : '';
    return '<div class="res-main"><small>' + title + '</small>' +
        '<div class="dv-big"><strong style="color:' + col + '">' + sgn(r.profit) + '</strong><span class="dv-pts">Margin<b style="color:' + col + '">' + f1(r.margin) + '%</b></span></div></div>' +
      bar +
      '<ul class="res-rows">' +
        '<li><span>Mauzo ya jumla</span><b>TSh ' + fmt(r.sales) + '</b></li>' +
        '<li><span>Gharama zote</span><b>TSh ' + fmt(r.costs) + '</b></li>' +
        '<li><span>' + (r.loss ? 'Hasara' : 'Faida') + ' kwa kimoja</span><b class="' + (r.loss ? 'loss' : '') + '">' + sgn(r.per) + '</b></li>' +
        '<li><span>Markup (juu ya gharama)</span><b>' + f1(r.markup) + '%</b></li>' + be +
      '</ul>' + tip +
      '<p class="bz-note"><b>Kumbuka:</b> hesabu hii haijumuishi kodi (VAT au kodi ya mapato). Kwa ushauri wa kodi, onana na mhasibu au TRA.</p>' +
      h.links([['Bei ya kuuza', 'bei-ya-kuuza.html'], ['VAT', 'vat.html']]);
  }

  C.init({
    form: 'faiForm', result: 'faiResult', key: 'jawabu_faida_history_v1',
    fields: [
      {id: 'c', type: 'money', q: 'gharama'},
      {id: 'p', type: 'money', q: 'bei'},
      {id: 'q', type: 'int', q: 'idadi', max: 10000000, optional: true},
      {id: 'o', type: 'money', q: 'nyingine', optional: true}
    ],
    empty: 'Weka gharama na bei ya kuuza, jibu litaonekana hapa papo hapo.',
    valid: function(v){ return v.c > 0 && v.p > 0; },
    calc: calc,
    shareTitle: 'Hesabu ya faida yangu - Jawabu TZ',
    shareText: function(v, r){
      return (r.loss ? 'Hasara: ' : 'Faida: ') + sgn(r.profit) + ' (margin ' + f1(r.margin) + '%)\nMauzo: TSh ' + fmt(r.sales) + ', gharama: TSh ' + fmt(r.costs);
    },
    view: view,
    histRow: function(v, r){ return {title: (r.loss ? 'Hasara ' : 'Faida ') + sgn(r.profit), label: 'Margin', value: f1(r.margin) + '%'}; },
    histDetail: function(v, r){
      return '<li><span>Gharama kwa kimoja</span><b>TSh ' + fmt(v.c) + '</b></li><li><span>Bei ya kuuza</span><b>TSh ' + fmt(v.p) + '</b></li>' +
        '<li><span>Idadi</span><b>' + fmt(r.q) + '</b></li>' + (r.o ? '<li><span>Gharama nyingine</span><b>TSh ' + fmt(r.o) + '</b></li>' : '') +
        '<li><span>' + (r.loss ? 'Hasara' : 'Faida') + '</span><b>' + sgn(r.profit) + '</b></li><li><span>Margin</span><b>' + f1(r.margin) + '%</b></li>';
    }
  });
})();