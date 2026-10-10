(function(){
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

  var form = document.getElementById('payeForm');
  if(!form) return;
  var salary = document.getElementById('salary'),
      other  = document.getElementById('other'),
      nssfOn = document.getElementById('nssfOn'),
      out    = document.getElementById('payeResult');

  function num(v){ return parseInt(String(v).replace(/[^\d]/g,''), 10) || 0; }
  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }
  function money(el){
    el.addEventListener('input', function(){
      var n = num(el.value);
      el.value = n ? fmt(n) : '';
      render();
    });
  }

  function render(){
    var g = num(salary.value);
    if(!g){
      out.innerHTML = '<div class="res-empty">Weka mshahara wako wa kila mwezi, jibu litaonekana hapa papo hapo.</div>';
      return;
    }
    var nssf = nssfOn.checked ? Math.round(g * 0.10) : 0;
    var paye = calcPaye(g);
    var oth  = num(other.value);
    var net  = g - nssf - paye - oth;
    var warn = '';
    if(net < 0){ net = 0; warn = '<div class="warn">Makato yako yanazidi mshahara. Angalia tena kiasi cha makato mengine.</div>'; }
    var pct = function(x){ return (x / g * 100).toFixed(2); };
    var rate = (paye / g * 100).toFixed(1);

    out.innerHTML =
      warn +
      '<div class="res-main"><small>Mshahara wa kuchukua nyumbani</small><strong>TSh ' + fmt(net) + '</strong></div>' +
      '<div class="bar" aria-hidden="true">' +
        '<i style="width:' + pct(net)  + '%;background:#4F46E5"></i>' +
        '<i style="width:' + pct(nssf) + '%;background:#22D3EE"></i>' +
        '<i style="width:' + pct(paye) + '%;background:#F59E0B"></i>' +
        '<i style="width:' + pct(oth)  + '%;background:#94A3B8"></i>' +
      '</div>' +
      '<ul class="res-rows">' +
        '<li><span>Mshahara ghafi</span><b>TSh ' + fmt(g) + '</b></li>' +
        '<li><span><i class="dot" style="background:#22D3EE"></i>NSSF (10%)</span><b>TSh ' + fmt(nssf) + '</b></li>' +
        '<li><span><i class="dot" style="background:#F59E0B"></i>PAYE (kodi ya mshahara)</span><b>TSh ' + fmt(paye) + '</b></li>' +
        (oth ? '<li><span><i class="dot" style="background:#94A3B8"></i>Makato mengine</span><b>TSh ' + fmt(oth) + '</b></li>' : '') +
        '<li><span><i class="dot" style="background:#4F46E5"></i>Unachochukua</span><b>TSh ' + fmt(net) + '</b></li>' +
      '</ul>' +
      '<p class="rate">Kiwango halisi cha PAYE: <b>' + rate + '%</b> ya mshahara wako.</p>';
  }

  money(salary); money(other);
  nssfOn.addEventListener('change', render);
  form.addEventListener('submit', function(e){
    e.preventDefault();
    render();
    out.scrollIntoView({behavior:'smooth', block:'start'});
  });
  render();
})();