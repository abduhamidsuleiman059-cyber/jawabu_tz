/* Jawabu TZ - dirisha la uthibitisho (linachukua nafasi ya confirm()) */
(function(){
  var box, onYes, lastFocus, timer;

  function build(){
    box = document.createElement('div');
    box.className = 'cm';
    box.hidden = true;
    box.innerHTML =
      '<div class="cm-bg" data-no></div>' +
      '<div class="cm-card" role="alertdialog" aria-modal="true" aria-labelledby="cmText">' +
        '<div class="cm-ic" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/></svg></div>' +
        '<p class="cm-text" id="cmText"></p>' +
        '<p class="cm-sub">Kitendo hiki hakiwezi kurudishwa.</p>' +
        '<div class="cm-btns"><button type="button" class="cm-cancel" data-no>Ghairi</button><button type="button" class="cm-ok" data-yes>Futa</button></div>' +
      '</div>';
    document.body.appendChild(box);
    box.addEventListener('click', function(e){
      if(e.target.closest('[data-yes]')){ var f = onYes; close(); if(f) f(); }
      else if(e.target.closest('[data-no]')) close();
    });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !box.hidden) close(); });
  }

  function close(){
    if(!box || box.hidden) return;
    onYes = null;
    box.classList.remove('show');
    box.hidden = true;                         // inafungwa mara moja
    if(lastFocus && lastFocus.focus){ try{ lastFocus.focus({preventScroll: true}); }catch(e){} }
  }

  window.JawabuConfirm = function(text, yes, okLabel){
    if(!box) build();
    lastFocus = document.activeElement;
    onYes = yes;
    box.querySelector('#cmText').textContent = text;
    box.querySelector('.cm-ok').textContent = okLabel || 'Futa';
    box.hidden = false; void box.offsetWidth;
    box.classList.add('show');
    box.querySelector('.cm-cancel').focus();
  };
})();