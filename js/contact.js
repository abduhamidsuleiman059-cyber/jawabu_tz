(function(){
  var CONTACT_EMAIL = 'jawabu.tz.help@gmail.com';
  /* Hiari: kiungo cha fomu (Formspree) ili ujumbe ufike moja kwa moja bila programu ya barua pepe.
     Mfano: 'https://formspree.io/f/xxxxxxxx'. Ukiiacha tupu, fomu inafungua programu ya barua pepe. */
  var FORM_ENDPOINT = '';

  var $ = function(id){ return document.getElementById(id); };

  /* viungo vyote vya barua pepe kwenye kurasa (privacy, about, contact) */
  document.querySelectorAll('[data-mail]').forEach(function(el){
    if(CONTACT_EMAIL){ el.textContent = CONTACT_EMAIL; el.setAttribute('href', 'mailto:' + CONTACT_EMAIL); }
    else { el.textContent = 'itawekwa hivi karibuni'; el.removeAttribute('href'); el.style.textDecoration = 'none'; }
  });

  var form = $('cForm'); if(!form) return;
  try { /* ?mada=pendekeza | hitilafu | maoni | ushirikiano */
    var M = {maoni: 0, hitilafu: 1, pendekeza: 2, ushirikiano: 3}, m = new URLSearchParams(location.search).get('mada');
    if(m && M[m] !== undefined) $('cSub').selectedIndex = M[m];
  } catch(e){}
  var st = $('cStat');
  function say(msg, kind){ st.textContent = msg; st.className = 'cstat on ' + kind; }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var name = $('cName').value.trim(), mail = $('cMail').value.trim(), sub = $('cSub').value, msg = $('cMsg').value.trim();
    if(!name){ say('Tafadhali andika jina lako.', 'err'); $('cName').focus(); return; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)){ say('Andika barua pepe sahihi ili tukujibu.', 'err'); $('cMail').focus(); return; }
    if(msg.length < 10){ say('Ujumbe ni mfupi sana. Andika angalau herufi 10.', 'err'); $('cMsg').focus(); return; }
    if(!CONTACT_EMAIL){ say('Barua pepe ya mawasiliano bado haijawekwa kwenye tovuti. Tafadhali jaribu tena baadaye.', 'err'); return; }
    if(FORM_ENDPOINT){
      var btn = form.querySelector('button[type=submit]'); if(btn) btn.disabled = true;
      say('Inatuma ujumbe wako...', 'ok');
      fetch(FORM_ENDPOINT, {
        method: 'POST', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify({name: name, email: mail, _replyto: mail, subject: '[Jawabu TZ] ' + sub, message: msg})
      }).then(function(r){
        if(!r.ok) throw new Error('x');
        form.reset(); say('Asante! Ujumbe wako umetumwa. Tutakujibu hivi karibuni.', 'ok');
      }).catch(function(){
        say('Imeshindwa kutuma. Jaribu tena au tuandikie: ' + CONTACT_EMAIL, 'err');
      }).then(function(){ if(btn) btn.disabled = false; });
      return;
    }
    var body = msg + '\n\n---\nJina: ' + name + '\nBarua pepe: ' + mail;
    var url = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('[Jawabu TZ] ' + sub) + '&body=' + encodeURIComponent(body);
    say('Tunafungua programu ya barua pepe yako. Bonyeza Tuma ili ujumbe wako ufike. Kama haifunguki, tuandikie: ' + CONTACT_EMAIL, 'ok');
    window.location.href = url;
  });
})();