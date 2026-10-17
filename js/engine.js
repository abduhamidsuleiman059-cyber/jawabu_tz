/* Jawabu TZ - injini ya pamoja ya vikokotoo: fomu, matokeo, historia iliyofichwa, Futa, viungo vya ?query */
(function(){
  var MON = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ago','Sep','Okt','Nov','Des'];
  function fmt(n){ return Math.round(n).toLocaleString('en-US'); }
  function fmt2(n){ return (Math.round(n * 100) / 100).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2}); }

  var ICON = {
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
    redo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    share: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>',
    empty: '<svg viewBox="0 0 120 96" aria-hidden="true"><rect x="30" y="8" width="60" height="80" rx="10" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.28)" stroke-width="2"/><rect x="40" y="18" width="40" height="14" rx="4" fill="rgba(34,211,238,.25)"/><g fill="rgba(255,255,255,.22)"><rect x="40" y="40" width="10" height="8" rx="2"/><rect x="55" y="40" width="10" height="8" rx="2"/><rect x="70" y="40" width="10" height="8" rx="2"/><rect x="40" y="54" width="10" height="8" rx="2"/><rect x="55" y="54" width="10" height="8" rx="2"/><rect x="70" y="54" width="10" height="8" rx="2"/><rect x="40" y="68" width="25" height="8" rx="2"/><rect x="70" y="68" width="10" height="8" rx="2"/></g><circle cx="92" cy="74" r="15" fill="#0B1235" stroke="rgba(255,255,255,.35)" stroke-width="2"/><path d="M92 65v10l6 4" fill="none" stroke="#67E8F9" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

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
      if(f.type === 'text') return String(raw == null ? '' : raw).trim().slice(0, 300);
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
        else if(f.type === 'text') e.value = x || '';
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
      var old = out.querySelector('details.steps'), wasOpen = old ? old.open : null;
      out.innerHTML = cfg.view(v, r, helpers);
      var d = out.querySelector('details.steps'); if(d && wasOpen !== null) d.open = wasOpen;
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
        histList.innerHTML = '<li class="hist-empty">' + ICON.empty + '<b>Hakuna hesabu zilizohifadhiwa</b><span>Jaza fomu kisha bonyeza Kokotoa, hesabu yako itaonekana hapa.</span></li>';
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
            '<button type="button" class="h-del" data-i="' + i + '" aria-label="Futa hesabu hii" title="Futa">' + ICON.trash + '</button>' +
          '</div>' +
          '<div class="h-more">' +
            '<div class="h-detail"><ul class="res-rows">' + cfg.histDetail(h.v, r) + '</ul></div>' +
            '<button type="button" class="h-reuse" data-i="' + i + '">' + ICON.redo + 'Tumia tena kwenye fomu</button>' +
            '<button type="button" class="h-share" data-i="' + i + '">' + ICON.share + 'Shiriki hesabu hii</button>' +
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

    function shareUrl(v){
      var p = [];
      cfg.fields.forEach(function(f){
        if(!f.q) return;
        var x = v[f.id];
        if(f.type === 'chk') p.push(f.q + '=' + (x ? 1 : 0));
        else if(x) p.push(f.q + '=' + (f.type === 'text' ? encodeURIComponent(x) : x));
      });
      var base = location.protocol === 'file:' ? location.href.split('?')[0] : location.origin + location.pathname;
      return base + (p.length ? '?' + p.join('&') : '');
    }
    var toastEl, toastT;
    function toast(msg){
      if(!toastEl){ toastEl = document.createElement('div'); toastEl.className = 'cm-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
      toastEl.textContent = msg; toastEl.classList.add('on');
      clearTimeout(toastT); toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 2200);
    }
    function copy(text){
      if(navigator.clipboard && navigator.clipboard.writeText){
        return navigator.clipboard.writeText(text).then(function(){ toast('Imenakiliwa. Bandika popote ushiriki.'); }, function(){ toast('Imeshindwa kunakili.'); });
      }
      var t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select();
      try{ document.execCommand('copy'); toast('Imenakiliwa. Bandika popote ushiriki.'); }catch(e){ toast('Imeshindwa kunakili.'); }
      document.body.removeChild(t);
    }
    function shareHist(h){
      if(!h) return;
      var r = cfg.calc(h.v), url = shareUrl(h.v);
      var text = (cfg.shareTitle || 'Hesabu yangu') + '\n' + cfg.shareText(h.v, r) + '\n\nKokotoa yako hapa: ' + url;
      if(navigator.share){
        navigator.share({title: cfg.shareTitle || 'Jawabu TZ', text: text}).catch(function(){});
      } else { copy(text); }
    }

    histList.addEventListener('click', function(e){
      var del = e.target.closest('.h-del'), use = e.target.closest('.h-use'), re = e.target.closest('.h-reuse'), sh = e.target.closest('.h-share');
      if(del){
        var di = +del.getAttribute('data-i');
        JawabuConfirm('Futa hesabu hii?', function(){
          hist.splice(di, 1);
          store(); renderHist(); render();
          if(!hist.length) resetNote();
        });
      } else if(sh){
        shareHist(hist[+sh.getAttribute('data-i')]);
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
        if(f.type === 'text'){ render(); return; }
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
      var f = cfg.fields.filter(function(x){ return x.type !== 'chk' && x.type !== 'text'; })[0]; if(f) els[f.id].focus();
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