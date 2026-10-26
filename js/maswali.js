/* Jawabu TZ - ukurasa wa Maswali: kutafuta na kuchuja kwa kundi (?kundi=pesa&q=paye) */
(function(){
  var $ = function(id){ return document.getElementById(id); };
  var items = [].slice.call(document.querySelectorAll('#fList .faq'));
  var tabs = [].slice.call(document.querySelectorAll('#fTabs [data-tab]'));
  var input = $('fq'), count = $('fCount'), empty = $('fEmpty');
  var tab = 'all';

  function norm(s){ return String(s || '').toLowerCase(); }
  function render(){
    var q = norm(input.value).trim(), n = 0;
    items.forEach(function(el){
      var ok = (tab === 'all' || el.getAttribute('data-cat') === tab) && (!q || norm(el.textContent).indexOf(q) > -1);
      el.hidden = !ok; if(ok) n++;
    });
    count.textContent = n ? 'Maswali ' + n + (q ? ' yamepatikana' : '') : '';
    empty.classList.toggle('on', n === 0);
    tabs.forEach(function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-tab') === tab ? 'true' : 'false'); });
  }
  tabs.forEach(function(b){ b.addEventListener('click', function(){ tab = b.getAttribute('data-tab'); render(); }); });
  input.addEventListener('input', render);

  try {
    var u = new URLSearchParams(location.search), k = u.get('kundi'), q = u.get('q');
    if(k && tabs.some(function(b){ return b.getAttribute('data-tab') === k; })) tab = k;
    if(q) input.value = q.slice(0, 80);
  } catch(e){}
  render();
})();