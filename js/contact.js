/* Jawabu TZ - mawasiliano: weka barua pepe yako hapa chini (mahali PEKEE panapohitaji kubadilishwa) */
(function(){
  var CONTACT_EMAIL = ''; // <-- WEKA BARUA PEPE YA JAWABU TZ HAPA, mfano: 'jina@gmail.com'

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
    var body = msg + '\n\n---\nJina: ' + name + '\nBarua pepe: ' + mail;
    var url = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('[Jawabu TZ] ' + sub) + '&body=' + encodeURIComponent(body);
    say('Tunafungua programu ya barua pepe yako. Bonyeza Tuma ili ujumbe wako ufike.', 'ok');
    window.location.href = url;
  });
})();