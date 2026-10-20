(function(){
  var C = window.JawabuCalc, fmt = C.fmt;
  var $ = function(id){ return document.getElementById(id); };
  function fire(el){ el.dispatchEvent(new Event('input', {bubbles: true})); }

  function mode(v){ return v.m === 'r' ? 'r' : 'a'; }
  function rate(v){ return v.rt === '0' ? 0 : 18; }

  function calc(v){
    var m = mode(v), r = rate(v), net, vat, gross;
    if(m === 'a'){ net = v.v; vat = Math.round(net * r / 100); gross = net + vat; }
    else { gross = v.v; net = Math.round(gross / (1 + r / 100)); vat = gross - net; }
    return {m: m, r: r, net: net, vat: vat, gross: gross};
  }

  function view(v, r, h){
    var add = r.m === 'a';
    var main = add ? r.gross : r.net, cap = add ? 'Bei kamili (pamoja na VAT)' : 'Bei bila VAT';
    var tot = r.gross || 1, vp = r.vat / tot * 100;
    var bar = '<div class="dv-wrap"><div class="dv-bar" aria-hidden="true"><i style="width:' + (100 - vp) + '%;background:#10B981"></i>' + (vp > 0 ? '<i style="width:' + vp + '%;background:#F59E0B"></i>' : '') +
      '</div><div class="dv-lbl" aria-hidden="true"><span style="width:' + (100 - vp) + '%">Bei bila VAT</span>' + (vp > 0 ? '<span style="width:' + Math.max(vp, 18) + '%">VAT</span>' : '') + '</div></div>';
    return '<div class="res-main"><small>' + cap + '</small>' +
        '<div class="dv-big"><strong>TSh ' + fmt(main) + '</strong><span class="dv-pts">VAT<b>' + r.r + '%</b></span></div></div>' + bar +
      '<ul class="res-rows">' +
        '<li><span>Bei bila VAT</span><b>TSh ' + fmt(r.net) + '</b></li>' +
        '<li><span>Kiasi cha VAT (' + r.r + '%)</span><b>TSh ' + fmt(r.vat) + '</b></li>' +
        '<li><span>Bei kamili</span><b>TSh ' + fmt(r.gross) + '</b></li>' +
      '</ul>' +
      '<p class="bz-note"><b>Kumbuka:</b> kiwango cha kawaida cha VAT Tanzania ni 18%. Bidhaa na huduma zingine zimesamehewa. Thibitisha na TRA au mhasibu.</p>' +
      h.links([['Faida na hasara', 'faida.html'], ['Bei ya kuuza', 'bei-ya-kuuza.html']]);
  }

  function seg(id, attr, hid){
    $(id).addEventListener('click', function(e){
      var b = e.target.closest('[' + attr + ']'); if(!b) return;
      var val = b.getAttribute(attr); if($(hid).value === val) return;
      $(hid).value = val; fire($(hid));
    });
  }
  seg('mSeg', 'data-m', 'm'); seg('rSeg', 'data-rt', 'rt');
  function press(id, attr, cur){
    document.querySelectorAll('#' + id + ' [' + attr + ']').forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute(attr) === cur ? 'true' : 'false'); });
  }

  C.init({
    form: 'vatForm', result: 'vatResult', key: 'jawabu_vat_history_v1',
    fields: [
      {id: 'm', type: 'text', q: 'njia', def: 'a', optional: true},
      {id: 'v', type: 'money', q: 'kiasi'},
      {id: 'rt', type: 'text', q: 'kiwango', def: '18', optional: true}
    ],
    empty: 'Weka kiasi, jibu litaonekana hapa papo hapo.',
    valid: function(v){ return v.v > 0; },
    calc: calc,
    shareTitle: 'Hesabu yangu ya VAT - Jawabu TZ',
    shareText: function(v, r){ return 'Bei bila VAT: TSh ' + fmt(r.net) + '\nVAT (' + r.r + '%): TSh ' + fmt(r.vat) + '\nBei kamili: TSh ' + fmt(r.gross); },
    view: view,
    histRow: function(v, r){ return {title: 'TSh ' + fmt(r.m === 'a' ? r.gross : r.net), label: r.m === 'a' ? 'Imeongezwa VAT' : 'Imeondolewa VAT', value: 'VAT ' + fmt(r.vat)}; },
    histDetail: function(v, r){
      return '<li><span>Njia</span><b>' + (r.m === 'a' ? 'Ongeza VAT' : 'Ondoa VAT') + '</b></li><li><span>Bei bila VAT</span><b>TSh ' + fmt(r.net) + '</b></li>' +
        '<li><span>VAT (' + r.r + '%)</span><b>TSh ' + fmt(r.vat) + '</b></li><li><span>Bei kamili</span><b>TSh ' + fmt(r.gross) + '</b></li>';
    },
    onRender: function(v){
      var a = mode(v) === 'a';
      press('mSeg', 'data-m', mode(v)); press('rSeg', 'data-rt', String(rate(v)));
      $('vLbl').textContent = a ? 'Bei bila VAT' : 'Bei kamili (pamoja na VAT)';
      $('vHint').textContent = a ? 'Weka bei kabla ya VAT, tutaongeza VAT.' : 'Weka bei iliyojumuisha VAT, tutaiondoa.';
    }
  });
})();