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

  // sehemu za mshahara zilizotumika (kwa jedwali la hatua)
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

  var form = document.getElementById('payeForm');
  if(!form) return;
  var salary = document.getElementById('salary'),
      other  = document.getElementById('other'),
      nssfOn = document.getElementById('nssfOn'),
      out    = document.getElementById('payeResult'),
      clearBtn = document.getElementById('clearBtn'),
      histList = document.getElementById('histList'),
      histClear = document.getElementById('histClear'),
      saveNote = document.getElementById('saveNote'),
      noteDefault = saveNote ? saveNote.innerHTML : '';

  function num(v){ return parseInt(String(v).replace(/[^\d]/g,''), 10) || 0; }
  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }

  function calc(g, withNssf, oth){
    var nssf = withNssf ? Math.round(g * 0.10) : 0;
    var paye = calcPaye(g);
    var net = g - nssf - paye - (oth || 0);
    return {nssf: nssf, paye: paye, net: Math.max(0, net), over: net < 0};
  }

  /* ---------- Hatua za hesabu ---------- */
  function stepsHtml(g, paye, open){
    var list = steps(g), used = 0;
    var rows = list.map(function(s, i){
      var tax = (i === list.length - 1) ? paye - used : Math.round(s.amt * s.rate);
      used += tax;
      return '<tr><td>' + fmt(s.from) + ' hadi ' + fmt(s.to) + '</td><td>' + fmt(s.amt) + ' × ' + Math.round(s.rate * 100) + '%</td><td>' + fmt(tax) + '</td></tr>';
    }).join('');
    return '<details class="steps"' + (open ? ' open' : '') + '><summary>Ona hatua za hesabu</summary>' +
      '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Sehemu ya mshahara</th><th>Hesabu</th><th>Kodi</th></tr></thead><tbody>' + rows +
      '</tbody><tfoot><tr><td colspan="2">Jumla ya PAYE</td><td>' + fmt(paye) + '</td></tr></tfoot></table></div></details>';
  }

  /* ---------- Matokeo ---------- */
  function render(){
    var g = num(salary.value);
    if(!g){
      out.innerHTML = '<div class="res-empty">Weka mshahara wako wa kila mwezi, jibu litaonekana hapa papo hapo.</div>';
      return;
    }
    var open = !!out.querySelector('details.steps[open]');
    var oth = num(other.value);
    var r = calc(g, nssfOn.checked, oth);
    var warn = r.over ? '<div class="warn">Makato yako yanazidi mshahara. Angalia tena kiasi cha makato mengine.</div>' : '';
    var pct = function(x){ return (x / g * 100).toFixed(2); };
    var rate = (r.paye / g * 100).toFixed(1);

    out.innerHTML =
      warn +
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
      '<p class="rate">Kiwango halisi cha PAYE: <b>' + rate + '%</b> ya mshahara wako.</p>' +
      stepsHtml(g, r.paye, open) +
      '<div class="more-links">' +
        '<a href="nssf.html?mshahara=' + g + '">Maelezo zaidi ya NSSF</a>' +
        '<a href="#viwango">Viwango vya PAYE</a>' +
        (hist.length ? '<a href="#histCard" class="js-hist">Historia (' + hist.length + ')</a>' : '') +
      '</div>';
  }

  /* ---------- Historia (inakaa kwenye kifaa tu) ---------- */
  var KEY = 'jawabu_paye_history_v1', MAX = 10;
  var MON = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ago','Sep','Okt','Nov','Des'];

  function load(){
    try{
      var a = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(a) ? a.filter(function(h){ return h && h.g > 0; }).slice(0, MAX) : [];
    }catch(e){ return []; }
  }
  function store(){ try{ localStorage.setItem(KEY, JSON.stringify(hist)); }catch(e){} }
  var hist = load();

  function when(ts){
    var d = new Date(ts), n = new Date();
    var hh = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    var day = function(x){ return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); };
    var diff = Math.round((day(n) - day(d)) / 86400000);
    if(diff === 0) return 'Leo ' + hh;
    if(diff === 1) return 'Jana ' + hh;
    return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + hh;
  }

  function renderHist(){
    histClear.disabled = !hist.length;
    if(!hist.length){
      histList.innerHTML = '<li class="hist-empty">Bado hujahifadhi hesabu yoyote. Weka mshahara kisha bonyeza <b>Kokotoa</b>.</li>';
      return;
    }
    histList.innerHTML = hist.map(function(h, i){
      var r = calc(h.g, h.n, h.o);
      return '<li class="h-item">' +
        '<div class="h-row">' +
          '<button type="button" class="h-use" data-i="' + i + '" aria-expanded="false">' +
            '<span class="h-main"><b>TSh ' + fmt(h.g) + '</b><small>' + when(h.t) + '</small></span>' +
            '<span class="h-net"><small>Mkononi</small><b>TSh ' + fmt(r.net) + '</b></span>' +
            '<span class="h-chev" aria-hidden="true"></span>' +
          '</button>' +
          '<button type="button" class="h-del" data-i="' + i + '" aria-label="Futa hesabu hii">×</button>' +
        '</div>' +
        '<div class="h-detail">' +
          '<ul class="res-rows">' +
            '<li><span>Mshahara ghafi</span><b>TSh ' + fmt(h.g) + '</b></li>' +
            '<li><span>NSSF' + (h.n ? ' (10%)' : ' (haikukatwa)') + '</span><b>TSh ' + fmt(r.nssf) + '</b></li>' +
            '<li><span>PAYE</span><b>TSh ' + fmt(r.paye) + '</b></li>' +
            (h.o ? '<li><span>Makato mengine</span><b>TSh ' + fmt(h.o) + '</b></li>' : '') +
            '<li><span>Unachochukua</span><b>TSh ' + fmt(r.net) + '</b></li>' +
          '</ul>' +
          '<button type="button" class="h-reuse" data-i="' + i + '">Tumia tena kwenye fomu</button>' +
        '</div>' +
      '</li>';
    }).join('');
  }

  function addHist(g, n, o){
    var top = hist[0];
    if(top && top.g === g && top.n === n && top.o === o){ top.t = Date.now(); }
    else { hist.unshift({t: Date.now(), g: g, n: n, o: o}); if(hist.length > MAX) hist.length = MAX; }
    store(); renderHist();
  }

  histList.addEventListener('click', function(e){
    var del = e.target.closest('.h-del'),
        use = e.target.closest('.h-use'),
        re  = e.target.closest('.h-reuse');
    if(del){
      hist.splice(+del.getAttribute('data-i'), 1);
      store(); renderHist(); render();
      if(!hist.length && saveNote){ saveNote.className = 'hint'; saveNote.innerHTML = noteDefault; }
    } else if(use){
      var li = use.closest('.h-item');
      var open = li.classList.toggle('open');
      use.setAttribute('aria-expanded', open ? 'true' : 'false');
    } else if(re){
      var h = hist[+re.getAttribute('data-i')];
      if(!h) return;
      salary.value = fmt(h.g);
      other.value = h.o ? fmt(h.o) : '';
      nssfOn.checked = !!h.n;
      render();
      out.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  });

  // "Tazama historia": nenda kwenye historia na ufungue hesabu ya kwanza
  function showHistory(){
    var card = document.getElementById('histCard');
    if(!card) return;
    card.scrollIntoView({behavior: 'smooth', block: 'start'});
    var first = histList.querySelector('.h-item');
    if(first){
      first.classList.add('open');
      first.querySelector('.h-use').setAttribute('aria-expanded', 'true');
    }
  }
  document.addEventListener('click', function(e){
    if(e.target.closest('.js-hist')){ e.preventDefault(); showHistory(); }
  });

  histClear.addEventListener('click', function(){
    if(!hist.length) return;
    if(window.confirm('Futa historia yote ya hesabu?')){
      hist = []; store(); renderHist(); render();
      if(saveNote){ saveNote.className = 'hint'; saveNote.innerHTML = noteDefault; }
    }
  });

  /* ---------- Fomu ---------- */
  function money(el){
    el.addEventListener('input', function(){
      var n = num(el.value);
      el.value = n ? fmt(n) : '';
      render();
    });
  }
  money(salary); money(other);
  nssfOn.addEventListener('change', render);

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var g = num(salary.value);
    if(!g){ salary.focus(); return; }
    addHist(g, nssfOn.checked ? 1 : 0, num(other.value));
    render();
    if(saveNote){
      saveNote.className = 'hint ok';
      saveNote.innerHTML = '✓ Imehifadhiwa kwenye historia. <a href="#histCard" class="js-hist">Tazama historia (' + hist.length + ')</a>';
    }
    out.scrollIntoView({behavior: 'smooth', block: 'start'});
  });

  clearBtn.addEventListener('click', function(){
    salary.value = ''; other.value = ''; nssfOn.checked = true;
    render(); salary.focus();
    if(saveNote){ saveNote.className = 'hint'; saveNote.innerHTML = noteDefault; }
  });

  // Kiungo cha moja kwa moja: paye.html?mshahara=800000 (&nssf=0 &makato=50000)
  try{
    var q = new URLSearchParams(location.search), m = num(q.get('mshahara'));
    if(m){
      salary.value = fmt(m);
      if(q.get('nssf') === '0') nssfOn.checked = false;
      var mo = num(q.get('makato')); if(mo) other.value = fmt(mo);
    }
  }catch(e){}

  render();
  renderHist();
})();