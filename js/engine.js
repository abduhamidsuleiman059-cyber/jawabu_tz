/* Jawabu TZ - injini ya pamoja ya vikokotoo: fomu, matokeo, historia iliyofichwa, Futa, viungo vya ?query */
(function(){
  var MON = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ago','Sep','Okt','Nov','Des'];
  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }
  function fmt2(n){ return (Math.round(n * 100) / 100).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2}); }

  window.JawabuCalc = {fmt: fmt, fmt2: fmt2, init: function(cfg){
    var form = document.getElementById(cfg.form);
    if(!form) return;
    var out = document.getElementById(cfg.result),
        clearBtn = document.getElementById('clearBtn'),
        saveNote = document.getElementById('saveNote'),
        noteDefault = saveNote ? saveNote.innerHTML : '',
        histOpen = document.getElementById('histOpen'),
        histBadge = document.getElementById('histBadge'),
        sheet = document.getElementById('histSheet'),
        histClose = document.getElementById('histClose'),
        histList = document.getElementById('histList'),
        histClear = document.getElementById('histClear'),
        MAX = 10, hist;

    var els = {};
    cfg.fields.forEach(function(f){ els[f.id] = document.getElementById(f.id); });

    function parse(f, raw){
      if(f.type === 'chk') return !!raw;
      if(f.type === 'dec'){
        var s = String(raw).replace(',', '.').replace(/[^\d.]/g, '');
        var p = s.split('.'); if(p.length > 2) s = p[0] + '.' + p.slice(1).join('');
        return parseFloat(s) || 0;
      }
      return parseInt(String(raw).replace(/[^\d]/g, ''), 10) || 0;
    }
    function read(){
      var v = {};
      cfg.fields.forEach(function(f){
        var e = els[f.id];
        v[f.id] = parse(f, f.type === 'chk' ? e.checked : e.value);
      });
      return v;
    }
    function write(v){
      cfg.fields.forEach(function(f){
        var e = els[f.id], x = v[f.id];
        if(f.type === 'chk') e.checked = !!x;
        else if(f.type === 'money') e.value = x ? fmt(x) : '';
        else e.value = x ? String(x) : '';
      });
    }
    function defaults(){
      var v = {};
      cfg.fields.forEach(function(f){ v[f.id] = f.def !== undefined ? f.def : (f.type === 'chk' ? false : 0); });
      return v;
    }

    var helpers = {
      fmt: fmt, fmt2: fmt2,
      chip: function(){ return hist.length ? '<a href="#" class="js-hist">Historia (' + hist.length + ')</a>' : ''; },
      links: function(arr){
        return '<div class="more-links">' + arr.map(function(l){ return '<a href="' + l[1] + '">' + l[0] + '</a>'; }).join('') + helpers.chip() + '</div>';
      }
    };

    function render(){
      var v = read(), r = cfg.valid(v) ? cfg.calc(v) : null;
      if(cfg.onRender) cfg.onRender(v);
      if(!r){ out.innerHTML = '<div class="res-empty">' + cfg.empty + '</div>'; return; }
      var open = !!out.querySelector('details.steps[open]');
      out.innerHTML = cfg.view(v, r, helpers);
      var d = out.querySelector('details.steps'); if(d && !open && cfg.stepsClosed) d.removeAttribute('open');
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
    function load(){
      try{
        var a = JSON.parse(localStorage.getItem(cfg.key) || '[]');
        return Array.isArray(a) ? a.filter(function(h){ return h && h.v && cfg.valid(h.v); }).slice(0, MAX) : [];
      }catch(e){ return []; }
    }
    function store(){ try{ localStorage.setItem(cfg.key, JSON.stringify(hist)); }catch(e){} }
    hist = load();

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
        histList.innerHTML = '<li class="hist-empty">Bado hujahifadhi hesabu yoyote. Jaza fomu kisha bonyeza <b>Kokotoa</b>.</li>';
        return;
      }
      histList.innerHTML = hist.map(function(h, i){
        var r = cfg.calc(h.v), row = cfg.histRow(h.v, r);
        return '<li class="h-item">' +
          '<div class="h-row">' +
            '<button type="button" class="h-use" data-i="' + i + '" aria-expanded="false">' +
              '<span class="h-main"><b>' + row.title + '</b><small>' + when(h.t) + '</small></span>' +
              '<span class="h-net"><small>' + row.label + '</small><b>' + row.value + '</b></span>' +
              '<span class="h-chev" aria-hidden="true"></span>' +
            '</button>' +
            '<button type="button" class="h-del" data-i="' + i + '" aria-label="Futa hesabu hii">×</button>' +
          '</div>' +
          '<div class="h-detail"><ul class="res-rows">' + cfg.histDetail(h.v, r) + '</ul>' +
            '<button type="button" class="h-reuse" data-i="' + i + '">Tumia tena kwenye fomu</button>' +
          '</div></li>';
      }).join('');
    }

    function addHist(v){
      var top = hist[0];
      if(top && JSON.stringify(top.v) === JSON.stringify(v)){ top.t = Date.now(); }
      else { hist.unshift({t: Date.now(), v: v}); if(hist.length > MAX) hist.length = MAX; }
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
        write(h.v); render(); closeSheet();
        setTimeout(function(){ out.scrollIntoView({behavior: 'smooth', block: 'start'}); }, 260);
      }
    });
    histClear.addEventListener('click', function(){
      if(!hist.length) return;
      JawabuConfirm('Una uhakika unataka kufuta historia yote?', function(){
        hist = [];                                  // setHistory([])
        try{ localStorage.removeItem(cfg.key); }catch(e){}
        renderHist(); render(); resetNote();
      });
    });

    /* ---------- Fomu ---------- */
    cfg.fields.forEach(function(f){
      var e = els[f.id];
      if(f.type === 'chk'){ e.addEventListener('change', render); return; }
      e.addEventListener('input', function(){
        if(f.type === 'money'){ var n = parse(f, e.value); e.value = n ? fmt(n) : ''; }
        else if(f.type === 'dec'){ var s = e.value.replace(',', '.').replace(/[^\d.]/g, ''); var p = s.split('.'); if(p.length > 2) s = p[0] + '.' + p.slice(1).join(''); e.value = s; }
        else { var m = parse(f, e.value); e.value = m ? String(f.max ? Math.min(m, f.max) : m) : ''; }
        render();
      });
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      var v = read();
      if(!cfg.valid(v)){
        var first = cfg.fields.filter(function(f){ return f.type !== 'chk' && !parse(f, els[f.id].value) && !f.optional; })[0];
        if(first) els[first.id].focus();
        return;
      }
      addHist(v); render();
      if(saveNote){
        saveNote.className = 'hint ok';
        saveNote.innerHTML = '✓ Imehifadhiwa kwenye historia. <a href="#" class="js-hist">Tazama historia (' + hist.length + ')</a>';
      }
      out.scrollIntoView({behavior: 'smooth', block: 'start'});
    });

    clearBtn.addEventListener('click', function(){
      write(defaults()); render(); resetNote();
      var f = cfg.fields.filter(function(x){ return x.type !== 'chk'; })[0]; if(f) els[f.id].focus();
    });

    // viungo vya moja kwa moja, mfano ?mshahara=800000
    try{
      var q = new URLSearchParams(location.search), v0 = defaults(), any = false;
      cfg.fields.forEach(function(f){
        if(f.q && q.get(f.q) !== null){ v0[f.id] = f.type === 'chk' ? q.get(f.q) !== '0' : parse(f, q.get(f.q)); any = true; }
      });
      if(any) write(v0); else write(v0);
    }catch(e){ write(defaults()); }

    render(); renderHist();
  }};
})();