(function(){
  var RATE = 0.15; // HESLB: 15% ya mshahara ghafi
  var form = document.getElementById('heslbForm');
  if(!form) return;
  var salary = document.getElementById('salary'),
      debt = document.getElementById('debt'),
      out    = document.getElementById('heslbResult'),
      clearBtn  = document.getElementById('clearBtn'),
      saveNote  = document.getElementById('saveNote'),
      noteDefault = saveNote ? saveNote.innerHTML : '',
      histOpen  = document.getElementById('histOpen'),
      histBadge = document.getElementById('histBadge'),
      sheet     = document.getElementById('histSheet'),
      histClose = document.getElementById('histClose'),
      histList  = document.getElementById('histList'),
      histClear = document.getElementById('histClear'),
      relPaye   = document.getElementById('relPaye'),
      relNssf   = document.getElementById('relNssf');

  function num(v){ return parseInt(String(v).replace(/[^\d]/g,''), 10) || 0; }
  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }
  function calc(g, d){
    var cut = Math.round(g * RATE), months = d > 0 ? Math.ceil(d / cut) : 0;
    return {cut: cut, net: g - cut, yr: cut * 12, months: months};
  }
  function dur(m){
    var y = Math.floor(m / 12), r = m % 12, p = [];
    if(y) p.push((y === 1 ? 'mwaka ' : 'miaka ') + y);
    if(r) p.push((r === 1 ? 'mwezi ' : 'miezi ') + r);
    return p.join(' na ') || 'chini ya mwezi 1';
  }

  function render(){
    var g = num(salary.value), d = num(debt.value);
    if(relPaye) relPaye.href = g ? 'paye.html?mshahara=' + g : 'paye.html';
    if(relNssf) relNssf.href = g ? 'nssf.html?mshahara=' + g : 'nssf.html';
    if(!g){
      out.innerHTML = '<div class="res-empty">Weka mshahara wako wa kila mwezi, jibu litaonekana hapa papo hapo.</div>';
      return;
    }
    var r = calc(g, d);
    out.innerHTML =
      '<div class="res-main"><small>Makato ya HESLB kwa mwezi</small><strong>TSh ' + fmt(r.cut) + '</strong></div>' +
      '<div class="bar" aria-hidden="true">' +
        '<i style="width:85%;background:#22D3EE"></i><i style="width:15%;background:#F59E0B"></i>' +
      '</div>' +
      '<ul class="res-rows">' +
        '<li><span>Mshahara ghafi</span><b>TSh ' + fmt(g) + '</b></li>' +
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
      '<div class="more-links">' +
        '<a href="paye.html?mshahara=' + g + '">Kokotoa PAYE</a>' +
        '<a href="nssf.html?mshahara=' + g + '">Kokotoa NSSF</a>' +
        (hist.length ? '<a href="#" class="js-hist">Historia (' + hist.length + ')</a>' : '') +
      '</div>';
  }

  /* ---------- Paneli ya historia ---------- */
  var sheetTimer, lastFocus;
  function openSheet(){
    clearTimeout(sheetTimer);
    lastFocus = document.activeElement;
    sheet.hidden = false; void sheet.offsetWidth;
    sheet.classList.add('show');
    document.body.classList.add('sheet-open');
    if(histOpen) histOpen.setAttribute('aria-expanded', 'true');
    histClose.focus();
  }
  function closeSheet(){
    if(sheet.hidden) return;
    sheet.classList.remove('show');
    document.body.classList.remove('sheet-open');
    if(histOpen) histOpen.setAttribute('aria-expanded', 'false');
    sheetTimer = setTimeout(function(){ sheet.hidden = true; }, 230);
    if(lastFocus && lastFocus.focus){ try{ lastFocus.focus({preventScroll: true}); }catch(e){} }
  }
  if(histOpen) histOpen.addEventListener('click', openSheet);
  histClose.addEventListener('click', closeSheet);
  sheet.addEventListener('click', function(e){ if(e.target.closest('[data-close]')) closeSheet(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeSheet(); });
  document.addEventListener('click', function(e){
    if(e.target.closest('.js-hist')){ e.preventDefault(); openSheet(); }
  });

  /* ---------- Historia (kwenye kifaa tu) ---------- */
  var KEY = 'jawabu_heslb_history_v1', MAX = 10;
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
    if(histBadge){ histBadge.textContent = hist.length; histBadge.hidden = !hist.length; }
    if(!hist.length){
      histList.innerHTML = '<li class="hist-empty">Bado hujahifadhi hesabu yoyote. Weka mshahara kisha bonyeza <b>Kokotoa</b>.</li>';
      return;
    }
    histList.innerHTML = hist.map(function(h, i){
      var r = calc(h.g, h.d);
      return '<li class="h-item">' +
        '<div class="h-row">' +
          '<button type="button" class="h-use" data-i="' + i + '" aria-expanded="false">' +
            '<span class="h-main"><b>TSh ' + fmt(h.g) + '</b><small>' + when(h.t) + '</small></span>' +
            '<span class="h-net"><small>HESLB/mwezi</small><b>TSh ' + fmt(r.cut) + '</b></span>' +
            '<span class="h-chev" aria-hidden="true"></span>' +
          '</button>' +
          '<button type="button" class="h-del" data-i="' + i + '" aria-label="Futa hesabu hii">×</button>' +
        '</div>' +
        '<div class="h-detail">' +
          '<ul class="res-rows">' +
            '<li><span>Makato ya HESLB (15%)</span><b>TSh ' + fmt(r.cut) + '</b></li>' +
            '<li><span>Mshahara baada ya HESLB</span><b>TSh ' + fmt(r.net) + '</b></li>' +
            (h.d ? '<li><span>Muda wa kumaliza deni</span><b>' + dur(r.months) + '</b></li>' : '') +
          '</ul>' +
          '<button type="button" class="h-reuse" data-i="' + i + '">Tumia tena kwenye fomu</button>' +
        '</div>' +
      '</li>';
    }).join('');
  }

  function addHist(g, d){
    var top = hist[0];
    if(top && top.g === g && top.d === d){ top.t = Date.now(); }
    else { hist.unshift({t: Date.now(), g: g, d: d}); if(hist.length > MAX) hist.length = MAX; }
    store(); renderHist();
  }
  function resetNote(){ if(saveNote){ saveNote.className = 'hint'; saveNote.innerHTML = noteDefault; } }

  histList.addEventListener('click', function(e){
    var del = e.target.closest('.h-del'), use = e.target.closest('.h-use'), re = e.target.closest('.h-reuse');
    if(del){
      hist.splice(+del.getAttribute('data-i'), 1);
      store(); renderHist(); render();
      if(!hist.length) resetNote();
    } else if(use){
      var open = use.closest('.h-item').classList.toggle('open');
      use.setAttribute('aria-expanded', open ? 'true' : 'false');
    } else if(re){
      var h = hist[+re.getAttribute('data-i')];
      if(!h) return;
      salary.value = fmt(h.g); debt.value = h.d ? fmt(h.d) : '';
      render(); closeSheet();
      setTimeout(function(){ out.scrollIntoView({behavior: 'smooth', block: 'start'}); }, 260);
    }
  });
  histClear.addEventListener('click', function(){
    if(!hist.length) return;
    if(window.confirm('Futa historia yote ya hesabu?')){
      hist = []; store(); renderHist(); render(); resetNote();
    }
  });

  /* ---------- Fomu ---------- */
  salary.addEventListener('input', function(){
    var n = num(salary.value); salary.value = n ? fmt(n) : ''; render();
  });
  debt.addEventListener('input', function(){
    var n = num(debt.value); debt.value = n ? fmt(n) : ''; render();
  });

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var g = num(salary.value);
    if(!g){ salary.focus(); return; }
    addHist(g, num(debt.value));
    render();
    if(saveNote){
      saveNote.className = 'hint ok';
      saveNote.innerHTML = '✓ Imehifadhiwa kwenye historia. <a href="#" class="js-hist">Tazama historia (' + hist.length + ')</a>';
    }
    out.scrollIntoView({behavior: 'smooth', block: 'start'});
  });

  clearBtn.addEventListener('click', function(){
    salary.value = ''; debt.value = '';
    render(); resetNote(); salary.focus();
  });

  // Kiungo cha moja kwa moja: heslb.html?mshahara=800000 (&deni=12000000)
  try{
    var q = new URLSearchParams(location.search), mm = num(q.get('mshahara'));
    if(mm) salary.value = fmt(mm);
    var dd = num(q.get('deni')); if(dd) debt.value = fmt(dd);
  }catch(e){}

  render();
  renderHist();
})();