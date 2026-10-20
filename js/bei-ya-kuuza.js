(function(){
  var C = window.JawabuCalc, fmt = C.fmt;
  var $ = function(id){ return document.getElementById(id); };
  function fire(el){ el.dispatchEvent(new Event('input', {bubbles: true})); }

  function f1(n){ return (Math.round(n * 10) / 10).toFixed(1).replace(/\.0$/, ''); }
  function mode(v){ return v.m === 'k' ? 'k' : 'm'; }
  function priceOf(c, m, pc){ return m === 'm' ? c / (1 - pc / 100) : c * (1 + pc / 100); }

  function calc(v){
    var m = mode(v), q = v.q > 0 ? v.q : 1;
    var price = Math.round(priceOf(v.c, m, v.pc)), unit = price - v.c;
    var res = {m: m, q: q, price: price, unit: unit, sales: price * q, profit: unit * q,
      margin: price ? unit / price * 100 : 0, markup: unit / v.c * 100, vat: !!v.vt};
    if(v.vt){ res.vatAmt = Math.round(price * 0.18); res.gross = price + res.vatAmt; }
    res.ladder = (m === 'm' ? [10, 20, 30, 40, 50] : [10, 25, 50, 75, 100]).map(function(p){ return [p, Math.round(priceOf(v.c, m, p))]; });
    return res;
  }

  function view(v, r, h){
    var mk = r.m === 'm';
    var cp = r.price ? v.c / r.price * 100 : 0;
    var bar = '<div class="dv-wrap"><div class="dv-bar" aria-hidden="true"><i style="width:' + cp + '%;background:#94A3B8"></i><i style="width:' + (100 - cp) + '%;background:#10B981"></i></div>' +
      '<div class="dv-lbl" aria-hidden="true"><span style="width:' + cp + '%">Gharama ' + f1(cp) + '%</span><span style="width:' + (100 - cp) + '%">Faida ' + f1(100 - cp) + '%</span></div></div>';
    var ladder = r.ladder.map(function(x){ return '<li><span>' + (mk ? 'Margin' : 'Markup') + ' ' + x[0] + '%</span><b>TSh ' + fmt(x[1]) + '</b></li>'; }).join('');
    return '<div class="res-main"><small>Bei ya kuuza kwa kimoja</small>' +
        '<div class="dv-big"><strong>TSh ' + fmt(r.price) + '</strong><span class="dv-pts">Faida kwa kimoja<b>TSh ' + fmt(r.unit) + '</b></span></div></div>' + bar +
      '<ul class="res-rows">' +
        '<li><span>Gharama ya kimoja</span><b>TSh ' + fmt(v.c) + '</b></li>' +
        '<li><span>Margin</span><b>' + f1(r.margin) + '%</b></li>' +
        '<li><span>Markup</span><b>' + f1(r.markup) + '%</b></li>' +
        (r.q > 1 ? '<li><span>Mauzo ya vitu ' + fmt(r.q) + '</span><b>TSh ' + fmt(r.sales) + '</b></li><li><span>Faida ya jumla</span><b>TSh ' + fmt(r.profit) + '</b></li>' : '') +
        (r.vat ? '<li><span>VAT (18%)</span><b>TSh ' + fmt(r.vatAmt) + '</b></li><li><span>Bei yenye VAT</span><b>TSh ' + fmt(r.gross) + '</b></li>' : '') +
      '</ul>' +
      '<details class="steps"><summary>Bei kwa ' + (mk ? 'margin' : 'markup') + ' tofauti</summary><ul class="res-rows" style="padding:4px 14px 8px">' + ladder + '</ul></details>' +
      '<p class="bz-note"><b>Kumbuka:</b> bei hii haijumuishi gharama nyingine kama usafiri na pango. Linganisha na bei za soko kabla ya kuamua.</p>' +
      h.links([['Faida na hasara', 'faida.html'], ['VAT', 'vat.html']]);
  }

  $('mSeg').addEventListener('click', function(e){
    var b = e.target.closest('[data-m]'); if(!b) return;
    var val = b.getAttribute('data-m'); if($('m').value === val) return;
    $('m').value = val; fire($('m'));
  });

  var cfg = {
    form: 'beiForm', result: 'beiResult', key: 'jawabu_bei_history_v1',
    fields: [
      {id: 'c', type: 'money', q: 'gharama'},
      {id: 'm', type: 'text', q: 'njia', def: 'm', optional: true},
      {id: 'pc', type: 'dec', q: 'asilimia'},
      {id: 'q', type: 'int', q: 'idadi', max: 10000000, optional: true},
      {id: 'vt', type: 'chk', q: 'vat', optional: true}
    ],
    empty: 'Weka gharama na asilimia, jibu litaonekana hapa papo hapo.',
    valid: function(v){ return v.c > 0 && v.pc > 0 && (mode(v) === 'k' ? v.pc <= 1000 : v.pc < 100); },
    calc: calc,
    shareTitle: 'Bei yangu ya kuuza - Jawabu TZ',
    shareText: function(v, r){ return 'Bei ya kuuza: TSh ' + fmt(r.price) + ' (gharama TSh ' + fmt(v.c) + ')\nFaida kwa kimoja: TSh ' + fmt(r.unit) + ', margin ' + f1(r.margin) + '%'; },
    view: view,
    histRow: function(v, r){ return {title: 'Bei TSh ' + fmt(r.price), label: r.m === 'm' ? 'Margin' : 'Markup', value: f1(v.pc) + '%'}; },
    histDetail: function(v, r){
      return '<li><span>Gharama</span><b>TSh ' + fmt(v.c) + '</b></li><li><span>' + (r.m === 'm' ? 'Margin' : 'Markup') + '</span><b>' + f1(v.pc) + '%</b></li>' +
        '<li><span>Bei ya kuuza</span><b>TSh ' + fmt(r.price) + '</b></li><li><span>Faida kwa kimoja</span><b>TSh ' + fmt(r.unit) + '</b></li>' +
        (r.vat ? '<li><span>Bei yenye VAT</span><b>TSh ' + fmt(r.gross) + '</b></li>' : '');
    },
    onRender: function(v){
      var mk = mode(v) === 'm';
      document.querySelectorAll('#mSeg [data-m]').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-m') === mode(v) ? 'true' : 'false'); });
      $('pcLbl').textContent = mk ? 'Margin unayotaka' : 'Markup unayotaka';
      $('pcHint').textContent = mk ? 'Asilimia ya bei ya kuuza itakayobaki kama faida (chini ya 100).' : 'Asilimia ya gharama utakayoongeza kama faida.';
      cfg.empty = (mk && v.pc >= 100) ? 'Margin lazima iwe chini ya 100%. Weka asilimia ndogo zaidi.' : 'Weka gharama na asilimia, jibu litaonekana hapa papo hapo.';
    }
  };
  C.init(cfg);
})();